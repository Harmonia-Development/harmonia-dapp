import { createHash } from 'node:crypto'
import { Router, type Request, type Response } from 'express'
import * as StellarSdk from '@stellar/stellar-sdk'
import { connectDB, findKycById, run } from '../db/kyc'
import { validateKycData } from '../kyc/validate'
import { connectSoroban } from '../soroban/client'
import envs from '../config/envs'

export const kycVerifyRouter = Router()

interface VerifyKycRequest {
	kyc_id: string
	name: string
	document: string
}

interface VerifyKycResponse {
	kyc_id: string
	data_hash: string
	status: string
}

/**
 * POST /kyc/verify - Register KYC data in Soroban contract and update database
 */
kycVerifyRouter.post('/verify', async (req: Request, res: Response) => {
	try {
		const { kyc_id, name, document } = req.body as VerifyKycRequest

		// Validate required fields
		if (!kyc_id || typeof kyc_id !== 'string') {
			return res.status(400).json({ error: 'kyc_id is required and must be a string' })
		}

		// Validate KYC data using existing validator
		const validation = validateKycData({ name, document })
		if (!validation.isValid) {
			return res.status(400).json({ error: validation.errors.join(', ') })
		}

		// Connect to database and verify kyc_id exists
		const db = await connectDB()
		const kycRecord = await findKycById(db, parseInt(kyc_id))
		if (!kycRecord) {
			return res.status(400).json({ error: 'Invalid kyc_id' })
		}

		// Generate hash of KYC data
		const kycDataString = JSON.stringify({
			name: validation.data!.name,
			document: validation.data!.document,
		})
		const dataHash = createHash('sha256').update(kycDataString).digest('hex')

		// Connect to Soroban and prepare contract call
		const sorobanServer = connectSoroban()
		const sourceKeypair = StellarSdk.Keypair.fromSecret(envs.STELLAR_SECRET_KEY)
		const sourceAccount = await sorobanServer.getAccount(sourceKeypair.publicKey())

		// Build contract call transaction
		const contract = new StellarSdk.Contract(envs.SOROBAN_CONTRACT_ID)
		const operation = contract.call(
			'register_kyc',
			StellarSdk.nativeToScVal(kyc_id, { type: 'string' }),
			StellarSdk.nativeToScVal(dataHash, { type: 'string' }),
			StellarSdk.nativeToScVal('approved', { type: 'string' }),
		)

		const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
			fee: StellarSdk.BASE_FEE,
			networkPassphrase: StellarSdk.Networks.TESTNET,
		})
			.addOperation(operation)
			.setTimeout(30)
			.build()

		// Sign and submit transaction
		transaction.sign(sourceKeypair)
		const response = await sorobanServer.sendTransaction(transaction)

		if (response.status === 'ERROR') {
			throw new Error(`Contract call failed: ${response.errorResult}`)
		}

		// Wait for transaction confirmation
		let txResponse = await sorobanServer.getTransaction(response.hash)
		while (txResponse.status === 'NOT_FOUND') {
			await new Promise((resolve) => setTimeout(resolve, 1000))
			txResponse = await sorobanServer.getTransaction(response.hash)
		}

		if (txResponse.status !== 'SUCCESS') {
			throw new Error(`Transaction failed: ${txResponse.status}`)
		}

		// Update database status to approved
		await run(db, 'UPDATE kyc SET status = ? WHERE id = ?', ['approved', parseInt(kyc_id)])

		// Return success response
		const verifyResponse: VerifyKycResponse = {
			kyc_id,
			data_hash: dataHash,
			status: 'approved',
		}

		return res.status(201).json(verifyResponse)
	} catch (error) {
		console.error('KYC verification error:', error)
		return res.status(500).json({ error: 'Failed to register KYC' })
	}
})
