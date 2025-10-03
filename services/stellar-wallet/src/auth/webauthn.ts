import {
	generateRegistrationOptions as generateRegOptions,
	generateAuthenticationOptions as generateAuthOptions,
	verifyRegistrationResponse,
	verifyAuthenticationResponse,
	type GenerateRegistrationOptionsOpts,
	type GenerateAuthenticationOptionsOpts,
	type VerifyRegistrationResponseOpts,
	type VerifyAuthenticationResponseOpts,
} from '@simplewebauthn/server'
import type { RegistrationResponseJSON, AuthenticationResponseJSON } from '@simplewebauthn/types'
import { connectDB } from '../db/kyc'
import {
	findWebAuthnCredentialsByUserId,
	findWebAuthnCredentialByCredentialId,
	updateWebAuthnCredentialCounter,
	insertWebAuthnChallenge,
	findAndValidateChallenge,
	deleteWebAuthnChallenge,
} from '../db/webauthn'
import dotenv from 'dotenv'

dotenv.config()

/**
 * WebAuthn Relying Party configuration
 */
interface WebAuthnConfig {
	rpName: string
	rpID: string
	origin: string
}

let config: WebAuthnConfig | null = null

/**
 * Initializes the WebAuthn server as a Relying Party with configuration from environment variables.
 * This should be called once during application startup.
 *
 * @throws {Error} If required environment variables are missing
 */
export function configureWebAuthn(): WebAuthnConfig {
	const rpName = process.env.RP_NAME
	const rpID = process.env.RP_ID
	const origin = process.env.ORIGIN

	if (!rpName || !rpID || !origin) {
		throw new Error('Missing required WebAuthn environment variables: RP_NAME, RP_ID, ORIGIN')
	}

	config = {
		rpName,
		rpID,
		origin,
	}

	return config
}

/**
 * Gets the current WebAuthn configuration.
 * Initializes config if not already done.
 */
function getConfig(): WebAuthnConfig {
	if (!config) {
		return configureWebAuthn()
	}
	return config
}

/**
 * Generates WebAuthn registration options for a new user credential.
 * This is used during the registration/enrollment phase when a user wants to
 * register a new biometric authenticator (e.g., fingerprint, Face ID).
 *
 * @param userId - Unique identifier for the user (numeric ID from kyc table)
 * @param userName - User's name or email for display
 * @param userDisplayName - User's display name
 * @returns Registration options to send to the client
 */
export async function generateRegistrationOptions(
	userId: number,
	userName: string,
	userDisplayName: string,
) {
	const cfg = getConfig()
	const db = await connectDB()

	// Get existing credentials to exclude them from re-registration
	const existingCredentials = await findWebAuthnCredentialsByUserId(db, userId)
	const excludeCredentials = existingCredentials.map((cred) => ({
		id: cred.credential_id, // Already a base64 string from the database
		type: 'public-key' as const,
	}))

	const opts: GenerateRegistrationOptionsOpts = {
		rpName: cfg.rpName,
		rpID: cfg.rpID,
		userName,
		userDisplayName,
		userID: new TextEncoder().encode(userId.toString()),
		timeout: 60000,
		authenticatorSelection: {
			authenticatorAttachment: 'platform',
			requireResidentKey: false,
			residentKey: 'preferred',
			userVerification: 'preferred',
		},
		supportedAlgorithmIDs: [-7, -257],
		excludeCredentials: excludeCredentials.length > 0 ? excludeCredentials : undefined,
		attestationType: 'none',
	}

	const options = await generateRegOptions(opts)

	// Store the challenge in the database
	await insertWebAuthnChallenge(db, {
		user_id: userId,
		challenge: options.challenge,
		type: 'registration',
	})

	return options
}

/**
 * Generates WebAuthn authentication options for user login.
 * This is used during the authentication phase when a user wants to
 * sign in using their registered biometric authenticator.
 *
 * @param userId - Unique identifier for the user (numeric ID from kyc table)
 * @returns Authentication options to send to the client
 */
export async function generateAuthenticationOptions(userId: number) {
	const cfg = getConfig()
	const db = await connectDB()

	// Get user's registered credentials
	const credentials = await findWebAuthnCredentialsByUserId(db, userId)
	const allowCredentials = credentials.map((cred) => ({
		id: cred.credential_id, // Already a base64 string from the database
		type: 'public-key' as const,
	}))

	const opts: GenerateAuthenticationOptionsOpts = {
		rpID: cfg.rpID,
		timeout: 60000,
		userVerification: 'preferred',
		allowCredentials: allowCredentials.length > 0 ? allowCredentials : undefined,
	}

	const options = await generateAuthOptions(opts)

	// Store the challenge in the database
	await insertWebAuthnChallenge(db, {
		user_id: userId,
		challenge: options.challenge,
		type: 'authentication',
	})

	return options
}

/**
 * Verifies a registration response from the client.
 * Call this after the user completes the registration ceremony on their device.
 *
 * @param userId - The user identifier (numeric ID from kyc table)
 * @param response - The registration response from the client
 * @returns Verification result with credential data
 */
export async function verifyRegistration(userId: number, response: RegistrationResponseJSON) {
	const cfg = getConfig()
	const db = await connectDB()

	// Extract and validate the challenge
	const clientDataJSON = JSON.parse(
		Buffer.from(response.response.clientDataJSON, 'base64').toString('utf-8'),
	)
	const challenge = clientDataJSON.challenge

	// Find and validate the challenge
	const challengeRecord = await findAndValidateChallenge(db, userId, challenge, 'registration')
	if (!challengeRecord) {
		throw new Error('Invalid or expired challenge')
	}

	const opts: VerifyRegistrationResponseOpts = {
		response,
		expectedChallenge: challenge,
		expectedOrigin: cfg.origin,
		expectedRPID: cfg.rpID,
		requireUserVerification: true,
	}

	const verification = await verifyRegistrationResponse(opts)

	// Delete the used challenge
	await deleteWebAuthnChallenge(db, challengeRecord.id)

	return verification
}

/**
 * Verifies an authentication response from the client.
 * Call this after the user completes the authentication ceremony on their device.
 *
 * @param userId - The user identifier (numeric ID from kyc table)
 * @param response - The authentication response from the client
 * @returns Verification result
 */
export async function verifyAuthentication(userId: number, response: AuthenticationResponseJSON) {
	const cfg = getConfig()
	const db = await connectDB()

	// Extract and validate the challenge
	const clientDataJSON = JSON.parse(
		Buffer.from(response.response.clientDataJSON, 'base64').toString('utf-8'),
	)
	const challenge = clientDataJSON.challenge

	// Find and validate the challenge
	const challengeRecord = await findAndValidateChallenge(db, userId, challenge, 'authentication')
	if (!challengeRecord) {
		throw new Error('Invalid or expired challenge')
	}

	// Get the credential from the database
	const credential = await findWebAuthnCredentialByCredentialId(db, response.id)
	if (!credential) {
		throw new Error('Credential not found')
	}

	// Verify the credential belongs to this user
	if (credential.user_id !== userId) {
		throw new Error('Credential does not belong to this user')
	}

	const opts: VerifyAuthenticationResponseOpts = {
		response,
		expectedChallenge: challenge,
		expectedOrigin: cfg.origin,
		expectedRPID: cfg.rpID,
		credential: {
			id: credential.credential_id, // Already a base64 string
			publicKey: Buffer.from(credential.public_key, 'base64'),
			counter: credential.counter,
		},
		requireUserVerification: true,
	}

	const verification = await verifyAuthenticationResponse(opts)

	// Update the counter to prevent replay attacks
	if (verification.verified) {
		await updateWebAuthnCredentialCounter(
			db,
			credential.credential_id,
			verification.authenticationInfo.newCounter,
		)
	}

	// Delete the used challenge
	await deleteWebAuthnChallenge(db, challengeRecord.id)

	return verification
}

/**
 * Legacy interface for WebAuthn credential (for backward compatibility)
 */
export interface WebAuthnCredential {
	id: string
	publicKey: string
	user_id: string
	counter: number
}

/**
 * Legacy interface for WebAuthn authentication response (for backward compatibility)
 */
export interface WebAuthnAuthenticationResponse {
	id: string
	rawId: string
	response: {
		authenticatorData: string
		clientDataJSON: string
		signature: string
		userHandle?: string
	}
	type: 'public-key'
}

/**
 * Gets user credentials from database (backward compatible with existing login router)
 * @param user_id - The user identifier (string for backward compatibility)
 * @returns Promise<WebAuthnCredential[]> - Array of user credentials
 */
export async function getUserCredentials(user_id: string): Promise<WebAuthnCredential[]> {
	const db = await connectDB()
	const userId = Number.parseInt(user_id, 10)

	if (isNaN(userId)) {
		return []
	}

	const credentials = await findWebAuthnCredentialsByUserId(db, userId)

	return credentials.map((cred) => ({
		id: cred.credential_id,
		publicKey: cred.public_key,
		user_id: cred.user_id.toString(),
		counter: cred.counter,
	}))
}

/**
 * Verifies a WebAuthn authentication response (backward compatible with existing login router)
 * @param user_id - The user identifier (string for backward compatibility)
 * @param authResponse - The WebAuthn authentication response
 * @param credentials - Array of stored credentials for the user (optional, will fetch if not provided)
 * @returns Promise<boolean> - true if verification succeeds
 */
export async function verifyWebAuthnAuthentication(
	user_id: string,
	authResponse: WebAuthnAuthenticationResponse,
	_credentials?: WebAuthnCredential[],
): Promise<boolean> {
	try {
		const userId = Number.parseInt(user_id, 10)

		if (isNaN(userId)) {
			throw new Error('Invalid user ID')
		}

		// Convert the legacy auth response to the format expected by @simplewebauthn
		const response: AuthenticationResponseJSON = {
			id: authResponse.id,
			rawId: authResponse.rawId,
			response: {
				authenticatorData: authResponse.response.authenticatorData,
				clientDataJSON: authResponse.response.clientDataJSON,
				signature: authResponse.response.signature,
				userHandle: authResponse.response.userHandle,
			},
			type: authResponse.type,
			clientExtensionResults: {},
		}

		// Verify using the real implementation
		const verification = await verifyAuthentication(userId, response)

		return verification.verified
	} catch (error) {
		console.error('WebAuthn verification failed:', error)
		return false
	}
}
