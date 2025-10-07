import fs from 'node:fs'
import path from 'node:path'
import { promisify } from 'node:util'
import sqlite3 from 'sqlite3'

sqlite3.verbose()

// Pick DB file depending on environment
const DB_PATH =
	process.env.NODE_ENV === 'test'
		? path.resolve(__dirname, '../config/db.test.sqlite')
		: path.resolve(__dirname, '../config/db.sqlite')

let dbInstance: sqlite3.Database | null = null

export type KycRow = {
	id: number
	name: string
	document: string
	status: string
}

export type AccountRow = {
	id: number
	user_id: number
	public_key: string
	/** Encrypted seed in the format "iv:tag:ciphertext" (all Base64) */
	private_key: string
}

export type CredentialRow = {
	id: number
	kyc_id: number
	credential_id: string
	public_key: string
	counter: number
	created_at: string
}

export type TransactionRow = {
	id: number
	user_id: number
	transaction_hash: string
	status: string
}

/**
 * Returns a single shared SQLite database instance (singleton).
 * Creates the file/directory if missing and applies PRAGMAs once.
 */
export async function connectDB(): Promise<sqlite3.Database> {
	if (dbInstance) return dbInstance

	// Ensure the config directory exists before creating/opening the DB file
	const dir = path.dirname(DB_PATH)
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true })
	}

	dbInstance = await new Promise<sqlite3.Database>((resolve, reject) => {
		const instance = new sqlite3.Database(
			DB_PATH,
			sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, // Open in read/write mode and create if it doesn't exist
			(err) => {
				if (err) {
					reject(new Error(`sqlite connection error: ${err.message}`))
				} else {
					resolve(instance)
				}
			},
		)
	})

	// Enable foreign key constraint enforcement (disabled by default in SQLite)
	await run(dbInstance, 'PRAGMA foreign_keys = ON;')

	return dbInstance
}

/**
 * Creates the `kyc` table if it doesn't exist (idempotent).
 */
export async function initializeKycTable(db?: sqlite3.Database): Promise<void> {
	const conn = db ?? (await connectDB())
	const sql = `
    CREATE TABLE IF NOT EXISTS kyc (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      document TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending'
    );
  `
	await run(conn, sql)
	await run(conn, 'CREATE UNIQUE INDEX IF NOT EXISTS idx_kyc_document ON kyc (document);')
}

/**
 * Closes the singleton DB instance (mainly for tests/teardown).
 */
export async function closeDB(): Promise<void> {
	if (!dbInstance) return

	const instance = dbInstance
	await new Promise<void>((resolve, reject) => {
		instance.close((err) => (err ? reject(err) : resolve()))
	})
	dbInstance = null
}

/**
 * Helper to run SQL commands (INSERT, UPDATE, DELETE, CREATE...) with Promises.
 */
export function run(db: sqlite3.Database, sql: string, params: unknown[] = []): Promise<void> {
	const runAsync = promisify(db.run.bind(db)) as (sql: string, params?: unknown[]) => Promise<void>
	return runAsync(sql, params)
}

/**
 * Helper to execute SELECT queries and return all rows as an array.
 */
export function all<T = unknown>(
	db: sqlite3.Database,
	sql: string,
	params: unknown[] = [],
): Promise<T[]> {
	const allAsync = promisify(db.all.bind(db)) as (sql: string, params?: unknown[]) => Promise<T[]>
	return allAsync(sql, params)
}

/**
 * Creates the `accounts` table and indexes if not exist (idempotent).
 * FK: accounts.user_id → kyc(id) ON DELETE CASCADE
 */
export async function initializeAccountsTable(db?: sqlite3.Database): Promise<void> {
	const conn = db ?? (await connectDB())
	await run(
		conn,
		`
		CREATE TABLE IF NOT EXISTS accounts (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			user_id INTEGER NOT NULL,
			public_key TEXT NOT NULL,
			private_key TEXT NOT NULL,
			FOREIGN KEY (user_id) REFERENCES kyc(id) ON DELETE CASCADE
		);
	`,
	)
	await run(
		conn,
		'CREATE UNIQUE INDEX IF NOT EXISTS idx_accounts_public_key ON accounts (public_key);',
	)
	await run(conn, 'CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts (user_id);')
}

/**
 * Finds a KYC row by id or returns null.
 */
export async function findKycById(db: sqlite3.Database, id: number): Promise<KycRow | null> {
	const rows = await all<KycRow>(db, 'SELECT * FROM kyc WHERE id = ? LIMIT 1;', [id])
	return rows.length ? rows[0] : null
}

/**
 * Inserts a new account row.
 * @param db sqlite database
 * @param args values to insert (private_key_encrypted is stored in private_key)
 */
export async function insertAccount(
	db: sqlite3.Database,
	args: { user_id: number; public_key: string; private_key_encrypted: string },
): Promise<void> {
	const sql = 'INSERT INTO accounts (user_id, public_key, private_key) VALUES (?, ?, ?);'
	await run(db, sql, [args.user_id, args.public_key, args.private_key_encrypted])
}

/**
 * Finds an account row by user_id or returns null.
 * Reads from `accounts` table created by `initializeAccountsTable`.
 */
export async function findAccountByUserId(
	db: sqlite3.Database,
	userId: number,
): Promise<AccountRow | null> {
	const rows = await all<AccountRow>(db, 'SELECT * FROM accounts WHERE user_id = ? LIMIT 1;', [
		userId,
	])
	return rows.length ? rows[0] : null
}

/**
 * Creates the `credentials` table if not exist (idempotent).
 * FK: credentials.kyc_id → kyc(id) ON DELETE CASCADE
 */
export async function initializeCredentialsTable(db?: sqlite3.Database): Promise<void> {
	const conn = db ?? (await connectDB())
	await run(
		conn,
		`
		CREATE TABLE IF NOT EXISTS credentials (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			kyc_id INTEGER NOT NULL,
			credential_id TEXT NOT NULL UNIQUE,
			public_key TEXT NOT NULL,
			counter INTEGER DEFAULT 0,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (kyc_id) REFERENCES kyc(id) ON DELETE CASCADE
		);
	`,
	)
	await run(conn, 'CREATE INDEX IF NOT EXISTS idx_credentials_kyc_id ON credentials (kyc_id);')
}

/**
 * Creates the `transactions` table if it doesn't exist (idempotent).
 * FK: transactions.user_id → kyc(id) ON DELETE CASCADE
 */
export async function initializeTransactionsTable(db?: sqlite3.Database): Promise<void> {
	const conn = db ?? (await connectDB())
	const sql = `
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      transaction_hash TEXT NOT NULL,
      status TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES kyc(id) ON DELETE CASCADE
    );
  `
	await run(conn, sql)
	await run(conn, 'CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions (user_id);')
	await run(
		conn,
		'CREATE UNIQUE INDEX IF NOT EXISTS idx_transactions_hash ON transactions (transaction_hash);',
	)
}

/**
 * Finds credentials for a specific KYC user.
 */
export async function findCredentialsByKycId(
	db: sqlite3.Database,
	kycId: number,
): Promise<CredentialRow[]> {
	return await all<CredentialRow>(db, 'SELECT * FROM credentials WHERE kyc_id = ?;', [kycId])
}

/**
 * Finds a single credential by credential_id.
 */
export async function findCredentialById(
	db: sqlite3.Database,
	credentialId: string,
): Promise<CredentialRow | null> {
	const rows = await all<CredentialRow>(
		db,
		'SELECT * FROM credentials WHERE credential_id = ? LIMIT 1;',
		[credentialId],
	)
	return rows.length ? rows[0] : null
}

/**
 * Inserts a new transaction record.
 */
export async function insertTransaction(
	db: sqlite3.Database,
	args: { user_id: number; transaction_hash: string; status: string },
): Promise<void> {
	const sql = 'INSERT INTO transactions (user_id, transaction_hash, status) VALUES (?, ?, ?);'
	await run(db, sql, [args.user_id, args.transaction_hash, args.status])
}

/**
 * Retrieves all transactions for a given user, ordered by id DESC (newest first).
 */
export async function getTransactionsByUserId(
	db: sqlite3.Database,
	userId: number,
): Promise<TransactionRow[]> {
	return all<TransactionRow>(
		db,
		'SELECT id, user_id, transaction_hash, status FROM transactions WHERE user_id = ? ORDER BY id DESC;',
		[userId],
	)
}
