import { beforeEach, describe, expect, it, mock } from 'bun:test'
import type * as StellarSdk from '@stellar/stellar-sdk'
import envs from '../../src/config/envs'

// Prepare a typed healthy response
const healthyResponse: StellarSdk.rpc.Api.GetHealthResponse = { status: 'healthy' }

// Create mocks
const getHealthMock = mock(() => Promise.resolve(healthyResponse))
const ServerMock = mock(() => ({
	getHealth: getHealthMock,
}))

// Mock the Stellar SDK module
mock.module('@stellar/stellar-sdk', () => ({
	rpc: {
		Server: ServerMock,
	},
}))

// Import after mocking
import { connectSoroban, isSorobanConnected } from '../../src/soroban/client'

describe('Soroban Client', () => {
	beforeEach(() => {
		// Clear all mocks before each test to avoid interference across tests
		ServerMock.mockClear()
		getHealthMock.mockClear()
	})

	it('connectSoroban() should create an RpcServer with the correct URL', () => {
		const server = connectSoroban()
		expect(server).toBeDefined()
		// Ensure the server was instantiated with the correct Soroban RPC URL
		expect(ServerMock).toHaveBeenCalledWith(envs.SOROBAN_RPC_URL)
	})

	it('connectSoroban() should return the same instance on multiple calls (singleton)', () => {
		const server1 = connectSoroban()
		const server2 = connectSoroban()
		expect(server1).toBe(server2)
	})

	it('isSorobanConnected() should return true when RPC responds healthy', async () => {
		const result = await isSorobanConnected()
		expect(result).toBe(true)
		expect(getHealthMock).toHaveBeenCalledTimes(1)
	})

	it('isSorobanConnected() should return false when getHealth() throws', async () => {
		getHealthMock.mockRejectedValueOnce(new Error('Failed'))

		const result = await isSorobanConnected()
		expect(result).toBe(false)
	})
})
