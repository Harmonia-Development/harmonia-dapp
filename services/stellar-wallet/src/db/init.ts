import { connectDB, initializeKycTable, initializeAccountsTable } from './kyc'
import { initializeWebAuthnCredentialsTable, initializeWebAuthnChallengesTable } from './webauthn'

export async function initializeDatabase(): Promise<void> {
	const db = await connectDB()

	await initializeKycTable(db)
	await initializeAccountsTable(db)
	await initializeWebAuthnCredentialsTable(db)
	await initializeWebAuthnChallengesTable(db)

	console.log('Database initialized successfully')
}
