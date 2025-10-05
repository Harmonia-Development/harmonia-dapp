import fs from 'node:fs'
import path from 'node:path'
import type sqlite3 from 'sqlite3'
import {
	type KycRow,
	type TransactionRow,
	all,
	closeDB,
	connectDB,
	findKycById,
	initializeAccountsTable,
	initializeKycTable,
	initializeTransactionsTable,
	insertAccount,
	insertTransaction,
	run,
} from '../../src/db/kyc'

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

	test('initializeAccountsTable creates accounts schema with FK/indexes and is idempotent', async () => {
		await expect(initializeAccountsTable(db)).resolves.toBeUndefined()
		// call again to verify idempotency
		await expect(initializeAccountsTable(db)).resolves.toBeUndefined()

		type PragmaCol = {
			cid: number
			name: string
			type: string
			notnull: number
			dflt_value: string | null
			pk: number
		}
		const cols = await all<PragmaCol>(db, "PRAGMA table_info('accounts');")
		const byName = Object.fromEntries(cols.map((c) => [c.name, c]))

		expect(byName.id).toBeDefined()
		expect(byName.id.type.toUpperCase()).toBe('INTEGER')
		expect(byName.id.pk).toBe(1)

		expect(byName.user_id).toBeDefined()
		expect(byName.user_id.type.toUpperCase()).toBe('INTEGER')
		expect(byName.user_id.notnull).toBe(1)

		expect(byName.public_key).toBeDefined()
		expect(byName.public_key.type.toUpperCase()).toBe('TEXT')
		expect(byName.public_key.notnull).toBe(1)

		expect(byName.private_key).toBeDefined()
		expect(byName.private_key.type.toUpperCase()).toBe('TEXT')
		expect(byName.private_key.notnull).toBe(1)

		// verify FK user_id -> kyc(id) with ON DELETE CASCADE
		type FK = {
			id: number
			seq: number
			table: string
			from: string
			to: string
			on_update: string
			on_delete: string
			match: string
		}
		const fks = await all<FK>(db, "PRAGMA foreign_key_list('accounts');")
		const fkUser = fks.find((f) => f.from === 'user_id')
		expect(fkUser).toBeDefined()
		expect(fkUser?.table.toLowerCase()).toBe('kyc')
		expect(fkUser?.to.toLowerCase()).toBe('id')
		expect((fkUser?.on_delete ?? '').toUpperCase()).toBe('CASCADE')

		// index metadata assertions
		type Idx = { seq: number; name: string; unique: number; origin: string; partial: number }
		const idx = await all<Idx>(db, "PRAGMA index_list('accounts');")
		const names = idx.map((i) => i.name)
		expect(names).toEqual(
			expect.arrayContaining(['idx_accounts_public_key', 'idx_accounts_user_id']),
		)
		const pkIdx = idx.find((i) => i.name === 'idx_accounts_public_key')
		expect(pkIdx?.unique).toBe(1)
		const uidIdx = idx.find((i) => i.name === 'idx_accounts_user_id')
		expect(uidIdx?.unique).toBe(0)

		type IdxInfo = { seqno: number; cid: number; name: string }
		const pkCols = await all<IdxInfo>(db, "PRAGMA index_info('idx_accounts_public_key');")
		expect(pkCols.map((c) => c.name)).toEqual(['public_key'])
		const uidCols = await all<IdxInfo>(db, "PRAGMA index_info('idx_accounts_user_id');")
		expect(uidCols.map((c) => c.name)).toEqual(['user_id'])
	})

	test('findKycById returns null for missing and row for existing', async () => {
		// should return null when no KYC row matches
		const miss = await findKycById(db, 999999)
		expect(miss).toBeNull()

		// insert a KYC row and ensure it can be retrieved by id
		await run(db, 'INSERT INTO kyc (name, document, status) VALUES (?, ?, ?)', [
			'Carol',
			'DOC-FIND-1',
			'approved',
		])
		const rows = await all<KycRow>(db, 'SELECT * FROM kyc WHERE document = ?', ['DOC-FIND-1'])
		const carol = rows[0]
		const found = await findKycById(db, carol.id)
		expect(found?.id).toBe(carol.id)
		expect(found?.name).toBe('Carol')
	})

	test('insertAccount inserts, enforces UNIQUE(public_key) and FK CASCADE', async () => {
		// create a KYC row to associate accounts with
		await run(db, 'INSERT INTO kyc (name, document, status) VALUES (?, ?, ?)', [
			'Dave',
			'DOC-ACC-UNIQ',
			'approved',
		])
		const kycRows = await all<KycRow>(db, 'SELECT * FROM kyc WHERE document = ?', ['DOC-ACC-UNIQ'])
		const userId = kycRows[0].id

		const publicKey = 'GTESTPUBLICKEYUNIQUE0000000000000000000000000000000000000'
		const enc = 'AAAAAA==:BBBBBBBBBBBBBBBBBBBBBQ==:CCCCCCCCCC=='

		// first insert should succeed
		await expect(
			insertAccount(db, { user_id: userId, public_key: publicKey, private_key_encrypted: enc }),
		).resolves.toBeUndefined()

		// inserting the same public_key should violate the UNIQUE constraint
		await expect(
			insertAccount(db, { user_id: userId, public_key: publicKey, private_key_encrypted: enc }),
		).rejects.toThrow()

		// deleting the KYC row should cascade and remove dependent accounts
		await run(db, 'DELETE FROM kyc WHERE id = ?', [userId])
		const accounts = await all<{ id: number }>(db, 'SELECT id FROM accounts WHERE user_id = ?', [
			userId,
		])
		expect(accounts.length).toBe(0)
	})

	test('initializeTransactionsTable creates transactions schema with FK/indexes and is idempotent', async () => {
		await expect(initializeTransactionsTable(db)).resolves.toBeUndefined()
		// call again to verify idempotency
		await expect(initializeTransactionsTable(db)).resolves.toBeUndefined()

		type PragmaCol = {
			cid: number
			name: string
			type: string
			notnull: number
			dflt_value: string | null
			pk: number
		}
		const cols = await all<PragmaCol>(db, "PRAGMA table_info('transactions');")
		const byName = Object.fromEntries(cols.map((c) => [c.name, c]))

		// id
		expect(byName.id).toBeDefined()
		expect(byName.id.type.toUpperCase()).toBe('INTEGER')
		expect(byName.id.pk).toBe(1)

		// user_id
		expect(byName.user_id).toBeDefined()
		expect(byName.user_id.type.toUpperCase()).toBe('INTEGER')
		expect(byName.user_id.notnull).toBe(1)

		// transaction_hash
		expect(byName.transaction_hash).toBeDefined()
		expect(byName.transaction_hash.type.toUpperCase()).toBe('TEXT')
		expect(byName.transaction_hash.notnull).toBe(1)

		// status
		expect(byName.status).toBeDefined()
		expect(byName.status.type.toUpperCase()).toBe('TEXT')
		expect(byName.status.notnull).toBe(1)

		// verify FK user_id -> kyc(id) with ON DELETE CASCADE
		type FK = {
			id: number
			seq: number
			table: string
			from: string
			to: string
			on_update: string
			on_delete: string
			match: string
		}
		const fks = await all<FK>(db, "PRAGMA foreign_key_list('transactions');")
		const fkUser = fks.find((f) => f.from === 'user_id')
		expect(fkUser).toBeDefined()
		expect(fkUser?.table.toLowerCase()).toBe('kyc')
		expect(fkUser?.to.toLowerCase()).toBe('id')
		expect((fkUser?.on_delete ?? '').toUpperCase()).toBe('CASCADE')

		// index metadata assertions
		type Idx = { seq: number; name: string; unique: number; origin: string; partial: number }
		const idx = await all<Idx>(db, "PRAGMA index_list('transactions');")
		const names = idx.map((i) => i.name)
		expect(names).toEqual(
			expect.arrayContaining(['idx_transactions_user_id', 'idx_transactions_hash']),
		)
		const userIdx = idx.find((i) => i.name === 'idx_transactions_user_id')
		expect(userIdx?.unique).toBe(0)
		const hashIdx = idx.find((i) => i.name === 'idx_transactions_hash')
		expect(hashIdx?.unique).toBe(1)

		type IdxInfo = { seqno: number; cid: number; name: string }
		const userCols = await all<IdxInfo>(db, "PRAGMA index_info('idx_transactions_user_id');")
		expect(userCols.map((c) => c.name)).toEqual(['user_id'])
		const hashCols = await all<IdxInfo>(db, "PRAGMA index_info('idx_transactions_hash');")
		expect(hashCols.map((c) => c.name)).toEqual(['transaction_hash'])
	})

	test('insertTransaction inserts, enforces UNIQUE(transaction_hash) and FK CASCADE', async () => {
		// create a KYC row to associate transactions with
		await run(db, 'INSERT INTO kyc (name, document, status) VALUES (?, ?, ?)', [
			'Eve',
			'DOC-TX-UNIQ',
			'approved',
		])
		const kycRows = await all<KycRow>(db, 'SELECT * FROM kyc WHERE document = ?', ['DOC-TX-UNIQ'])
		const userId = kycRows[0].id

		const txHash = 'TX_HASH_UNIQUE_TEST_12345678901234567890'
		const status = 'success'

		// first insert should succeed
		await expect(
			insertTransaction(db, { user_id: userId, transaction_hash: txHash, status }),
		).resolves.toBeUndefined()

		// verify the transaction was inserted correctly
		const transactions = await all<TransactionRow>(
			db,
			'SELECT * FROM transactions WHERE transaction_hash = ?',
			[txHash],
		)
		expect(transactions.length).toBe(1)
		expect(transactions[0].user_id).toBe(userId)
		expect(transactions[0].transaction_hash).toBe(txHash)
		expect(transactions[0].status).toBe(status)

		// inserting the same transaction_hash should violate the UNIQUE constraint
		await expect(
			insertTransaction(db, { user_id: userId, transaction_hash: txHash, status: 'failed' }),
		).rejects.toThrow()

		// deleting the KYC row should cascade and remove dependent transactions
		await run(db, 'DELETE FROM kyc WHERE id = ?', [userId])
		const remainingTransactions = await all<{ id: number }>(
			db,
			'SELECT id FROM transactions WHERE user_id = ?',
			[userId],
		)
		expect(remainingTransactions.length).toBe(0)
	})

	test('can INSERT multiple transactions for same user with different hashes', async () => {
		// create a KYC row
		await run(db, 'INSERT INTO kyc (name, document, status) VALUES (?, ?, ?)', [
			'Frank',
			'DOC-TX-MULTI',
			'approved',
		])
		const kycRows = await all<KycRow>(db, 'SELECT * FROM kyc WHERE document = ?', ['DOC-TX-MULTI'])
		const userId = kycRows[0].id

		// insert multiple transactions for the same user
		const transactions = [
			{ hash: 'TX_HASH_1_AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', status: 'success' },
			{ hash: 'TX_HASH_2_BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB', status: 'failed' },
			{ hash: 'TX_HASH_3_CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC', status: 'pending' },
		]

		for (const tx of transactions) {
			await expect(
				insertTransaction(db, { user_id: userId, transaction_hash: tx.hash, status: tx.status }),
			).resolves.toBeUndefined()
		}

		// verify all transactions were inserted
		const allUserTransactions = await all<TransactionRow>(
			db,
			'SELECT * FROM transactions WHERE user_id = ? ORDER BY transaction_hash',
			[userId],
		)
		expect(allUserTransactions.length).toBe(3)
		expect(allUserTransactions.map((t) => t.status)).toEqual(['success', 'failed', 'pending'])
		expect(allUserTransactions.map((t) => t.transaction_hash)).toEqual([
			'TX_HASH_1_AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
			'TX_HASH_2_BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
			'TX_HASH_3_CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC',
		])
	})
})
