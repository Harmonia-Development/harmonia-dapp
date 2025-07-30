import { Keypair } from '@stellar/stellar-sdk'

/**
 * Generates a new Stellar key pair.
 * @returns An object containing public and private keys.
 */
export function generateKeyPair(): { publicKey: string; privateKey: string } {
	const pair = Keypair.random()
	return {
		publicKey: pair.publicKey(), // Starts with G
		privateKey: pair.secret(), // Starts with S
	}
}
