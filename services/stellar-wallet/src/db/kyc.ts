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
