import request from 'supertest'
import jwt from 'jsonwebtoken'

// Deterministic 32-byte key (Base64) and JWT secret
process.env.ENCRYPTION_KEY = Buffer.alloc(32, 7).toString('base64')
process.env.JWT_SECRET = 'test-jwt-secret-key-for-wallet-tests'

import type { KycRow } from '../../src/db/kyc'
import { app } from '../../src/index'

// Types for mocks
type InsertAccountArgs = {
	user_id: number
	public_key: string
	private_key_encrypted: string
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

// ---- Mocks ----

// Mock keypair generation
const VALID_PUBLIC_KEY = 'GCCGMBN46TNVH2WL732DYB5WWBEJG5S4UDXAJGB7O3GPQJVVHVQOP5E7'
const MOCK_SECRET = 'SA2XMOCKSECRETPRIVATEKEYFORTESTS01234567'

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

// Mock DB helpers used by the route
const findKycByIdMock: jest.Mock<Promise<KycRow | null>, [unknown, number]> = jest.fn()
const insertAccountMock: jest.Mock<Promise<void>, [unknown, InsertAccountArgs]> = jest
	.fn<Promise<void>, [unknown, InsertAccountArgs]>()
	.mockResolvedValue(undefined)
const initializeAccountsTableMock: jest.Mock<Promise<void>, [unknown?]> = jest
	.fn<Promise<void>, [unknown?]>()
	.mockResolvedValue(undefined)

jest.mock('../../src/db/kyc', () => {
	const actual = jest.requireActual('../../src/db/kyc')
	return {
		...actual,
		findKycById: (db: unknown, id: number): Promise<KycRow | null> => findKycByIdMock(db, id),
		insertAccount: (db: unknown, args: InsertAccountArgs): Promise<void> =>
			insertAccountMock(db, args),
		initializeAccountsTable: (db?: unknown): Promise<void> => initializeAccountsTableMock(db),
	}
})

// Quick JWT helper for tests
function generateValidJWT(user_id: number): string {
	return jwt.sign({ user_id }, process.env.JWT_SECRET!, { expiresIn: '1h' })
}

describe('POST /wallet/create', () => {
	beforeEach(() => {
		jest.clearAllMocks()
	})

	it('returns 201 and persists encrypted secret on success with valid JWT', async () => {
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

		// Make sure private key is encrypted
		expect(insertAccountMock).toHaveBeenCalledTimes(1)
		const args = secondArg<unknown, InsertAccountArgs>(insertAccountMock)
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
		findKycByIdMock.mockResolvedValueOnce({
			id: 1,
			name: 'Alice',
			document: 'DOC',
			status: 'approved',
		})

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
		fundMock.mockRejectedValueOnce(new Error('friendbot down'))

		const validJWT = generateValidJWT(2)
		const res = await request(app)
			.post('/wallet/create')
			.set('Authorization', `Bearer ${validJWT}`)
			.send({ user_id: 2 })

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

		const validJWT = generateValidJWT(3)
		const res = await request(app)
			.post('/wallet/create')
			.set('Authorization', `Bearer ${validJWT}`)
			.send({ user_id: 3 })

		// restore key for next tests
		process.env.ENCRYPTION_KEY = original

		expect([500, 400]).toContain(res.status)
		expect(res.body).toHaveProperty('error')
	})
})
