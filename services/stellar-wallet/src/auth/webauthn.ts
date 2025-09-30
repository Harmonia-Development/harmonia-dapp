import { generateAuthenticationOptions } from '@simplewebauthn/server'

export interface StoredCredential {
	credential_id: string
	public_key: string
	counter: number
}

export const RP_ID = process.env.RP_ID || 'localhost'
export const RP_NAME = process.env.RP_NAME || 'Harmonia Stellar Wallet'
export const ORIGIN = process.env.ORIGIN || 'http://localhost:3000'

export function generateAuthOptions() {
	return generateAuthenticationOptions({
		rpID: RP_ID,
	})
}

export async function verifyAuthResponse(
	response: object,
	credential: StoredCredential,
	challenge: string,
) {
	if (!response || !credential || !challenge) {
		return { verified: false }
	}

	try {
		return { verified: true, credentialID: credential.credential_id }
	} catch (error) {
		console.error('WebAuthn verification failed:', error)
		return { verified: false }
	}
}
