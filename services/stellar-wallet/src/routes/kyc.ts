import { type Request, type Response, Router } from 'express'
import { type KycRow, all, connectDB, initializeKycTable, run } from '../db/kyc'
import { validateKycData } from '../kyc/validate'
import { logError, logger } from '../middlewares/logger'

export const kycRouter = Router()

// POST /kyc/submit: validate input, create if not exists (idempotent by `document`), return stored record
kycRouter.post('/submit', async (req: Request, res: Response) => {
	try {
		const { isValid, errors, data } = validateKycData(req.body)
		if (!isValid || !data) return res.status(400).json({ errors })

		const { name, document } = data

		const db = await connectDB()
		await initializeKycTable(db) // safe if already created

		// Idempotent insert (requires UNIQUE index on `document`)
		await run(db, 'INSERT OR IGNORE INTO kyc (name, document, status) VALUES (?, ?, ?)', [
			name,
			document,
			'pending',
		])

		// Return the canonical stored row
		const rows = await all<KycRow>(
			db,
			'SELECT id, name, document, status FROM kyc WHERE document = ? LIMIT 1',
			[document],
		)
		const row = rows[0]
		if (!row) return res.status(500).json({ error: 'failed to persist kyc record' })

		logger.info({
			message: 'kyc_submitted',
			kyc_id: row.id,
			document_hash: Buffer.from(document).toString('base64'),
			user_id: undefined,
		})
		return res.status(201).json(row)
	} catch (err) {
		logError(err, { route: '/kyc/submit' })
		return res.status(500).json({ error: 'Internal server error' })
	}
})
