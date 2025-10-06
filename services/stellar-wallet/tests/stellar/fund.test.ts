import { beforeEach, describe, expect, it, mock } from 'bun:test'

const VALID_PUBLIC_KEY = 'GCCGMBN46TNVH2WL732DYB5WWBEJG5S4UDXAJGB7O3GPQJVVHVQOP5E7'
const INVALID_PUBLIC_KEY = 'not-a-valid-key'

// Mock fetch globally
const fetchMock = mock(() =>
	Promise.resolve({
		ok: true,
		json: () => Promise.resolve({ success: true }),
		status: 200,
		text: () => Promise.resolve('OK'),
	} as Response),
)
global.fetch = fetchMock

// Mock connect and Horizon server
const loadAccountMock = mock(() =>
	Promise.resolve({
		balances: [
			{ asset_type: 'native', balance: '100.0000000' },
			{ asset_type: 'credit_alphanum4', balance: '0.0000001' },
		],
	}),
)

mock.module('../../src/stellar/client', () => ({
	connect: () => ({
		loadAccount: loadAccountMock,
	}),
}))

// Import after mocking
import { checkBalance, fundAccount } from '../../src/stellar/fund'

describe('fundAccount', () => {
	beforeEach(() => {
		fetchMock.mockClear()
		loadAccountMock.mockClear()
	})

	it('should fund a valid Stellar account', async () => {
		fetchMock.mockResolvedValueOnce({
			ok: true,
			json: () => Promise.resolve({ success: true }),
		} as Response)

		await expect(fundAccount(VALID_PUBLIC_KEY)).resolves.not.toThrow()
		expect(fetchMock).toHaveBeenCalledWith(`https://friendbot.stellar.org?addr=${VALID_PUBLIC_KEY}`)
	})

	it('should throw an error for an invalid public key', async () => {
		await expect(fundAccount(INVALID_PUBLIC_KEY)).rejects.toThrow('Invalid Stellar public key')
		expect(fetchMock).not.toHaveBeenCalled()
	})

	it('should throw an error if Friendbot fails', async () => {
		fetchMock.mockResolvedValueOnce({
			ok: false,
			status: 400,
			text: () => Promise.resolve('Error funding account'),
		} as Response)

		await expect(fundAccount(VALID_PUBLIC_KEY)).rejects.toThrow(
			'Friendbot failed: 400 Error funding account',
		)
	})
})

describe('checkBalance', () => {
	beforeEach(() => {
		loadAccountMock.mockClear()
	})

	it('should return true if balance is >= 1 XLM', async () => {
		loadAccountMock.mockResolvedValueOnce({
			balances: [
				{ asset_type: 'native', balance: '100.0000000' },
				{ asset_type: 'credit_alphanum4', balance: '0.0000001' },
			],
		})

		const result = await checkBalance(VALID_PUBLIC_KEY)
		expect(result).toBe(true)
	})

	it('should return false if native balance is missing', async () => {
		loadAccountMock.mockResolvedValueOnce({ balances: [] })

		const result = await checkBalance(VALID_PUBLIC_KEY)
		expect(result).toBe(false)
	})

	it('should return false on error', async () => {
		loadAccountMock.mockRejectedValueOnce(new Error('Network error'))

		const result = await checkBalance(VALID_PUBLIC_KEY)
		expect(result).toBe(false)
	})
})
