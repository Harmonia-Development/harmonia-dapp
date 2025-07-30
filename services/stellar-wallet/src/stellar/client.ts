/**
 * Stellar SDK client setup for Testnet.
 * Provides functions to connect to the Stellar network
 * and verify that the connection is active.
 */

import * as StellarSdk from '@stellar/stellar-sdk'
import type { HorizonServer } from '@stellar/stellar-sdk/lib/horizon/server'
import envs from '../config/envs'

let server: HorizonServer | null = null

/**
 * Initializes and returns a Stellar Server instance.
 */
export function connect(): HorizonServer {
	if (!server) {
		server = new StellarSdk.Horizon.Server(envs.HORIZON_URL)
	}
	return server
}

/**
 * Verifies if the connection to the Stellar Horizon server is successful.
 */
export async function isConnected(): Promise<boolean> {
	try {
		const s = connect()
		await s.root() // performs GET request to Horizon root
		return true
	} catch (error) {
		console.error('❌ Stellar connection failed:', error)
		return false
	}
}
