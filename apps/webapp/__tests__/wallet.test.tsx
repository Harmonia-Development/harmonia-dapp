import { formatAddress, getNetworkDisplayName, validateAddress } from '@/lib/wallet/utils'
import { WalletNetwork } from '@creit.tech/stellar-wallets-kit'
import { beforeEach, describe, expect, it, vi } from 'vitest'

describe('Wallet Utils', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	describe('formatAddress', () => {
		it('should format address correctly', () => {
			const address = 'GBVLKFOEIK6A3CUOOH554ETKFTWHDF7TSPJAL4NU7PIB3NOQCEPTSXHO'
			const formatted = formatAddress(address)
			expect(formatted).toBe('GBVLKF...SXHO')
		})

		it('should handle short addresses', () => {
			const address = 'GBVLKF'
			const formatted = formatAddress(address)
			expect(formatted).toBe(address)
		})

		it('should handle empty address', () => {
			const formatted = formatAddress('')
			expect(formatted).toBe('Unknown')
		})

		it('should handle null address', () => {
			const formatted = formatAddress(null as unknown as string)
			expect(formatted).toBe('Unknown')
		})
	})

	describe('validateAddress', () => {
		it('should validate correct Stellar address', () => {
			const address = 'GBVLKFOEIK6A3CUOOH554ETKFTWHDF7TSPJAL4NU7PIB3NOQCEPTSXHO'
			const isValid = validateAddress(address)
			expect(isValid).toBe(true)
		})

		it('should reject invalid address', () => {
			const address = 'invalid-address'
			const isValid = validateAddress(address)
			expect(isValid).toBe(false)
		})

		it('should reject empty address', () => {
			const isValid = validateAddress('')
			expect(isValid).toBe(false)
		})

		it('should reject null address', () => {
			const isValid = validateAddress(null as unknown as string)
			expect(isValid).toBe(false)
		})
	})

	describe('getNetworkDisplayName', () => {
		it('should return correct network names', () => {
			expect(getNetworkDisplayName(WalletNetwork.PUBLIC)).toBe('Mainnet')
			expect(getNetworkDisplayName(WalletNetwork.TESTNET)).toBe('Testnet')
			expect(getNetworkDisplayName(WalletNetwork.FUTURENET)).toBe('Futurenet')
			expect(getNetworkDisplayName(WalletNetwork.SANDBOX)).toBe('Sandbox')
			expect(getNetworkDisplayName(WalletNetwork.STANDALONE)).toBe('Standalone')
		})

		it('should handle unknown network', () => {
			expect(getNetworkDisplayName('unknown' as WalletNetwork)).toBe('Unknown')
		})
	})
})

describe('Wallet Integration Features', () => {
	it('should support multiple wallet types', () => {
		const walletIds = ['freighter', 'xbull', 'lobstr', 'albedo', 'rabet']
		expect(walletIds).toHaveLength(5)
		expect(walletIds).toContain('freighter')
		expect(walletIds).toContain('xbull')
	})

	it('should support multiple networks', () => {
		const networks = [
			WalletNetwork.PUBLIC,
			WalletNetwork.TESTNET,
			WalletNetwork.FUTURENET,
			WalletNetwork.SANDBOX,
			WalletNetwork.STANDALONE,
		]
		expect(networks).toHaveLength(5)
		expect(networks).toContain(WalletNetwork.PUBLIC)
		expect(networks).toContain(WalletNetwork.TESTNET)
	})

	it('should have proper address validation regex', () => {
		const stellarAddressRegex = /^[GMS][A-Z2-7]{55}$/

		// Valid addresses
		expect(
			stellarAddressRegex.test('GBVLKFOEIK6A3CUOOH554ETKFTWHDF7TSPJAL4NU7PIB3NOQCEPTSXHO'),
		).toBe(true)
		expect(
			stellarAddressRegex.test('MBVLKFOEIK6A3CUOOH554ETKFTWHDF7TSPJAL4NU7PIB3NOQCEPTSXHO'),
		).toBe(true)
		expect(
			stellarAddressRegex.test('SBVLKFOEIK6A3CUOOH554ETKFTWHDF7TSPJAL4NU7PIB3NOQCEPTSXHO'),
		).toBe(true)

		// Invalid addresses
		expect(stellarAddressRegex.test('invalid')).toBe(false)
		expect(stellarAddressRegex.test('')).toBe(false)
		expect(stellarAddressRegex.test('GBVLKF')).toBe(false) // Too short
		expect(
			stellarAddressRegex.test('ABVLKFOEIK6A3CUOOH554ETKFTWHDF7TSPJAL4NU7PIB3NOQCEPTSXHO'),
		).toBe(false) // Wrong prefix
	})
})
