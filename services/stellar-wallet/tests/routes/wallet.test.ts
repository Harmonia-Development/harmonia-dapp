import jwt from 'jsonwebtoken'
import request from 'supertest'

// Deterministic 32-byte key (Base64) and JWT secret
process.env.ENCRYPTION_KEY = Buffer.alloc(32, 7).toString('base64')
process.env.JWT_SECRET = 'test-jwt-secret-key-for-wallet-tests'

import type { KycRow } from '../../src/db/kyc'

// Types for mocks
type InsertAccountArgs = {
	user_id: number
	public_key: string
	private_key_encrypted: string
}

// Mock data
const VALID_PUBLIC_KEY = 'GCCGMBN46TNVH2WL732DYB5WWBEJG5S4UDXAJGB7O3GPQJVVHVQOP5E7'
const MOCK_SECRET = 'SA2XMOCKSECRETPRIVATEKEYFORTESTS01234567'

// Mock functions
const generateKeyPairMock = mock(() => ({
	publicKey: VALID_PUBLIC_KEY,
	privateKey: MOCK_SECRET,
}))

const fundMock = mock(async (_publicKey: string) => {})
const findKycByIdMock = mock(async (_db: unknown, _id: number): Promise<KycRow | null> => null)
const insertAccountMock = mock(async (_db: unknown, _args: InsertAccountArgs) => {})
const initializeAccountsTableMock = mock(async (_db?: unknown) => {})

// Set up module mocks
mock.module('../../src/stellar/keys', () => ({
	generateKeyPair: generateKeyPairMock,
}))

mock.module('../../src/stellar/fund', () => ({
	fundAccount: fundMock,
}))

mock.module('../../src/db/kyc', () => ({
	connectDB: mock(async () => ({})),
	findKycById: findKycByIdMock,
	insertAccount: insertAccountMock,
	initializeAccountsTable: initializeAccountsTableMock,
}))

// Import app after mocks are set up
import { app } from '../../src/index'

// Quick JWT helper for tests
function generateValidJWT(user_id: number): string {
	const jwtSecret = process.env.JWT_SECRET || 'test-secret'
	return jwt.sign({ user_id }, jwtSecret, { expiresIn: '1h' })
}

// Helper to get second argument from mock calls
function getSecondArg(mockFn: { mock: { calls: unknown[][] } }): InsertAccountArgs {
	const calls = mockFn.mock.calls
	if (!calls || calls.length === 0 || calls[0].length < 2) {
		throw new Error('Mock was not called with two arguments')
	}
	return calls[0][1] as InsertAccountArgs
}

describe('POST /wallet/create', () => {
	beforeEach(() => {
		// Reset all mocks
		generateKeyPairMock.mockClear()
		fundMock.mockClear()
		findKycByIdMock.mockClear()
		insertAccountMock.mockClear()
		initializeAccountsTableMock.mockClear()
	})

	it('returns 201 and persists encrypted secret on success with valid JWT', async () => {
		// Setup mocks for success case
		findKycByIdMock.mockResolvedValueOnce({
			id: 1,
			name: 'Alice',
			document: 'DOC',
			status: 'approved',
		})

		const validJWT = generateValidJWT(1)
		const res = await request(app)
			.post('/wallet/create')
			.set('Authorization', `Bearer ${validJWT}`)
			.send({ user_id: 1 })

		expect(res.status).toBe(201)
		expect(res.body).toEqual({ user_id: 1, public_key: VALID_PUBLIC_KEY })

		// Check that private key was encrypted and stored
		expect(insertAccountMock).toHaveBeenCalledTimes(1)
		const args = getSecondArg(insertAccountMock)
		expect(args.user_id).toBe(1)
		expect(args.public_key).toBe(VALID_PUBLIC_KEY)
		expect(typeof args.private_key_encrypted).toBe('string')
		expect(args.private_key_encrypted).toMatch(/^[A-Za-z0-9+/=]+:[A-Za-z0-9+/=]+:[A-Za-z0-9+/=]+$/)
		expect(args.private_key_encrypted.includes(MOCK_SECRET)).toBe(false)
	})

	it('returns 401 when no JWT token is provided', async () => {
		const res = await request(app).post('/wallet/create').send({ user_id: 1 })

		expect(res.status).toBe(401)
		expect(res.body).toEqual({ error: 'Unauthorized' })
		expect(findKycByIdMock).not.toHaveBeenCalled()
		expect(insertAccountMock).not.toHaveBeenCalled()
	})

	it('returns 401 when invalid JWT token is provided', async () => {
		const res = await request(app)
			.post('/wallet/create')
			.set('Authorization', 'Bearer invalid-token')
			.send({ user_id: 1 })

		expect(res.status).toBe(401)
		expect(res.body).toEqual({ error: 'Unauthorized' })
		expect(findKycByIdMock).not.toHaveBeenCalled()
		expect(insertAccountMock).not.toHaveBeenCalled()
	})

	it('returns 403 when JWT user_id does not match request user_id', async () => {
		const validJWT = generateValidJWT(1) // JWT for user_id 1
		const res = await request(app)
			.post('/wallet/create')
			.set('Authorization', `Bearer ${validJWT}`)
			.send({ user_id: 2 }) // But requesting for user_id 2

		expect(res.status).toBe(403)
		expect(res.body).toEqual({ error: 'Forbidden' })
		expect(insertAccountMock).not.toHaveBeenCalled()
	})

	it('returns 400 when user_id does not exist in kyc', async () => {
		findKycByIdMock.mockResolvedValueOnce(null)

		const validJWT = generateValidJWT(999)
		const res = await request(app)
			.post('/wallet/create')
			.set('Authorization', `Bearer ${validJWT}`)
			.send({ user_id: 999 })

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
		// Setup fundMock to reject with error
		fundMock.mockImplementationOnce(() => Promise.reject(new Error('friendbot down')))

		const validJWT = generateValidJWT(2)
		const res = await request(app)
			.post('/wallet/create')
			.set('Authorization', `Bearer ${validJWT}`)
			.send({ user_id: 2 })

		expect(res.status).toBe(400)
		expect(res.body).toEqual({ error: 'Failed to create account' })
		expect(insertAccountMock).not.toHaveBeenCalled()
	})
})
