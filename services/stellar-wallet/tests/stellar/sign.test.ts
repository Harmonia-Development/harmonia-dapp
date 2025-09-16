// Deterministic 32-byte key (Base64) for crypto operations in tests
process.env.ENCRYPTION_KEY = Buffer.alloc(32, 7).toString('base64')

import type { Keypair as StellarKeypair } from '@stellar/stellar-sdk'
import type sqlite3 from 'sqlite3'
import { type StellarTx, getPrivateKey, signTransaction } from '../../src/stellar/sign'
import { encryptPrivateKey, getEncryptionKey } from '../../src/utils/encryption'

type StellarSdkNS = typeof import('@stellar/stellar-sdk')

// ---- Mocks (DB) ----
const findAccountByUserIdMock = jest.fn<
	Promise<{ id: number; user_id: number; public_key: string; private_key: string } | null>,
	[sqlite3.Database, number]
>()
const connectDBMock = jest
	.fn<Promise<sqlite3.Database>, []>()
	.mockResolvedValue({} as unknown as sqlite3.Database)

jest.mock('../../src/db/kyc', () => ({
	findAccountByUserId: (db: sqlite3.Database, userId: number) =>
		findAccountByUserIdMock(db, userId),
	connectDB: () => connectDBMock(),
}))

// ---- Mocks (Stellar SDK) ----
// Keep real exports (including StrKey) and only override Keypair.fromSecret.
// This ensures strong seed validation still works.
const fromSecretMock = jest.fn<StellarKeypair, [string]>()
jest.mock('@stellar/stellar-sdk', () => {
	const actual = jest.requireActual('@stellar/stellar-sdk') as typeof import('@stellar/stellar-sdk')
	return {
		...actual,
		Keypair: {
			...actual.Keypair,
			fromSecret: (secret: string) => fromSecretMock(secret),
		},
	}
})

describe('stellar/sign module', () => {
	const ORIGINAL_ENV = process.env.ENCRYPTION_KEY

	// Use a real valid seed so StrKey.isValidEd25519SecretSeed passes.
	const actualSdk = jest.requireActual('@stellar/stellar-sdk') as StellarSdkNS
	const VALID_SECRET = actualSdk.Keypair.random().secret()
	// Keep your variable name to minimize changes below.
	const SECRET_56 = VALID_SECRET

	beforeEach(() => {
		jest.clearAllMocks()
		process.env.ENCRYPTION_KEY = ORIGINAL_ENV
	})

	test('getPrivateKey -> returns decrypted S-secret (happy path)', async () => {
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

	test('getPrivateKey -> throws "Account not found" when user has no account', async () => {
		findAccountByUserIdMock.mockResolvedValueOnce(null)
		await expect(getPrivateKey(123)).rejects.toThrow('Account not found')
	})

	test('getPrivateKey -> throws "Decryption failed" on wrong key', async () => {
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

	test('signTransaction -> signs the tx with Keypair.fromSecret and returns the same instance', async () => {
		const key = getEncryptionKey()
		const encrypted = encryptPrivateKey(SECRET_56, key)

		findAccountByUserIdMock.mockResolvedValueOnce({
			id: 10,
			user_id: 10,
			public_key: 'G'.padEnd(56, 'D'),
			private_key: encrypted,
		})

		// Build a minimal signable tx with a typed sign method
		const signFn = jest.fn<void, [StellarKeypair]>()
		const tx = { sign: signFn } as unknown as StellarTx

		// Use a strongly-typed return
		const fakeKeypair = {} as unknown as StellarKeypair
		fromSecretMock.mockReturnValueOnce(fakeKeypair)

		// Spy consoles to assert secrets are not leaked
		const logs: string[] = []
		const errs: string[] = []
		const warns: string[] = []
		const logSpy = jest.spyOn(console, 'log').mockImplementation((...args: unknown[]) => {
			logs.push(args.map(String).join(' '))
		})
		const errSpy = jest.spyOn(console, 'error').mockImplementation((...args: unknown[]) => {
			errs.push(args.map(String).join(' '))
		})
		const warnSpy = jest.spyOn(console, 'warn').mockImplementation((...args: unknown[]) => {
			warns.push(args.map(String).join(' '))
		})

		const result = await signTransaction(10, tx)

		expect(fromSecretMock).toHaveBeenCalledWith(SECRET_56)
		expect(signFn).toHaveBeenCalledWith(fakeKeypair)
		expect(result).toBe(tx)

		const combined = [logs.join('\n'), errs.join('\n'), warns.join('\n')].join('\n')
		expect(combined.includes(SECRET_56)).toBe(false)

		logSpy.mockRestore()
		errSpy.mockRestore()
		warnSpy.mockRestore()
	})
})
