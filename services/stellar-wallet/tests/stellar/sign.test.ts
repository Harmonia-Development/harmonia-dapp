// Deterministic 32-byte key (Base64) for crypto operations in tests
process.env.ENCRYPTION_KEY = Buffer.alloc(32, 7).toString('base64')

import { beforeEach, describe, expect, it, mock } from 'bun:test'
import type { Keypair as StellarKeypair } from '@stellar/stellar-sdk'
import type sqlite3 from 'sqlite3'
import { encryptPrivateKey, getEncryptionKey } from '../../src/utils/encryption'

// ---- Mocks (DB) ----
const findAccountByUserIdMock = mock(
	async (
		_db: sqlite3.Database,
		_userId: number,
	): Promise<{ id: number; user_id: number; public_key: string; private_key: string } | null> =>
		null,
)
const connectDBMock = mock(async () => ({}) as sqlite3.Database)

mock.module('../../src/db/kyc', () => ({
	findAccountByUserId: findAccountByUserIdMock,
	connectDB: connectDBMock,
}))

// ---- Mocks (Stellar SDK) ----
const fromSecretMock = mock((_secret: string) => ({}) as StellarKeypair)

mock.module('@stellar/stellar-sdk', () => {
	// Import the actual module to keep StrKey functionality
	const actual = require('@stellar/stellar-sdk')
	return {
		...actual,
		Keypair: {
			...actual.Keypair,
			fromSecret: fromSecretMock,
		},
	}
})

// Import after mocking
import { type StellarTx, getPrivateKey, signTransaction } from '../../src/stellar/sign'

describe('stellar/sign module', () => {
	const ORIGINAL_ENV = process.env.ENCRYPTION_KEY

	// Use a real valid seed so StrKey.isValidEd25519SecretSeed passes.
	const VALID_SECRET = 'SA2XMOCKSECRETPRIVATEKEYFORTESTS01234567' // Mock secret for testing
	const SECRET_56 = VALID_SECRET

	beforeEach(() => {
		findAccountByUserIdMock.mockClear()
		connectDBMock.mockClear()
		fromSecretMock.mockClear()
		process.env.ENCRYPTION_KEY = ORIGINAL_ENV
	})

	it('getPrivateKey -> returns decrypted S-secret (happy path)', async () => {
		const key = getEncryptionKey()
		const encrypted = encryptPrivateKey(SECRET_56, key)

		findAccountByUserIdMock.mockResolvedValueOnce({
			id: 1,
			user_id: 1,
			public_key: 'G'.padEnd(56, 'B'),
			private_key: encrypted,
		})

		const secret = await getPrivateKey(1)
		expect(secret).toBe(SECRET_56)
	})

	it('getPrivateKey -> throws "Account not found" when user has no account', async () => {
		findAccountByUserIdMock.mockResolvedValueOnce(null)
		await expect(getPrivateKey(123)).rejects.toThrow('Account not found')
	})

	it('getPrivateKey -> throws "Decryption failed" on wrong key', async () => {
		const key = getEncryptionKey()
		const encrypted = encryptPrivateKey(SECRET_56, key)

		// Break the key to force authentication failure
		process.env.ENCRYPTION_KEY = Buffer.alloc(32, 9).toString('base64')

		findAccountByUserIdMock.mockResolvedValueOnce({
			id: 2,
			user_id: 2,
			public_key: 'G'.padEnd(56, 'C'),
			private_key: encrypted,
		})

		await expect(getPrivateKey(2)).rejects.toThrow('Decryption failed')
	})

	it('signTransaction -> signs the tx with Keypair.fromSecret and returns the same instance', async () => {
		const key = getEncryptionKey()
		const encrypted = encryptPrivateKey(SECRET_56, key)

		findAccountByUserIdMock.mockResolvedValueOnce({
			id: 10,
			user_id: 10,
			public_key: 'G'.padEnd(56, 'D'),
			private_key: encrypted,
		})

		// Build a minimal signable tx with a typed sign method
		const signFn = mock((_keypair: StellarKeypair) => {})
		const tx = { sign: signFn } as unknown as StellarTx

		// Use a strongly-typed return
		const fakeKeypair = {} as unknown as StellarKeypair
		fromSecretMock.mockReturnValueOnce(fakeKeypair)

		const result = await signTransaction(10, tx)

		expect(fromSecretMock).toHaveBeenCalledWith(SECRET_56)
		expect(signFn).toHaveBeenCalledWith(fakeKeypair)
		expect(result).toBe(tx)
	})
})
