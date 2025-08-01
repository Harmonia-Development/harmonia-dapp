import * as StellarSdk from '@stellar/stellar-sdk'
import envs from '../../src/config/envs'
import { connect, isConnected } from '../../src/stellar/client'

// Mock the Stellar SDK to avoid real network calls
jest.mock('@stellar/stellar-sdk', () => {
	const actual = jest.requireActual('@stellar/stellar-sdk')
	return {
		...actual,
		Horizon: {
			Server: jest.fn().mockImplementation(() => ({
				// Mock root() to simulate a healthy Horizon server
				root: jest.fn().mockResolvedValue({ horizon: 'testnet' }),
			})),
		},
	}
})

describe('Stellar Client', () => {
	beforeEach(() => {
		// Clear all mocks before each test to avoid interference
		jest.clearAllMocks()
	})

	it('connect() should return a HorizonServer instance', () => {
		const server = connect()
		expect(server).toBeDefined()
		// Ensure the server was instantiated with the correct Horizon URL
		expect(StellarSdk.Horizon.Server).toHaveBeenCalledWith(envs.HORIZON_URL)
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
		const s = connect()
		expect(s.root).toHaveBeenCalledTimes(1)
	})

	it('isConnected() should return false when server throws an error', async () => {
		const mockedServer = connect()
		// Simulate Horizon server failure
		jest.spyOn(mockedServer, 'root').mockRejectedValue(new Error('Failed'))

		const result = await isConnected()
		expect(result).toBe(false)
	})
})
