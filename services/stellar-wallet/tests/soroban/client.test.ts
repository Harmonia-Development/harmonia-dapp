import * as StellarSdk from '@stellar/stellar-sdk'
import envs from '../../src/config/envs'
import { connectSoroban, isSorobanConnected } from '../../src/soroban/client'

// Prepare a typed healthy response
const healthyResponse: StellarSdk.rpc.Api.GetHealthResponse = { status: 'healthy' }

// Mock the Stellar SDK to avoid real network calls
jest.mock('@stellar/stellar-sdk', () => {
	const actual = jest.requireActual('@stellar/stellar-sdk')
	return {
		...actual,
		rpc: {
			Server: jest.fn().mockImplementation(() => ({
				// Mock getHealth() to simulate a healthy Soroban RPC server
				getHealth: jest.fn().mockResolvedValue(healthyResponse),
			})),
		},
	}
})

describe('Soroban Client', () => {
	beforeEach(() => {
		// Clear all mocks before each test to avoid interference across tests
		jest.clearAllMocks()
	})

	it('connectSoroban() should create an RpcServer with the correct URL', () => {
		const server = connectSoroban()
		expect(server).toBeDefined()
		// Ensure the server was instantiated with the correct Soroban RPC URL
		expect(StellarSdk.rpc.Server).toHaveBeenCalledWith(envs.SOROBAN_RPC_URL)
	})

	it('connectSoroban() should return the same instance on multiple calls (singleton)', () => {
		const server1 = connectSoroban()
		const server2 = connectSoroban()
		expect(server1).toBe(server2)
	})

	it('isSorobanConnected() should return true when RPC responds healthy', async () => {
		const result = await isSorobanConnected()
		expect(result).toBe(true)

		const s = connectSoroban()
		expect(s.getHealth).toHaveBeenCalledTimes(1)
	})

	it('isSorobanConnected() should return false when getHealth() throws', async () => {
		const s = connectSoroban()
		// Simulate Horizon server failure
		jest.spyOn(s, 'getHealth').mockRejectedValueOnce(new Error('Failed'))

		const result = await isSorobanConnected()
		expect(result).toBe(false)
	})
})
