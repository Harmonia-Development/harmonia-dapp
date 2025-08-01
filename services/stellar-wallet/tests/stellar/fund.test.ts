import { checkBalance, fundAccount } from '../../src/stellar/fund'

// Mock fetch globally
const mockedFetch = jest.fn() as unknown as typeof fetch
global.fetch = mockedFetch

// Mock connect and Horizon server
jest.mock('../../src/stellar/client', () => ({
	connect: () => ({
		loadAccount: jest.fn().mockResolvedValue({
			balances: [
				{ asset_type: 'native', balance: '100.0000000' },
				{ asset_type: 'credit_alphanum4', balance: '0.0000001' },
			],
		}),
	}),
}))

const VALID_PUBLIC_KEY = 'GCCGMBN46TNVH2WL732DYB5WWBEJG5S4UDXAJGB7O3GPQJVVHVQOP5E7'
const INVALID_PUBLIC_KEY = 'not-a-valid-key'

describe('fundAccount', () => {
	beforeEach(() => {
		jest.clearAllMocks()
	})

	it('should fund a valid Stellar account', async () => {
		;(global.fetch as unknown as jest.Mock).mockResolvedValueOnce({
			ok: true,
			json: async () => ({ success: true }),
		})

		await expect(fundAccount(VALID_PUBLIC_KEY)).resolves.not.toThrow()
		expect(global.fetch).toHaveBeenCalledWith(
			`https://friendbot.stellar.org?addr=${VALID_PUBLIC_KEY}`,
		)
	})

	it('should throw an error for an invalid public key', async () => {
		await expect(fundAccount(INVALID_PUBLIC_KEY)).rejects.toThrow('Invalid Stellar public key')
		expect(global.fetch).not.toHaveBeenCalled()
	})

	it('should throw an error if Friendbot fails', async () => {
		;(global.fetch as unknown as jest.Mock).mockResolvedValueOnce({
			ok: false,
			status: 400,
			text: async () => 'Error funding account',
		})

		await expect(fundAccount(VALID_PUBLIC_KEY)).rejects.toThrow(
			'Friendbot failed: 400 Error funding account',
		)
	})
})

describe('checkBalance', () => {
	beforeEach(() => {
		jest.resetModules()
	})

	it('should return true if balance is >= 1 XLM', async () => {
		const result = await checkBalance(VALID_PUBLIC_KEY)
		expect(result).toBe(true)
	})

	it('should return false if native balance is missing', async () => {
		jest.doMock('../../src/stellar/client', () => ({
			connect: () => ({
				loadAccount: jest.fn().mockResolvedValue({ balances: [] }),
			}),
		}))

		const { checkBalance: mockedCheckBalance } = await import('../../src/stellar/fund')
		const result = await mockedCheckBalance(VALID_PUBLIC_KEY)
		expect(result).toBe(false)
	})

	it('should return false on error', async () => {
		jest.doMock('../../src/stellar/client', () => ({
			connect: () => ({
				loadAccount: jest.fn().mockRejectedValue(new Error('Network error')),
			}),
		}))

		const { checkBalance: mockedCheckBalance } = await import('../../src/stellar/fund')
		const result = await mockedCheckBalance(VALID_PUBLIC_KEY)
		expect(result).toBe(false)
	})
})
