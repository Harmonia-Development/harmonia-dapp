import * as StellarSdk from '@stellar/stellar-sdk'
import type { RpcServer } from '@stellar/stellar-sdk/lib/rpc/server'
import envs from '../config/envs'

let rpcServer: RpcServer | null = null

/**
 * Initializes and returns a Soroban RPC Server instance.
 */
export function connectSoroban(): RpcServer {
	if (!rpcServer) {
		rpcServer = new StellarSdk.rpc.Server(envs.SOROBAN_RPC_URL)
	}
	return rpcServer
}

/**
 * Pings the Soroban RPC health endpoint to verify connectivity.
 * Returns true only if the server reports "healthy"; otherwise false.
 */
export async function isSorobanConnected(): Promise<boolean> {
	try {
		const server = connectSoroban()
		const health: StellarSdk.rpc.Api.GetHealthResponse = await server.getHealth()
		return health.status === 'healthy'
	} catch (error) {
		console.error('❌ Soroban connection failed:', error)
		return false
	}
}
