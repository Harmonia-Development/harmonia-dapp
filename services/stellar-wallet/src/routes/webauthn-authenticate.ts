import { Router, type Request, type Response } from 'express'
import { verifyAuthentication, generateAuthenticationOptions } from '../auth/webauthn'

export const webauthnAuthenticateRouter = Router()

/**
 * POST /api/webauthn/authenticate/options
 * Generates authentication options for a user to sign in with biometrics.
 */
webauthnAuthenticateRouter.post(
	'/authenticate/options',
	async (req: Request, res: Response): Promise<void> => {
		try {
			const { user_id } = req.body

			if (!user_id) {
				res.status(400).json({ error: 'Missing required field: user_id' })
				return
			}

			const options = await generateAuthenticationOptions(user_id)

			res.json(options)
		} catch (error) {
			console.error('Error generating authentication options:', error)
			res.status(500).json({ error: 'Failed to generate authentication options' })
		}
	},
)

/**
 * POST /api/webauthn/authenticate/verify
 * Verifies the authentication response from the client.
 */
webauthnAuthenticateRouter.post(
	'authenticate/verify',
	async (req: Request, res: Response): Promise<void> => {
		try {
			const { user_id, response } = req.body

			if (!user_id || !response) {
				res.status(400).json({ error: 'Missing required fields: user_id, response' })
				return
			}

			const verification = await verifyAuthentication(user_id, response)

			if (!verification.verified) {
				res.status(400).json({ error: 'Authentication verification failed' })
				return
			}

			res.json({
				verified: true,
				message: 'Authentication successful',
				user_id: user_id,
			})
		} catch (error) {
			console.error('Error verifying authentication:', error)
			res.status(500).json({ error: 'Failed to verify authentication' })
		}
	},
)
