import fs from 'node:fs'
import path from 'node:path'
import type sqlite3 from 'sqlite3'
import { all, closeDB, connectDB, initializeKycTable, run } from '../../src/db/kyc'

const DB_FILE = path.resolve(__dirname, '../../src/config/db.test.sqlite')

describe('KYC SQLite module', () => {
	let db: sqlite3.Database

	beforeAll(async () => {
		// Start from a clean DB file
		if (fs.existsSync(DB_FILE)) {
			fs.unlinkSync(DB_FILE)
		}
		db = await connectDB()
	})

	afterAll(async () => {
		await closeDB()
		if (fs.existsSync(DB_FILE)) {
			fs.unlinkSync(DB_FILE)
		}
	})

	test('connectDB returns a working connection', async () => {
		// Simple pragma to ensure DB responds
		const rows = await all(db, 'PRAGMA foreign_keys;')
		console.log(rows)
		expect(Array.isArray(rows)).toBe(true)
	})

	test('connectDB is a singleton (same instance returned)', async () => {
		const db2 = await connectDB()
		expect(db2).toBe(db)
	})

	test('initializeKycTable creates table with the correct schema', async () => {
		await initializeKycTable(db)

		type PragmaInfo = {
			cid: number
			name: string
			type: string
			notnull: number
			dflt_value: string | null
			pk: number
		}

		const columns = await all<PragmaInfo>(db, "PRAGMA table_info('kyc');")
		console.log(columns)
		const byName = Object.fromEntries(columns.map((c) => [c.name, c]))

		// id
		expect(byName.id).toBeDefined()
		expect(byName.id.type.toUpperCase()).toBe('INTEGER')
		expect(byName.id.pk).toBe(1)

		// name
		expect(byName.name).toBeDefined()
		expect(byName.name.type.toUpperCase()).toBe('TEXT')
		expect(byName.name.notnull).toBe(1)

		// document
		expect(byName.document).toBeDefined()
		expect(byName.document.type.toUpperCase()).toBe('TEXT')
		expect(byName.document.notnull).toBe(1)

		// status
		expect(byName.status).toBeDefined()
		expect(byName.status.type.toUpperCase()).toBe('TEXT')
		expect(byName.status.notnull).toBe(1)
		// default 'pending' (SQLite may return quotes)
		const dflt = (byName.status.dflt_value || '').toLowerCase()
		expect(dflt.includes('pending')).toBe(true)
	})

	test('initializeKycTable is idempotent (no error when called twice)', async () => {
		await expect(initializeKycTable(db)).resolves.toBeUndefined()
		await expect(initializeKycTable(db)).resolves.toBeUndefined()

		const columns = await all<{ name: string }>(db, "PRAGMA table_info('kyc');")
		console.log(columns)
		expect(columns.map((c) => c.name).sort()).toEqual(['id', 'name', 'document', 'status'].sort())
	})

	test('can INSERT and SELECT from kyc', async () => {
		await run(db, 'INSERT INTO kyc (name, document) VALUES (?, ?)', ['Alice', 'DOC-001'])

		type KycRow = { id: number; name: string; document: string; status: string }
		const rows = await all<KycRow>(db, 'SELECT * FROM kyc WHERE name = ?', ['Alice'])
		console.log(rows)

		expect(rows.length).toBe(1)
		expect(rows[0].document).toBe('DOC-001')
		expect(rows[0].status).toBe('pending') // default value
	})
})
