import express from 'express'
import { z } from 'zod'
import { verifyAuthResponse } from '../auth/webauthn'
import {
	connectDB,
	findCredentialsByKycId,
	findKycById,
	initializeCredentialsTable,
} from '../db/kyc'

const router = express.Router()

const authVerifySchema = z.object({
	user_id: z.string().min(1, 'User ID is required'),
	response: z.object({
		id: z.string(),
		rawId: z.string(),
		response: z.object({
			authenticatorData: z.string(),
			clientDataJSON: z.string(),
			signature: z.string(),
			userHandle: z.string().optional(),
		}),
		type: z.literal('public-key'),
	}),
	challenge: z.string().min(1, 'Challenge is required'),
})

router.post('/', async (req, res) => {
	try {
		const validation = authVerifySchema.safeParse(req.body)

		if (!validation.success) {
			return res.status(400).json({
				error: 'Invalid request data',
				details: validation.error.issues,
			})
		}

		const { user_id, response, challenge } = validation.data
		const userIdNum = Number.parseInt(user_id, 10)

		if (Number.isNaN(userIdNum)) {
			return res.status(400).json({ error: 'Invalid user ID format' })
		}

		const db = await connectDB()
		await initializeCredentialsTable(db)

		const user = await findKycById(db, userIdNum)
		if (!user) {
			return res.status(400).json({ error: 'Invalid user ID' })
		}

		const userCredentials = await findCredentialsByKycId(db, userIdNum)
		if (userCredentials.length === 0) {
			return res.status(401).json({ error: 'No credentials found for user' })
		}

		const matchingCredential = userCredentials.find((cred) => cred.credential_id === response.id)

		if (!matchingCredential) {
			return res.status(401).json({ error: 'Credential not found' })
		}

		const verification = await verifyAuthResponse(response, matchingCredential, challenge)

		if (verification.verified) {
			return res.status(200).json({
				user_id: user_id,
				verified: true,
				message: 'Authentication successful',
			})
		}
		return res.status(401).json({
			error: 'Authentication failed',
			verified: false,
		})
	} catch (error) {
		console.error('Auth verification error:', error)
		return res.status(500).json({
			error: 'Internal server error',
			message: 'Authentication verification failed',
		})
	}
})

export { router as authVerifyRouter }
