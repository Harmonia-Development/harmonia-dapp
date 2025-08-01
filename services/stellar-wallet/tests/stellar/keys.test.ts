import { generateKeyPair } from '../../src/stellar/keys'

describe('generateKeyPair', () => {
	it('should return a valid Stellar public and private key', () => {
		const { publicKey, privateKey } = generateKeyPair()

		expect(typeof publicKey).toBe('string')
		expect(typeof privateKey).toBe('string')

		// Public key should start with 'G' and be 56 characters long
		expect(publicKey.startsWith('G')).toBe(true)
		expect(publicKey.length).toBe(56)

		// Private key should start with 'S' and be 56 characters long
		expect(privateKey.startsWith('S')).toBe(true)
		expect(privateKey.length).toBe(56)
	})
})
