import { StrKey } from '@stellar/stellar-sdk'
import { connect } from './client'

/**
 * Funds a Stellar account on testnet using Friendbot.
 * @param publicKey - The public key of the account to fund.
 */
export async function fundAccount(publicKey: string): Promise<void> {
	if (!StrKey.isValidEd25519PublicKey(publicKey)) {
		throw new Error('Invalid Stellar public key')
	}

	const url = `https://friendbot.stellar.org?addr=${publicKey}`

	const response = await fetch(url)
	if (!response.ok) {
		const errorBody = await response.text()
		throw new Error(`Friendbot failed: ${response.status} ${errorBody}`)
	}

	const data = await response.json()
	console.log(`✅ Account funded: ${publicKey}`, data)
}

/**
 * Checks if the account balance is at least 1 XLM.
 * @param publicKey - The public key of the account to check.
 * @returns True if the account has at least 1 XLM, false otherwise.
 */
export async function checkBalance(publicKey: string): Promise<boolean> {
	try {
		const server = connect()
		const account = await server.loadAccount(publicKey)
		const balanceEntry = account.balances.find((b) => b.asset_type === 'native')

		if (!balanceEntry) return false

		const balance = Number.parseFloat(balanceEntry.balance)
		return balance >= 1
	} catch (error) {
		console.error('❌ Failed to check balance:', error)
		return false
	}
}
