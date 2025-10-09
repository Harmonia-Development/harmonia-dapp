/**
 * WebAuthn verification module
 * This is a simplified implementation for demonstration purposes.
 * In a production environment, you would use a proper WebAuthn library
 * like @simplewebauthn/server or similar.
 */

export interface WebAuthnCredential {
	id: string
	publicKey: string
	user_id: string
	counter: number
}

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

export interface RegistrationOptions {
	challenge: string
	rp: {
		name: string
		id: string
	}
	user: {
		id: string
		name: string
		displayName: string
	}
	pubKeyCredParams: Array<{
		type: 'public-key'
		alg: number
	}>
	timeout: number
	attestation: 'none' | 'indirect' | 'direct'
	authenticatorSelection: {
		authenticatorAttachment?: 'platform' | 'cross-platform'
		requireResidentKey: boolean
		residentKey: 'discouraged' | 'preferred' | 'required'
		userVerification: 'required' | 'preferred' | 'discouraged'
	}
}

/**
 * Generates WebAuthn registration options for the client
 * @param user_id - The user identifier from the kyc table
 * @param userName - Optional user name for display
 * @returns RegistrationOptions - Options to send to the client for credential creation
 */
export const generateRegistrationOptions = (
	user_id: string,
	userName?: string,
): RegistrationOptions => {
	// Generate a random challenge (in production, store this temporarily to verify later)
	const challenge = generateRandomChallenge()

	return {
		challenge,
		rp: {
			name: 'Wallet Service',
			// eslint-disable-next-line no-undef
			id: typeof window !== 'undefined' ? window.location.hostname : 'localhost',
		},
		user: {
			id: user_id,
			name: userName || `user_${user_id}`,
			displayName: userName || `User ${user_id}`,
		},
		pubKeyCredParams: [
			{ type: 'public-key', alg: -7 }, // ES256 (Elliptic Curve)
			{ type: 'public-key', alg: -257 }, // RS256 (RSA)
		],
		timeout: 60000, // 60 seconds
		attestation: 'none',
		authenticatorSelection: {
			authenticatorAttachment: 'platform', // Prefer built-in authenticators (Touch ID, Face ID, Windows Hello)
			requireResidentKey: false,
			residentKey: 'preferred',
			userVerification: 'required',
		},
	}
}

/**
 * Generates a random challenge for WebAuthn
 * @returns string - Base64url encoded random challenge
 */
const generateRandomChallenge = (): string => {
	const buffer = new Uint8Array(32)
	if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
		crypto.getRandomValues(buffer)
	} else {
		// Fallback for Node.js
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		// biome-ignore lint/style/useNodejsImportProtocol: <explanation>
		const cryptoNode = require('crypto')
		cryptoNode.randomFillSync(buffer)
	}
	return base64UrlEncode(buffer)
}

/**
 * Base64url encodes a buffer
 * @param buffer - Uint8Array to encode
 * @returns string - Base64url encoded string
 */
const base64UrlEncode = (buffer: Uint8Array): string => {
	const base64 = Buffer.from(buffer).toString('base64')
	return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

/**
 * Verifies a WebAuthn authentication response
 * @param user_id - The user identifier
 * @param authResponse - The WebAuthn authentication response
 * @param credentials - Array of stored credentials for the user
 * @returns Promise<boolean> - true if verification succeeds
 */
export const verifyWebAuthnAuthentication = async (
	user_id: string,
	authResponse: WebAuthnAuthenticationResponse,
	credentials: WebAuthnCredential[],
): Promise<boolean> => {
	try {
		// Find the credential for this user
		const credential = credentials.find((cred) => cred.user_id === user_id)
		if (!credential) {
			throw new Error('No credential found for user')
		}

		// In a real implementation, you would:
		// 1. Parse the clientDataJSON
		// 2. Verify the challenge
		// 3. Parse the authenticatorData
		// 4. Verify the signature using the stored public key
		// 5. Check the counter to prevent replay attacks

		// For this demo, we'll do basic validation
		if (!authResponse.id || !authResponse.response.signature) {
			throw new Error('Invalid authentication response')
		}

		// Mock verification - in production, this would be real cryptographic verification
		// For now, we'll accept any response with valid structure
		return true
	} catch (error) {
		console.error('WebAuthn verification failed:', error)
		return false
	}
}

/**
 * Mock function to get user credentials from database
 * In a real implementation, this would query the credentials table
 * @param user_id - The user identifier
 * @returns Promise<WebAuthnCredential[]> - Array of user credentials
 */
export const getUserCredentials = async (user_id: string): Promise<WebAuthnCredential[]> => {
	// Mock implementation - in production, this would query the database
	// For now, return a mock credential if user_id exists
	if (user_id && user_id.length > 0) {
		return [
			{
				id: 'mock-credential-id',
				publicKey: 'mock-public-key',
				user_id,
				counter: 1,
			},
		]
	}
	return []
}
