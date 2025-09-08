import { type Request, type Response, Router } from 'express'
import { z } from 'zod'
import { connectDB, findKycById, initializeAccountsTable, insertAccount } from '../db/kyc'
import { fundAccount } from '../stellar/fund'
import { generateKeyPair } from '../stellar/keys'
import { encryptPrivateKey, getEncryptionKey } from '../utils/encryption'

export const walletRouter = Router()

const CreateWalletBody = z.object({
	user_id: z.number().int().positive(),
})

/**
 * POST /wallet/create
 * Body: { user_id: number }
 * Flow: validate -> ensure KYC exists -> generate keys -> fund via friendbot -> encrypt secret -> persist -> 201
 */
walletRouter.post('/create', async (req: Request, res: Response) => {
	// validate body
	const parsed = CreateWalletBody.safeParse(req.body)
	if (!parsed.success) {
		return res.status(400).json({ error: 'Invalid user ID' })
	}
	const { user_id } = parsed.data

	try {
		const db = await connectDB()
		await initializeAccountsTable(db) // safe if already created

		// ensure user exists in kyc
		const kyc = await findKycById(db, user_id)
		if (!kyc) {
			return res.status(400).json({ error: 'Invalid user ID' })
		}

		// generate keypair
		const { publicKey, privateKey } = generateKeyPair()

		// fund account on testnet via friendbot
		try {
			await fundAccount(publicKey)
		} catch (err) {
			// Funding or network error → client can retry later
			console.error('friendbot funding failed:', err)
			return res.status(400).json({ error: 'Failed to create account' })
		}

		// encrypt and save
		const key = getEncryptionKey()
		const encrypted = encryptPrivateKey(privateKey, key)

		await insertAccount(db, {
			user_id,
			public_key: publicKey,
			private_key_encrypted: encrypted,
		})

		// respond
		return res.status(201).json({ user_id, public_key: publicKey })
	} catch (err) {
		// Never leak secrets
		console.error('wallet/create error:', err)
		return res.status(500).json({ error: 'Failed to create account' })
	}
})
