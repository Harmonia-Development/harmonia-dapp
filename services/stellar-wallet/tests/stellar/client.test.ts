import { beforeEach, describe, expect, it, mock } from 'bun:test'
import envs from '../../src/config/envs'

// Create mocks
const rootMock = mock(() => Promise.resolve({ horizon: 'testnet' }))
const ServerMock = mock(() => ({
	root: rootMock,
}))

// Mock the Stellar SDK module
mock.module('@stellar/stellar-sdk', () => ({
	Horizon: {
		Server: ServerMock,
	},
}))

// Import after mocking
import { connect, isConnected } from '../../src/stellar/client'

describe('Stellar Client', () => {
	beforeEach(() => {
		// Clear all mocks before each test to avoid interference
		ServerMock.mockClear()
		rootMock.mockClear()
	})

	it('connect() should return a HorizonServer instance', () => {
		const server = connect()
		expect(server).toBeDefined()
		// Ensure the server was instantiated with the correct Horizon URL
		expect(ServerMock).toHaveBeenCalledWith(envs.HORIZON_URL)
	})

	it('connect() should return the same instance on multiple calls', () => {
		// Ensures singleton pattern: the same instance is reused
		const server1 = connect()
		const server2 = connect()
		expect(server1).toBe(server2)
	})

	it('isConnected() should return true when server responds', async () => {
		const result = await isConnected()
		expect(result).toBe(true)

		// Verify that the root() method was called once
		expect(rootMock).toHaveBeenCalledTimes(1)
	})

	it('isConnected() should return false when server throws an error', async () => {
		// Simulate Horizon server failure
		rootMock.mockRejectedValueOnce(new Error('Failed'))

		const result = await isConnected()
		expect(result).toBe(false)
	})
})
