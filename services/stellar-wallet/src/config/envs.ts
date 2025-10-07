import dotenv from 'dotenv'
import { z } from 'zod'

// Load environment variables from .env file
dotenv.config()

// Define schema to validate required env vars
const envSchema = z.object({
	PORT: z.coerce.number().default(3000), // Parses PORT to number and defaults to 3000
	HORIZON_URL: z.url().default('https://horizon-testnet.stellar.org'), // Must be a valid URL
	SOROBAN_RPC_URL: z.url().default('https://soroban-testnet.stellar.org'), // Must be a valid URL
	STELLAR_SECRET_KEY:
		process.env.NODE_ENV === 'test'
			? z.string().default('STEST_MOCK_KEY_FOR_TESTING')
			: z.string().min(1, 'STELLAR_SECRET_KEY is required'),
	SOROBAN_CONTRACT_ID:
		process.env.NODE_ENV === 'test'
			? z.string().default('CTEST_MOCK_CONTRACT_FOR_TESTING')
			: z.string().min(1, 'SOROBAN_CONTRACT_ID is required'),
	JWT_SECRET:
		process.env.NODE_ENV === 'test'
			? z.string().default('test-jwt-secret-key-for-testing')
			: z.string().min(32, 'JWT_SECRET must be at least 32 characters long'),
})

// Validate and parse environment variables
const parsedEnv = envSchema.safeParse(process.env)

if (!parsedEnv.success) {
	console.error('❌ Invalid environment variables:', parsedEnv.error.format())
	process.exit(1) // Stop execution if validation fails
}

// Export validated configuration
const envs = parsedEnv.data
export default envs
