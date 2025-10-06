import { Asset, Memo, Networks, Operation, StrKey, TransactionBuilder } from '@stellar/stellar-sdk'
import type { ServerApi } from '@stellar/stellar-sdk/lib/horizon'
import { type Request, type Response, Router } from 'express'
import { z } from 'zod'
import { jwtMiddleware } from '../auth/jwt'
import {
	connectDB,
	findAccountByUserId,
	findKycById,
	getTransactionsByUserId,
	initializeAccountsTable,
	initializeTransactionsTable,
	insertAccount,
	insertTransaction,
} from '../db/kyc'
import { logError, logger } from '../middlewares/logger'
import { connect } from '../stellar/client'
import { fundAccount } from '../stellar/fund'
import { generateKeyPair } from '../stellar/keys'
import { signTransaction } from '../stellar/sign'
import { encryptPrivateKey, getEncryptionKey } from '../utils/encryption'

export const walletRouter = Router()

// Narrow type to access JWT payload without global augmentation
type AuthRequest = Request & { user?: { user_id: string } }

const CreateWalletBody = z.object({
	user_id: z.number().int().positive(),
})

const SendTransactionBody = z.object({
	user_id: z.number().int().positive(),
	destination: z.string(),
	amount: z.string(), // validated below with regex and range
	asset: z.string().optional().default('native'),
	memo: z.string().optional(),
})

// up to 7 decimals, positive
const AMOUNT_REGEX = /^(?:0|[1-9]\d*)(?:\.\d{1,7})?$/

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
			logError(err, { route: '/wallet/create', stage: 'friendbot_fund' })
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
		logger.info({ message: 'wallet_created', user_id, public_key: publicKey })
		return res.status(201).json({ user_id, public_key: publicKey })
	} catch (err) {
		// Never leak secrets
		logError(err, { route: '/wallet/create' })
		return res.status(500).json({ error: 'Failed to create account' })
	}
})

/**
 * POST /wallet/send
 * Body: { user_id: number, destination: string, amount: string, asset?: string, memo?: string }
 * Protection: jwtMiddleware
 * Flow: validate -> build payment -> sign -> submit -> persist -> respond
 */
walletRouter.post('/send', jwtMiddleware, async (req: Request, res: Response) => {
	// Validate body
	const parsed = SendTransactionBody.safeParse(req.body)
	if (!parsed.success) {
		return res.status(400).json({ error: 'Invalid request body' })
	}
	const { user_id, destination, amount, asset, memo } = parsed.data

	const authReq = req as AuthRequest

	// Verify user_id matches JWT
	if (Number.parseInt(authReq.user?.user_id || '0') !== user_id) {
		return res.status(400).json({ error: 'user_id does not match token' })
	}

	// Validate destination
	if (!StrKey.isValidEd25519PublicKey(destination)) {
		return res.status(400).json({ error: 'invalid destination' })
	}

	// Validate amount format & range
	if (!AMOUNT_REGEX.test(amount)) {
		return res
			.status(400)
			.json({ error: 'amount must be a positive decimal with up to 7 decimals' })
	}
	const amountNum = Number(amount)
	if (amountNum <= 0 || amountNum > 1000) {
		return res.status(400).json({ error: 'amount must be > 0 and ≤ 1000' })
	}

	// Validate asset
	if (asset !== 'native') {
		return res.status(400).json({ error: 'only native asset supported' })
	}

	// Validate memo length in BYTES (≤ 28)
	if (memo && Buffer.byteLength(memo, 'utf8') > 28) {
		return res.status(400).json({ error: 'memo must be ≤ 28 bytes' })
	}

	try {
		const db = await connectDB()
		await initializeTransactionsTable(db)

		// Find user account
		const account = await findAccountByUserId(db, user_id)
		if (!account) {
			return res.status(400).json({ error: 'user account not found' })
		}

		// Connect to Stellar
		const server = connect()

		// Load account to get sequence number
		const sourceAccount = await server.loadAccount(account.public_key)

		// Base fee from Horizon
		const baseFee = String(await server.fetchBaseFee())

		// Build transaction
		const txBuilder = new TransactionBuilder(sourceAccount, {
			fee: baseFee,
			networkPassphrase: Networks.TESTNET,
		})

		// Add payment operation
		txBuilder.addOperation(
			Operation.payment({
				destination,
				asset: Asset.native(),
				amount,
			}),
		)

		// Add memo if provided
		if (memo) {
			txBuilder.addMemo(Memo.text(memo))
		}

		// Set timeout
		txBuilder.setTimeout(30)

		// Build transaction
		const transaction = txBuilder.build()

		// Sign transaction
		const signedTx = await signTransaction(user_id, transaction, db)

		// Submit transaction
		const result = await server.submitTransaction(signedTx)

		// Persist success
		await insertTransaction(db, {
			user_id,
			transaction_hash: result.hash,
			status: 'success',
		})

		logger.info({ message: 'transaction_sent', user_id, hash: result.hash })
		return res.status(201).json({
			user_id,
			transaction_hash: result.hash,
			status: 'success',
		})
	} catch (err: unknown) {
		// Try to persist failure if we can get the hash
		try {
			const db = await connectDB()
			await initializeTransactionsTable(db)

			let hash = 'unknown'
			if (err && typeof err === 'object' && 'hash' in err && typeof err.hash === 'string') {
				hash = err.hash
			}

			await insertTransaction(db, {
				user_id,
				transaction_hash: hash,
				status: 'failed',
			})
		} catch {
			// Ignore persistence errors
		}

		logError(err, { route: '/wallet/send', user_id })
		return res.status(500).json({ error: 'Transaction failed' })
	}
})

/**
 * GET /wallet/transactions/:user_id
 * Protection: jwtMiddleware
 * Flow: validate user_id -> fetch from DB -> enrich with Horizon details -> respond
 */
walletRouter.get('/transactions/:user_id', jwtMiddleware, async (req: Request, res: Response) => {
	const authReq = req as AuthRequest

	// Validate user_id parameter
	const userIdParam = req.params.user_id
	const uid = Number.parseInt(userIdParam, 10)

	if (Number.isNaN(uid) || uid <= 0 || !Number.isInteger(uid)) {
		return res.status(400).json({ error: 'Invalid user_id' })
	}

	// Verify user_id matches JWT
	if (Number.parseInt(authReq.user?.user_id || '0') !== uid) {
		return res.status(403).json({ error: 'Forbidden' })
	}

	try {
		const db = await connectDB()
		await initializeTransactionsTable(db)

		// Fetch transactions from DB
		const txRows = await getTransactionsByUserId(db, uid)

		// If no transactions, return empty array
		if (txRows.length === 0) {
			return res.status(200).json([])
		}

		// Connect to Horizon
		const server = connect()

		// Enrich transactions with Horizon details in parallel
		const enrichedTransactions = await Promise.all(
			txRows.map(async (row) => {
				try {
					// Fetch transaction details for timestamp
					const txDetail = await server.transactions().transaction(row.transaction_hash).call()
					const timestamp = txDetail.created_at

					// Fetch operations for amount and destination
					const opsResponse = await server.operations().forTransaction(row.transaction_hash).call()

					// Find first payment operation
					const paymentOp = opsResponse.records.find(
						(op: ServerApi.OperationRecord) => op.type === 'payment',
					) as ServerApi.PaymentOperationRecord | undefined

					let amount = '0'
					let destination = ''

					if (paymentOp) {
						amount = paymentOp.amount || '0'
						destination = paymentOp.to || ''
					}

					return {
						transaction_hash: row.transaction_hash,
						amount,
						destination,
						status: row.status,
						timestamp,
					}
				} catch (horizonErr) {
					// If Horizon fails for a specific transaction, log and skip enrichment
					logError(horizonErr, {
						route: '/wallet/transactions',
						transaction_hash: row.transaction_hash,
					})
					throw horizonErr // Re-throw to be caught by outer try-catch
				}
			}),
		)

		return res.status(200).json(enrichedTransactions)
	} catch (err) {
		logError(err, { route: '/wallet/transactions', user_id: uid })
		return res.status(500).json({ error: 'Failed to fetch transactions' })
	}
})
