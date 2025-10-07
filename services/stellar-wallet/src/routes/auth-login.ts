import { type Request, type Response, Router } from 'express'
import { generateToken } from '../auth/jwt'
import {
	type WebAuthnAuthenticationResponse,
	getUserCredentials,
	verifyWebAuthnAuthentication,
} from '../auth/webauthn'

export const authLoginRouter = Router()

interface LoginRequest {
	user_id: string
	auth_response: WebAuthnAuthenticationResponse
}

interface LoginResponse {
	token: string
	user_id: string
	role: string
}

/**
 * POST /auth/login - Authenticate user with WebAuthn and issue JWT
 */
authLoginRouter.post('/login', async (req: Request, res: Response) => {
	try {
		const { user_id, auth_response } = req.body as LoginRequest

		// Validate required fields
		if (!user_id || typeof user_id !== 'string') {
			return res.status(400).json({ error: 'user_id is required and must be a string' })
		}

		if (!auth_response || typeof auth_response !== 'object') {
			return res.status(400).json({ error: 'auth_response is required and must be an object' })
		}

		// Validate auth_response structure
		if (!auth_response.id || !auth_response.response || !auth_response.response.signature) {
			return res.status(400).json({ error: 'Invalid WebAuthn authentication response format' })
		}

		// Get user credentials from database
		const credentials = await getUserCredentials(user_id)
		if (credentials.length === 0) {
			return res.status(401).json({ error: 'No credentials found for user' })
		}

		// Verify WebAuthn authentication
		const isVerified = await verifyWebAuthnAuthentication(user_id, auth_response, credentials)
		if (!isVerified) {
			return res.status(401).json({ error: 'WebAuthn authentication failed' })
		}

		// Generate JWT token
		const token = generateToken(user_id, 'user')

		// Return success response with token
		const response: LoginResponse = {
			token,
			user_id,
			role: 'user',
		}

		return res.status(200).json(response)
	} catch (error) {
		console.error('Authentication error:', error)
		return res.status(500).json({ error: 'Authentication failed' })
	}
})
