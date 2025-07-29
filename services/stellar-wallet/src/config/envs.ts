import dotenv from 'dotenv'
import { z } from 'zod'

// Load environment variables from .env file
dotenv.config()

// Define schema to validate required env vars
const envSchema = z.object({
	PORT: z.coerce.number().default(3000), // Parses PORT to number and defaults to 3000
	HORIZON_URL: z.url(), // Must be a valid URL
	SOROBAN_RPC_URL: z.url(), // Must be a valid URL
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
