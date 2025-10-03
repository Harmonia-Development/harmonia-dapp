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
	email: string
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
      email TEXT NOT NULL,
      name TEXT,
      document TEXT,
      status TEXT NOT NULL DEFAULT 'pending'
    );
  `
	await run(conn, sql)
	await run(conn, 'CREATE UNIQUE INDEX IF NOT EXISTS idx_kyc_email ON kyc (email);')
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
