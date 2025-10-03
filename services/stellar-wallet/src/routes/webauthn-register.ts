import { Router, type Request, type Response } from 'express'
import { connectDB } from '../db/kyc'
import { insertWebAuthnCredential } from '../db/webauthn'
import { generateRegistrationOptions, verifyRegistration } from '../auth/webauthn'

export const webauthnRegisterRouter = Router()

/**
 * POST /register/options
 * Generates registration options for a user to register a new biometric credential.
 */
webauthnRegisterRouter.post(
	'/register/otpions',
	async (req: Request, res: Response): Promise<void> => {
		try {
			const { user_id, user_name, user_display_name } = req.body

			if (!user_id || !user_name || !user_display_name) {
				res.status(400).json({
					error: 'Missing required fields: user_id, user_name, user_display_name',
				})
				return
			}

			const options = await generateRegistrationOptions(user_id, user_name, user_display_name)

			res.json(options)
		} catch (error) {
			console.error('Error generating registration options:', error)
			res.status(500).json({ error: 'Failed to generate registration options' })
		}
	},
)

/**
 * POST /register/verify
 * Verifies the registration response from the client and stores the credential.
 */
webauthnRegisterRouter.post(
	'/register/verify',
	async (req: Request, res: Response): Promise<void> => {
		try {
			const { user_id, response } = req.body

			if (!user_id || !response) {
				res.status(400).json({ error: 'Missing required fields: user_id, response' })
				return
			}

			const verification = await verifyRegistration(user_id, response)

			if (!verification.verified || !verification.registrationInfo) {
				res.status(400).json({ error: 'Registration verification failed' })
				return
			}

			const { credential, credentialDeviceType, credentialBackedUp } = verification.registrationInfo

			// Store the credential in the database
			const db = await connectDB()
			await insertWebAuthnCredential(db, {
				user_id: user_id,
				credential_id: Buffer.from(credential.id).toString('base64'),
				public_key: Buffer.from(credential.publicKey).toString('base64'),
				counter: credential.counter,
				transports: response.response.transports,
			})

			res.json({
				verified: true,
				message: 'Registration successful',
				credentialId: Buffer.from(credential.id).toString('base64'),
				deviceType: credentialDeviceType,
				backedUp: credentialBackedUp,
			})
		} catch (error) {
			console.error('Error verifying registration:', error)
			res.status(500).json({ error: 'Failed to verify registration' })
		}
	},
)
