import type sqlite3 from 'sqlite3'
import request from 'supertest'
import { closeDB, connectDB, initializeKycTable } from '../../src/db/kyc'
import { app } from '../../src/index'

// Use an in-memory DB for tests (typed, no `any`)
jest.mock('../../src/db/kyc', () => {
	const sqlite3Req: typeof import('sqlite3') = require('sqlite3')
	const { promisify } = require('node:util')

	let db: sqlite3.Database | null = null

	const getDb = async (): Promise<sqlite3.Database> => {
		if (!db) {
			sqlite3Req.verbose()
			db = new sqlite3Req.Database(':memory:')
			const runAsync = promisify(db.run.bind(db)) as (
				sql: string,
				params?: unknown[],
			) => Promise<void>
			await runAsync('PRAGMA foreign_keys = ON;')
		}
		return db
	}

	const run = (database: sqlite3.Database, sql: string, params: unknown[] = []): Promise<void> => {
		const runAsync = promisify(database.run.bind(database)) as (
			sql: string,
			params?: unknown[],
		) => Promise<void>
		return runAsync(sql, params)
	}

	const all = <T = unknown>(
		database: sqlite3.Database,
		sql: string,
		params: unknown[] = [],
	): Promise<T[]> => {
		const allAsync = promisify(database.all.bind(database)) as (
			sql: string,
			params?: unknown[],
		) => Promise<T[]>
		return allAsync(sql, params)
	}

	return {
		connectDB: async (): Promise<sqlite3.Database> => getDb(),

		closeDB: async (): Promise<void> => {
			const instance = db
			if (!instance) return
			await new Promise<void>((resolve, reject) => {
				instance.close((err: Error | null) => (err ? reject(err) : resolve()))
			})
			db = null
		},

		// Create table + unique index; safe to call multiple times
		initializeKycTable: async (conn?: sqlite3.Database): Promise<void> => {
			const database = conn ?? (await getDb())
			const runAsync = promisify(database.run.bind(database)) as (
				sql: string,
				params?: unknown[],
			) => Promise<void>

			await runAsync(`
        CREATE TABLE IF NOT EXISTS kyc (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          document TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'pending'
        );
      `)
			await runAsync('CREATE UNIQUE INDEX IF NOT EXISTS idx_kyc_document ON kyc (document);')
		},

		// Promise-based helpers mirroring the real module
		run,
		all,
	}
})

beforeAll(async () => {
	const db = await connectDB()
	await initializeKycTable(db)
})

afterAll(async () => {
	await closeDB()
})

describe('POST /kyc/submit', () => {
	it('stores valid data and returns 201', async () => {
		const res = await request(app).post('/kyc/submit').send({
			name: 'Alice Doe',
			document: 'AB12345678',
		})

		expect(res.status).toBe(201)
		expect(res.body).toEqual(
			expect.objectContaining({
				id: expect.any(Number),
				name: 'Alice Doe',
				document: 'AB12345678',
				status: 'pending',
			}),
		)
	})

	it('rejects invalid input with 400 and errors[]', async () => {
		const res = await request(app).post('/kyc/submit').send({
			name: '  ',
			document: 'abc-123',
		})

		expect(res.status).toBe(400)
		expect(res.body).toHaveProperty('errors')
		expect(Array.isArray(res.body.errors)).toBe(true)
		expect(res.body.errors.length).toBeGreaterThan(0)
	})

	it('is idempotent for duplicate document', async () => {
		const first = await request(app).post('/kyc/submit').send({
			name: 'Bob',
			document: 'DUPLICATE01',
		})
		const second = await request(app).post('/kyc/submit').send({
			name: 'Bob Updated',
			document: 'DUPLICATE01',
		})

		expect(first.status).toBe(201)
		expect(second.status).toBe(201)
		expect(second.body.id).toBe(first.body.id)
		expect(second.body.document).toBe('DUPLICATE01')
	})
})
