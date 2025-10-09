import {
	type RegistrationResponseJSON,
	type VerifiedRegistrationResponse,
	verifyRegistrationResponse,
} from '@simplewebauthn/server'
import { Router } from 'express'
import type { Request, Response } from 'express'
import { generateRegistrationOptions } from '../auth/webauthn'
import { connectDB, findKycById, initializeCredentialsTable, run } from '../db/kyc'

export const authRegisterRouter = Router()

// In-memory storage for challenges (in production, use Redis or database)
const challenges = new Map<string, string>()

/**
 * POST /auth/register/options
 * Generate WebAuthn registration options
 */
authRegisterRouter.post('/register/options', async (req: Request, res: Response) => {
	try {
		const { user_id } = req.body

		// Validate required field
		if (!user_id) {
			return res.status(400).json({
				error: 'Missing required field: user_id',
			})
		}

		// Validate user_id is a string
		if (typeof user_id !== 'string') {
			return res.status(400).json({
				error: 'user_id must be a string',
			})
		}

		// Verify user_id exists in kyc table
		const db = await connectDB()
		const userId = Number.parseInt(user_id, 10)

		if (Number.isNaN(userId)) {
			return res.status(400).json({
				error: 'Invalid user ID',
			})
		}

		const kycRecord = await findKycById(db, userId)

		if (!kycRecord) {
			return res.status(400).json({
				error: 'Invalid user ID',
			})
		}

		// Generate WebAuthn registration options for the client
		const registrationOptions = generateRegistrationOptions(user_id, kycRecord.name)

		// Store challenge temporarily for verification
		challenges.set(user_id, registrationOptions.challenge)

		res.status(200).json(registrationOptions)
	} catch (error) {
		console.error('Registration options error:', error)
		res.status(500).json({
			error: 'Internal server error',
		})
	}
})

/**
 * POST /auth/register/verify
 * Verify WebAuthn registration response and store credentials
 */
authRegisterRouter.post('/register/verify', async (req: Request, res: Response) => {
	try {
		const { user_id, response } = req.body

		// Validate required fields
		if (!user_id || !response) {
			return res.status(400).json({
				error: 'Missing required fields: user_id and response',
			})
		}

		// Validate user_id is a string
		if (typeof user_id !== 'string') {
			return res.status(400).json({
				error: 'user_id must be a string',
			})
		}

		// Retrieve the stored challenge
		const expectedChallenge = challenges.get(user_id)
		if (!expectedChallenge) {
			return res.status(400).json({
				error: 'No registration challenge found for this user',
			})
		}

		// Verify user_id exists in kyc table
		const db = await connectDB()
		const userId = Number.parseInt(user_id, 10)

		if (Number.isNaN(userId)) {
			return res.status(400).json({
				error: 'Invalid user ID',
			})
		}

		const kycRecord = await findKycById(db, userId)

		if (!kycRecord) {
			return res.status(400).json({
				error: 'Invalid user ID',
			})
		}

		// Get origin and rpID from request or environment
		const origin = req.headers.origin || 'http://localhost:3000'
		const rpID = new URL(origin).hostname

		let verification: VerifiedRegistrationResponse
		try {
			// Verify the registration response using @simplewebauthn/server
			verification = await verifyRegistrationResponse({
				response: response as RegistrationResponseJSON,
				expectedChallenge,
				expectedOrigin: origin,
				expectedRPID: rpID,
			})
		} catch (error) {
			console.error('WebAuthn verification failed:', error)
			return res.status(400).json({
				error: 'Failed to verify WebAuthn response',
			})
		}

		if (!verification.verified) {
			return res.status(400).json({
				error: 'Failed to register credentials',
			})
		}

		// Extract credential data
		const { registrationInfo } = verification
		if (!registrationInfo) {
			return res.status(400).json({
				error: 'Failed to register credentials',
			})
		}

		const { credential } = registrationInfo

		// Convert credential data to base64 for storage
		const credentialIdBase64 = Buffer.from(credential.id).toString('base64')
		const publicKeyBase64 = Buffer.from(credential.publicKey).toString('base64')

		// Ensure credentials table exists
		await initializeCredentialsTable(db)

		// Store credentials in database
		await run(
			db,
			'INSERT INTO credentials (user_id, credential_id, public_key) VALUES (?, ?, ?)',
			user_id,
			credentialIdBase64,
			publicKeyBase64,
		)

		// Remove the used challenge
		challenges.delete(user_id)

		// Return success response
		res.status(201).json({
			user_id,
			credential_id: credentialIdBase64,
		})
	} catch (error) {
		console.error('Registration verification error:', error)

		// Check for duplicate credential error
		if (error instanceof Error && error.message.includes('UNIQUE constraint')) {
			return res.status(400).json({
				error: 'Credential already registered',
			})
		}

		res.status(500).json({
			error: 'Failed to register credentials',
		})
	}
})
