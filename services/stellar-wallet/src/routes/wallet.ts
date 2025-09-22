import { type Request, type Response, Router } from 'express'
import { z } from 'zod'
import { requireMatchingUserId } from '../auth/jwt'
import { connectDB, findKycById, initializeAccountsTable, insertAccount } from '../db/kyc'
import { fundAccount } from '../stellar/fund'
import { generateKeyPair } from '../stellar/keys'
import { encryptPrivateKey, getEncryptionKey } from '../utils/encryption'

export const walletRouter = Router()

const CreateWalletBody = z.object({
	user_id: z.number().int().positive(),
})

// Create new wallet for user
walletRouter.post('/create', requireMatchingUserId, async (req: Request, res: Response) => {
	const parsed = CreateWalletBody.safeParse(req.body)
	if (!parsed.success) {
		return res.status(400).json({ error: 'Invalid user ID' })
	}
	const { user_id } = parsed.data

	try {
		const db = await connectDB()
		await initializeAccountsTable(db)

		// Make sure user exists in KYC first
		const kyc = await findKycById(db, user_id)
		if (!kyc) {
			return res.status(400).json({ error: 'Invalid user ID' })
		}

		// Generate keys and fund account
		const { publicKey, privateKey } = generateKeyPair()

		// TODO: should probably check if account already exists first
		try {
			await fundAccount(publicKey)
		} catch (err) {
			console.error('friendbot funding failed:', err)
			return res.status(400).json({ error: 'Failed to create account' })
		}

		// Encrypt the private key for storage
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
