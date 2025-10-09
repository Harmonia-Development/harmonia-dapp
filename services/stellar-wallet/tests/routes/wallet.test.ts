import request from 'supertest'
import type { KycRow } from '../../src/db/kyc'

// Deterministic 32-byte key (Base64)
process.env.ENCRYPTION_KEY = Buffer.alloc(32, 7).toString('base64')

// Types for mocks
type InsertAccountArgs = {
	user_id: number
	public_key: string
	private_key_encrypted: string
}

type InsertTransactionArgs = {
	user_id: number
	transaction_hash: string
	status: string
}

// Helper to take the second argument typed from a mock
function secondArg<T1, T2>(m: jest.Mock<unknown, [T1, T2]>): T2 {
	const call = m.mock.calls[0]
	// For runtime safety
	if (!call || call.length < 2) {
		throw new Error('mock was not called with two arguments')
	}
	return call[1]
}

// Constants
const VALID_PUBLIC_KEY = 'GCCGMBN46TNVH2WL732DYB5WWBEJG5S4UDXAJGB7O3GPQJVVHVQOP5E7'
const MOCK_SECRET = 'SA2XMOCKSECRETPRIVATEKEYFORTESTS01234567'

// Test control variables
let JWT_BEHAVIOR: 'success' | 'fail' = 'success'
let AUTH_USER_ID = '1'

// Mock rate limiting middleware
jest.mock('../../src/middlewares/rate-limit', () => ({
	walletLimiter: jest.fn((req: Request, res: Response, next: NextFunction) => next()),
	authLimiter: jest.fn((req: Request, res: Response, next: NextFunction) => next()),
	kycLimiter: jest.fn((req: Request, res: Response, next: NextFunction) => next()),
}))

// Mock auth JWT
import type { NextFunction, Request, Response } from 'express'

interface JwtPayload {
	user_id: string
	role: string
	iat?: number
	exp?: number
}

interface AuthenticatedRequest extends Request {
	user?: JwtPayload
}

jest.mock('../../src/auth/jwt', () => ({
	jwtMiddleware: jest.fn((req: Request, res: Response, next: NextFunction) => {
		if (JWT_BEHAVIOR === 'fail') {
			return res.status(401).json({ error: 'unauthorized' })
		}
		const authReq = req as AuthenticatedRequest
		authReq.user = { user_id: AUTH_USER_ID, role: 'user' }
		next()
	}),
}))

// Mock stellar-sdk
const mockTransaction = { __signed: false }

const StrKeyMock = {
	isValidEd25519PublicKey: jest.fn().mockReturnValue(true),
}

const TransactionBuilderMock = jest.fn().mockImplementation(() => ({
	addOperation: jest.fn().mockReturnThis(),
	addMemo: jest.fn().mockReturnThis(),
	setTimeout: jest.fn().mockReturnThis(),
	build: jest.fn().mockReturnValue(mockTransaction),
}))

const OperationMock = {
	payment: jest.fn().mockReturnValue({ type: 'payment' }),
}

const AssetMock = {
	native: jest.fn().mockReturnValue({ type: 'native' }),
}

const MemoMock = {
	text: jest.fn().mockReturnValue({ type: 'text' }),
}

const NetworksMock = {
	TESTNET: 'Test SDF Network ; September 2015',
}

jest.mock('@stellar/stellar-sdk', () => ({
	StrKey: StrKeyMock,
	TransactionBuilder: TransactionBuilderMock,
	Operation: OperationMock,
	Asset: AssetMock,
	Memo: MemoMock,
	Networks: NetworksMock,
}))

// Mock stellar client
const loadAccountMock = jest.fn().mockResolvedValue({ accountId: 'SOURCE', sequence: '1' })
const fetchBaseFeeMock = jest.fn().mockResolvedValue(100)
const submitTransactionMock = jest.fn().mockResolvedValue({ hash: 'TXHASH_SUCCESS' })

// Mocks for transaction history endpoint
const transactionCallMock = jest.fn().mockResolvedValue({
	created_at: '2024-01-01T00:00:00Z',
})

const forTransactionCallMock = jest.fn().mockResolvedValue({
	records: [
		{
			type: 'payment',
			to: 'GDESTINATION123',
			amount: '10.0000000',
			asset_type: 'native',
		},
	],
})

const forTransactionMock = jest.fn().mockReturnValue({
	call: forTransactionCallMock,
})

const operationsMock = jest.fn().mockReturnValue({
	forTransaction: forTransactionMock,
})

const transactionMock = jest.fn().mockReturnValue({
	call: transactionCallMock,
})

const transactionsMock = jest.fn().mockReturnValue({
	transaction: transactionMock,
})

const connectMock = jest.fn().mockReturnValue({
	loadAccount: loadAccountMock,
	fetchBaseFee: fetchBaseFeeMock,
	submitTransaction: submitTransactionMock,
	operations: operationsMock,
	transactions: transactionsMock,
})

jest.mock('../../src/stellar/client', () => ({
	connect: connectMock,
}))

// Mock stellar signing
import type { Transaction } from '@stellar/stellar-sdk'

const signTransactionMock = jest.fn().mockImplementation((userId: number, tx: Transaction) => {
	return Promise.resolve(tx)
})

jest.mock('../../src/stellar/sign', () => ({
	signTransaction: signTransactionMock,
}))

// Mock stellar keys
jest.mock('../../src/stellar/keys', () => ({
	generateKeyPair: jest.fn((): { publicKey: string; privateKey: string } => ({
		publicKey: VALID_PUBLIC_KEY,
		privateKey: MOCK_SECRET,
	})),
}))

// Mock friendbot funding (success by default; will override in a test)
const fundMock: jest.Mock<Promise<void>, [string]> = jest.fn().mockResolvedValue(undefined)
jest.mock('../../src/stellar/fund', () => ({
	fundAccount: (publicKey: string): Promise<void> => fundMock(publicKey),
}))

// Mock DB helpers
const connectDBMock = jest.fn().mockResolvedValue({})
const findKycByIdMock: jest.Mock<Promise<KycRow | null>, [unknown, number]> = jest.fn()
const insertAccountMock: jest.Mock<Promise<void>, [unknown, InsertAccountArgs]> = jest
	.fn<Promise<void>, [unknown, InsertAccountArgs]>()
	.mockResolvedValue(undefined)
const initializeAccountsTableMock: jest.Mock<Promise<void>, [unknown?]> = jest
	.fn<Promise<void>, [unknown?]>()
	.mockResolvedValue(undefined)
const initializeTransactionsTableMock = jest.fn().mockResolvedValue(undefined)
const findAccountByUserIdMock = jest.fn().mockResolvedValue({
	id: 10,
	user_id: 1,
	public_key: VALID_PUBLIC_KEY,
	private_key: 'iv:tag:cipher',
})
const insertTransactionMock: jest.Mock<Promise<void>, [unknown, InsertTransactionArgs]> = jest
	.fn<Promise<void>, [unknown, InsertTransactionArgs]>()
	.mockResolvedValue(undefined)

const getTransactionsByUserIdMock: jest.Mock<
	Promise<
		Array<{
			id: number
			user_id: number
			transaction_hash: string
			status: string
		}>
	>,
	[unknown, number]
> = jest.fn().mockResolvedValue([])

jest.mock('../../src/db/kyc', () => {
	const actual = jest.requireActual('../../src/db/kyc')
	return {
		...actual,
		connectDB: connectDBMock,
		findKycById: (db: unknown, id: number): Promise<KycRow | null> => findKycByIdMock(db, id),
		insertAccount: (db: unknown, args: InsertAccountArgs): Promise<void> =>
			insertAccountMock(db, args),
		initializeAccountsTable: (db?: unknown): Promise<void> => initializeAccountsTableMock(db),
		initializeTransactionsTable: initializeTransactionsTableMock,
		findAccountByUserId: findAccountByUserIdMock,
		insertTransaction: (db: unknown, args: InsertTransactionArgs): Promise<void> =>
			insertTransactionMock(db, args),
		getTransactionsByUserId: (
			db: unknown,
			userId: number,
		): Promise<
			Array<{
				id: number
				user_id: number
				transaction_hash: string
				status: string
			}>
		> => getTransactionsByUserIdMock(db, userId),
	}
})

import { app } from '../../src/index'

describe('POST /wallet/create', () => {
	beforeEach(() => {
		jest.clearAllMocks()
	})

	it('returns 201 and persists encrypted secret on success', async () => {
		// KYC exists
		findKycByIdMock.mockResolvedValueOnce({
			id: 1,
			name: 'Alice',
			document: 'DOC',
			status: 'approved',
		})

		const res = await request(app).post('/wallet/create').send({ user_id: 1 })

		expect(res.status).toBe(201)
		expect(res.body).toEqual({ user_id: 1, public_key: VALID_PUBLIC_KEY })

		// Insert called with encrypted private_key (not leaking plaintext)
		expect(insertAccountMock).toHaveBeenCalledTimes(1)
		const args = secondArg<unknown, InsertAccountArgs>(insertAccountMock)
		expect(args.user_id).toBe(1)
		expect(args.public_key).toBe(VALID_PUBLIC_KEY)
		expect(typeof args.private_key_encrypted).toBe('string')
		expect(args.private_key_encrypted).toMatch(/^[A-Za-z0-9+/=]+:[A-Za-z0-9+/=]+:[A-Za-z0-9+/=]+$/)
		expect(args.private_key_encrypted.includes(MOCK_SECRET)).toBe(false)
	})

	it('returns 400 when user_id does not exist in kyc', async () => {
		findKycByIdMock.mockResolvedValueOnce(null)

		const res = await request(app).post('/wallet/create').send({ user_id: 999 })

		expect(res.status).toBe(400)
		expect(res.body).toEqual({ error: 'Invalid user ID' })
		expect(insertAccountMock).not.toHaveBeenCalled()
	})

	it('returns 400 when friendbot funding fails', async () => {
		findKycByIdMock.mockResolvedValueOnce({
			id: 2,
			name: 'Bob',
			document: 'DOC2',
			status: 'approved',
		})
		fundMock.mockRejectedValueOnce(new Error('friendbot down'))

		const res = await request(app).post('/wallet/create').send({ user_id: 2 })

		expect(res.status).toBe(400)
		expect(res.body).toEqual({ error: 'Failed to create account' })
		expect(insertAccountMock).not.toHaveBeenCalled()
	})

	it('returns 500 when encryption key is missing or invalid', async () => {
		const original = process.env.ENCRYPTION_KEY
		process.env.ENCRYPTION_KEY = 'short' // invalid

		findKycByIdMock.mockResolvedValueOnce({
			id: 3,
			name: 'Eve',
			document: 'DOC3',
			status: 'approved',
		})

		const res = await request(app).post('/wallet/create').send({ user_id: 3 })

		// restore key for next tests
		process.env.ENCRYPTION_KEY = original

		expect([500, 400]).toContain(res.status)
		expect(res.body).toHaveProperty('error')
	})
})

describe('POST /wallet/send', () => {
	beforeEach(() => {
		jest.clearAllMocks()
		JWT_BEHAVIOR = 'success'
		AUTH_USER_ID = '1'

		// Reset default mocks
		StrKeyMock.isValidEd25519PublicKey.mockReturnValue(true)
		findAccountByUserIdMock.mockResolvedValue({
			id: 10,
			user_id: 1,
			public_key: VALID_PUBLIC_KEY,
			private_key: 'iv:tag:cipher',
		})
		loadAccountMock.mockResolvedValue({ accountId: 'SOURCE', sequence: '1' })
		fetchBaseFeeMock.mockResolvedValue(100)
		submitTransactionMock.mockResolvedValue({ hash: 'TXHASH_SUCCESS' })
	})

	it('should reject requests without JWT', async () => {
		JWT_BEHAVIOR = 'fail'

		const res = await request(app).post('/wallet/send').send({
			user_id: 123,
			destination: VALID_PUBLIC_KEY,
			amount: '10',
		})

		expect(res.status).toBe(401)
		expect(res.body).toEqual({ error: 'unauthorized' })
	})

	it('returns 201 on successful transaction', async () => {
		const res = await request(app).post('/wallet/send').send({
			user_id: 1,
			destination: VALID_PUBLIC_KEY,
			amount: '12.3456',
			asset: 'native',
			memo: 'hello',
		})

		expect(res.status).toBe(201)
		expect(res.body).toEqual({
			user_id: 1,
			transaction_hash: 'TXHASH_SUCCESS',
			status: 'success',
		})

		// Verify stellar calls
		expect(loadAccountMock).toHaveBeenCalledWith(VALID_PUBLIC_KEY)
		expect(fetchBaseFeeMock).toHaveBeenCalled()
		expect(submitTransactionMock).toHaveBeenCalled()

		// Verify transaction persistence
		expect(insertTransactionMock).toHaveBeenCalledWith(expect.anything(), {
			user_id: 1,
			transaction_hash: 'TXHASH_SUCCESS',
			status: 'success',
		})
	})

	it('returns 400 when user_id does not match token', async () => {
		AUTH_USER_ID = '99'

		const res = await request(app).post('/wallet/send').send({
			user_id: 1,
			destination: VALID_PUBLIC_KEY,
			amount: '10',
		})

		expect(res.status).toBe(400)
		expect(res.body).toEqual({ error: 'user_id does not match token' })
	})

	it('returns 400 for invalid destination', async () => {
		StrKeyMock.isValidEd25519PublicKey.mockReturnValue(false)

		const res = await request(app).post('/wallet/send').send({
			user_id: 1,
			destination: 'invalid-destination',
			amount: '10',
		})

		expect(res.status).toBe(400)
		expect(res.body).toEqual({ error: 'invalid destination' })
	})

	it('returns 400 for amount with >7 decimals', async () => {
		const res = await request(app).post('/wallet/send').send({
			user_id: 1,
			destination: VALID_PUBLIC_KEY,
			amount: '1.23456789', // 8 decimals
		})

		expect(res.status).toBe(400)
		expect(res.body).toEqual({ error: 'amount must be a positive decimal with up to 7 decimals' })
	})

	it('returns 400 for amount = 0', async () => {
		const res = await request(app).post('/wallet/send').send({
			user_id: 1,
			destination: VALID_PUBLIC_KEY,
			amount: '0',
		})

		expect(res.status).toBe(400)
		expect(res.body).toEqual({ error: 'amount must be > 0 and ≤ 1000' })
	})

	it('returns 400 for amount > 1000', async () => {
		const res = await request(app).post('/wallet/send').send({
			user_id: 1,
			destination: VALID_PUBLIC_KEY,
			amount: '1000.0000001',
		})

		expect(res.status).toBe(400)
		expect(res.body).toEqual({ error: 'amount must be > 0 and ≤ 1000' })
	})

	it('returns 400 for unsupported asset', async () => {
		const res = await request(app).post('/wallet/send').send({
			user_id: 1,
			destination: VALID_PUBLIC_KEY,
			amount: '10',
			asset: 'USDC',
		})

		expect(res.status).toBe(400)
		expect(res.body).toEqual({ error: 'only native asset supported' })
	})

	it('returns 400 for memo > 28 bytes', async () => {
		const res = await request(app)
			.post('/wallet/send')
			.send({
				user_id: 1,
				destination: VALID_PUBLIC_KEY,
				amount: '10',
				memo: 'x'.repeat(29), // 29 bytes
			})

		expect(res.status).toBe(400)
		expect(res.body).toEqual({ error: 'memo must be ≤ 28 bytes' })
	})

	it('returns 400 when user account not found', async () => {
		findAccountByUserIdMock.mockResolvedValue(null)

		const res = await request(app).post('/wallet/send').send({
			user_id: 1,
			destination: VALID_PUBLIC_KEY,
			amount: '10',
		})

		expect(res.status).toBe(400)
		expect(res.body).toEqual({ error: 'user account not found' })
	})

	it('returns 500 when Horizon rejects transaction with hash', async () => {
		const horizonError = {
			response: {
				data: {
					hash: 'FAILHASH_123',
				},
			},
		}
		submitTransactionMock.mockRejectedValue(horizonError)

		const res = await request(app).post('/wallet/send').send({
			user_id: 1,
			destination: VALID_PUBLIC_KEY,
			amount: '10',
		})

		expect(res.status).toBe(500)
		expect(res.body).toEqual({ error: 'Transaction failed' })

		// Verify failed transaction persistence
		expect(insertTransactionMock).toHaveBeenCalledWith(expect.anything(), {
			user_id: 1,
			transaction_hash: 'unknown', // Since error doesn't have direct hash property
			status: 'failed',
		})
	})
})

describe('GET /wallet/transactions/:user_id', () => {
	beforeEach(() => {
		jest.clearAllMocks()
		JWT_BEHAVIOR = 'success'
		AUTH_USER_ID = '1'

		// Reset Horizon mocks
		transactionCallMock.mockResolvedValue({
			created_at: '2024-01-01T00:00:00Z',
		})
		forTransactionCallMock.mockResolvedValue({
			records: [
				{
					type: 'payment',
					to: 'GDESTINATION123',
					amount: '10.0000000',
					asset_type: 'native',
				},
			],
		})
	})

	it('returns 200 with enriched transactions on success', async () => {
		// Mock DB returning 2 transactions
		getTransactionsByUserIdMock.mockResolvedValueOnce([
			{
				id: 1,
				user_id: 1,
				transaction_hash: 'HASH1',
				status: 'success',
			},
			{
				id: 2,
				user_id: 1,
				transaction_hash: 'HASH2',
				status: 'success',
			},
		])

		// Mock Horizon responses for both transactions
		transactionCallMock
			.mockResolvedValueOnce({ created_at: '2024-01-01T10:00:00Z' })
			.mockResolvedValueOnce({ created_at: '2024-01-02T15:30:00Z' })

		forTransactionCallMock
			.mockResolvedValueOnce({
				records: [
					{
						type: 'payment',
						to: 'GDEST1',
						amount: '50.0000000',
						asset_type: 'native',
					},
				],
			})
			.mockResolvedValueOnce({
				records: [
					{
						type: 'payment',
						to: 'GDEST2',
						amount: '25.5000000',
						asset_type: 'native',
					},
				],
			})

		const res = await request(app).get('/wallet/transactions/1')

		expect(res.status).toBe(200)
		expect(res.body).toHaveLength(2)
		expect(res.body[0]).toEqual({
			transaction_hash: 'HASH1',
			amount: '50.0000000',
			destination: 'GDEST1',
			status: 'success',
			timestamp: '2024-01-01T10:00:00Z',
		})
		expect(res.body[1]).toEqual({
			transaction_hash: 'HASH2',
			amount: '25.5000000',
			destination: 'GDEST2',
			status: 'success',
			timestamp: '2024-01-02T15:30:00Z',
		})

		// Verify calls
		expect(getTransactionsByUserIdMock).toHaveBeenCalledWith(expect.anything(), 1)
		expect(transactionMock).toHaveBeenCalledWith('HASH1')
		expect(transactionMock).toHaveBeenCalledWith('HASH2')
		expect(forTransactionMock).toHaveBeenCalledWith('HASH1')
		expect(forTransactionMock).toHaveBeenCalledWith('HASH2')
	})

	it('returns 200 with empty array when no transactions exist', async () => {
		getTransactionsByUserIdMock.mockResolvedValueOnce([])

		const res = await request(app).get('/wallet/transactions/1')

		expect(res.status).toBe(200)
		expect(res.body).toEqual([])

		// Horizon should not be called
		expect(transactionMock).not.toHaveBeenCalled()
		expect(forTransactionMock).not.toHaveBeenCalled()
	})

	it('returns 400 for invalid user_id', async () => {
		const res = await request(app).get('/wallet/transactions/invalid')

		expect(res.status).toBe(400)
		expect(res.body).toEqual({ error: 'Invalid user_id' })
	})

	it('returns 400 for negative user_id', async () => {
		const res = await request(app).get('/wallet/transactions/-1')

		expect(res.status).toBe(400)
		expect(res.body).toEqual({ error: 'Invalid user_id' })
	})

	it('returns 400 for zero user_id', async () => {
		const res = await request(app).get('/wallet/transactions/0')

		expect(res.status).toBe(400)
		expect(res.body).toEqual({ error: 'Invalid user_id' })
	})

	it('returns 403 when user_id does not match JWT', async () => {
		AUTH_USER_ID = '99'

		const res = await request(app).get('/wallet/transactions/1')

		expect(res.status).toBe(403)
		expect(res.body).toEqual({ error: 'Forbidden' })

		// Should not call DB
		expect(getTransactionsByUserIdMock).not.toHaveBeenCalled()
	})

	it('returns 401 when JWT is invalid', async () => {
		JWT_BEHAVIOR = 'fail'

		const res = await request(app).get('/wallet/transactions/1')

		expect(res.status).toBe(401)
		expect(res.body).toEqual({ error: 'unauthorized' })
	})

	it('returns 500 when Horizon transaction call fails', async () => {
		getTransactionsByUserIdMock.mockResolvedValueOnce([
			{
				id: 1,
				user_id: 1,
				transaction_hash: 'HASH_FAIL',
				status: 'success',
			},
		])

		transactionCallMock.mockRejectedValueOnce(new Error('Horizon transaction API error'))

		const res = await request(app).get('/wallet/transactions/1')

		expect(res.status).toBe(500)
		expect(res.body).toEqual({ error: 'Failed to fetch transactions' })
	})

	it('returns 500 when Horizon operations call fails', async () => {
		getTransactionsByUserIdMock.mockResolvedValueOnce([
			{
				id: 1,
				user_id: 1,
				transaction_hash: 'HASH_FAIL',
				status: 'success',
			},
		])

		transactionCallMock.mockResolvedValueOnce({ created_at: '2024-01-01T00:00:00Z' })
		forTransactionCallMock.mockRejectedValueOnce(new Error('Horizon operations API error'))

		const res = await request(app).get('/wallet/transactions/1')

		expect(res.status).toBe(500)
		expect(res.body).toEqual({ error: 'Failed to fetch transactions' })
	})

	it('handles transactions without payment operations gracefully', async () => {
		getTransactionsByUserIdMock.mockResolvedValueOnce([
			{
				id: 1,
				user_id: 1,
				transaction_hash: 'HASH_NO_PAYMENT',
				status: 'success',
			},
		])

		transactionCallMock.mockResolvedValueOnce({ created_at: '2024-01-01T12:00:00Z' })
		forTransactionCallMock.mockResolvedValueOnce({
			records: [
				{
					type: 'create_account',
					destination: 'GNEWACCOUNT',
					starting_balance: '100',
				},
			],
		})

		const res = await request(app).get('/wallet/transactions/1')

		expect(res.status).toBe(200)
		expect(res.body).toHaveLength(1)
		expect(res.body[0]).toEqual({
			transaction_hash: 'HASH_NO_PAYMENT',
			amount: '0',
			destination: '',
			status: 'success',
			timestamp: '2024-01-01T12:00:00Z',
		})
	})
})
