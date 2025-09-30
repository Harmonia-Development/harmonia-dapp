import type sqlite3 from 'sqlite3'
import request from 'supertest'
import { all, closeDB, connectDB, initializeKycTable, run } from '../../src/db/kyc'

// Create a clean app instance for testing without rate limiting
import express from 'express'
import { kycVerifyRouter } from '../../src/routes/kyc-verify'

const testApp = express()
testApp.use(express.json())
testApp.use('/kyc', kycVerifyRouter)

// Mock the Soroban client module
const mockSorobanServer = {
	getAccount: jest.fn(),
	sendTransaction: jest.fn(),
	getTransaction: jest.fn(),
}

jest.mock('../../src/soroban/client', () => ({
	connectSoroban: jest.fn(() => mockSorobanServer),
}))

// Mock Stellar SDK
const mockKeypair = {
	publicKey: jest.fn().mockReturnValue('GCTEST...'),
	sign: jest.fn(),
}

const mockTransaction = {
	sign: jest.fn(),
}

const mockTransactionBuilder = {
	addOperation: jest.fn().mockReturnThis(),
	setTimeout: jest.fn().mockReturnThis(),
	build: jest.fn(() => mockTransaction),
}

const mockContract = {
	call: jest.fn().mockReturnValue({}),
}

jest.mock('@stellar/stellar-sdk', () => ({
	Keypair: {
		fromSecret: jest.fn(() => mockKeypair),
	},
	Contract: jest.fn(() => mockContract),
	TransactionBuilder: jest.fn(() => mockTransactionBuilder),
	nativeToScVal: jest.fn().mockReturnValue({}),
	BASE_FEE: '100',
	Networks: { TESTNET: 'Test SDF Network ; September 2015' },
}))

// Mock environment variables
jest.mock('../../src/config/envs', () => ({
	default: {
		PORT: 3000,
		STELLAR_SECRET_KEY: 'STEST...',
		SOROBAN_CONTRACT_ID: 'CTEST...',
	},
}))

// Use an in-memory DB for tests
jest.mock('../../src/db/kyc', () => {
	const sqlite3Req: typeof import('sqlite3') = require('sqlite3')
	const { promisify } = require('node:util')

	let db: sqlite3.Database | null = null

	const getDb = async (): Promise<sqlite3.Database> => {
		if (!db) {
			sqlite3Req.verbose()
			db = new sqlite3Req.Database(':memory:')
			const runAsync = promisify(db.run.bind(db)) as (
				sql: string,
				params?: unknown[],
			) => Promise<void>
			await runAsync('PRAGMA foreign_keys = ON;')
		}
		return db
	}

	const run = (database: sqlite3.Database, sql: string, params: unknown[] = []): Promise<void> => {
		const runAsync = promisify(database.run.bind(database)) as (
			sql: string,
			params?: unknown[],
		) => Promise<void>
		return runAsync(sql, params)
	}

	const all = <T = unknown>(
		database: sqlite3.Database,
		sql: string,
		params: unknown[] = [],
	): Promise<T[]> => {
		const allAsync = promisify(database.all.bind(database)) as (
			sql: string,
			params?: unknown[],
		) => Promise<T[]>
		return allAsync(sql, params)
	}

	return {
		connectDB: async (): Promise<sqlite3.Database> => getDb(),

		closeDB: async (): Promise<void> => {
			const instance = db
			if (!instance) return
			await new Promise<void>((resolve, reject) => {
				instance.close((err: Error | null) => (err ? reject(err) : resolve()))
			})
			db = null
		},

		initializeKycTable: async (conn?: sqlite3.Database): Promise<void> => {
			const database = conn ?? (await getDb())
			const runAsync = promisify(database.run.bind(database)) as (
				sql: string,
				params?: unknown[],
			) => Promise<void>

			await runAsync(`
        CREATE TABLE IF NOT EXISTS kyc (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          document TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'pending'
        );
      `)
			await runAsync('CREATE UNIQUE INDEX IF NOT EXISTS idx_kyc_document ON kyc (document);')
		},

		findKycById: async (database: sqlite3.Database, id: number) => {
			const rows = await all(database, 'SELECT * FROM kyc WHERE id = ? LIMIT 1;', [id])
			return rows.length ? rows[0] : null
		},

		run,
		all,
	}
})

beforeAll(async () => {
	const db = await connectDB()
	await initializeKycTable(db)
})

afterAll(async () => {
	await closeDB()
})

describe('POST /kyc/verify', () => {
	beforeEach(async () => {
		jest.clearAllMocks()

		// Reset all mocks to clean state
		mockSorobanServer.getAccount.mockReset()
		mockSorobanServer.sendTransaction.mockReset()
		mockSorobanServer.getTransaction.mockReset()

		// Setup successful Soroban mocks
		mockSorobanServer.getAccount.mockResolvedValue({})
		mockSorobanServer.sendTransaction.mockResolvedValue({
			status: 'PENDING',
			hash: 'txhash123',
		})
		mockSorobanServer.getTransaction
			.mockResolvedValueOnce({ status: 'NOT_FOUND' })
			.mockResolvedValueOnce({ status: 'SUCCESS' })

		// Insert test KYC record
		const db = await connectDB()
		await run(db, 'DELETE FROM kyc WHERE id = 1') // Clean up
		await run(db, 'INSERT INTO kyc (id, name, document, status) VALUES (?, ?, ?, ?)', [
			1,
			'John Doe',
			'ABC12345',
			'pending',
		])
	})

	it('should successfully register KYC data and return 201', async () => {
		const requestBody = {
			kyc_id: '1',
			name: 'John Doe',
			document: 'ABC12345',
		}

		const response = await request(testApp).post('/kyc/verify').send(requestBody).expect(201)

		expect(response.body).toHaveProperty('kyc_id', '1')
		expect(response.body).toHaveProperty('data_hash')
		expect(response.body).toHaveProperty('status', 'approved')
		expect(response.body.data_hash).toMatch(/^[a-f0-9]{64}$/) // SHA-256 hash format

		// Verify contract was called with correct parameters
		expect(mockContract.call).toHaveBeenCalledWith(
			'register_kyc',
			{}, // mocked nativeToScVal return
			{}, // mocked nativeToScVal return
			{}, // mocked nativeToScVal return
		)

		// Verify database status was actually updated
		const db = await connectDB()
		const rows = await all(db, 'SELECT status FROM kyc WHERE id = 1')
		expect(rows).toHaveLength(1)
		expect(rows[0]).toEqual({ status: 'approved' })
	})

	it('should return 400 for missing kyc_id', async () => {
		const requestBody = {
			name: 'John Doe',
			document: 'ABC12345',
		}

		const response = await request(testApp).post('/kyc/verify').send(requestBody).expect(400)

		expect(response.body).toEqual({
			error: 'kyc_id is required and must be a string',
		})
	})

	it('should return 400 for invalid KYC data', async () => {
		const requestBody = {
			kyc_id: '1',
			name: 'A', // Too short
			document: '123', // Too short
		}

		const response = await request(testApp).post('/kyc/verify').send(requestBody).expect(400)

		expect(response.body.error).toContain('name must be at least 2 characters')
	})

	it('should return 400 for invalid kyc_id', async () => {
		const requestBody = {
			kyc_id: '999',
			name: 'John Doe',
			document: 'ABC12345',
		}

		const response = await request(testApp).post('/kyc/verify').send(requestBody).expect(400)

		expect(response.body).toEqual({ error: 'Invalid kyc_id' })
	})

	it('should return 500 for contract call failure', async () => {
		// Override to simulate contract call failure
		mockSorobanServer.sendTransaction.mockResolvedValue({
			status: 'ERROR',
			errorResult: 'Contract error',
		})

		const requestBody = {
			kyc_id: '1',
			name: 'John Doe',
			document: 'ABC12345',
		}

		const response = await request(testApp).post('/kyc/verify').send(requestBody).expect(500)

		expect(response.body).toEqual({ error: 'Failed to register KYC' })
	})

	it('should return 500 for transaction failure', async () => {
		// Override mocks to simulate transaction failure scenario
		mockSorobanServer.sendTransaction.mockResolvedValue({
			status: 'PENDING',
			hash: 'txhash123',
		})
		// Clear the chained mocks and set up failure
		mockSorobanServer.getTransaction.mockReset()
		mockSorobanServer.getTransaction.mockResolvedValue({
			status: 'FAILED',
		})

		const requestBody = {
			kyc_id: '1',
			name: 'John Doe',
			document: 'ABC12345',
		}

		const response = await request(testApp).post('/kyc/verify').send(requestBody).expect(500)

		expect(response.body).toEqual({ error: 'Failed to register KYC' })
	})
})
