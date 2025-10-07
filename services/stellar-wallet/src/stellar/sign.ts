import { type FeeBumpTransaction, Keypair, StrKey, type Transaction } from '@stellar/stellar-sdk'
import type sqlite3 from 'sqlite3'
import { connectDB } from '../db/kyc'
import { findAccountByUserId } from '../db/kyc'
import { logError, logger } from '../middlewares/logger'
import { decryptPrivateKey, getEncryptionKey } from '../utils/encryption'

/** Union type for Stellar base transaction types we can sign. */
export type StellarTx = Transaction | FeeBumpTransaction

/**
 * Fetches and decrypts a user's Stellar secret seed (S...).
 * - Reads encrypted seed from `accounts.private_key` (format "iv:tag:ciphertext" base64)
 * - Decrypts using AES-256-GCM with ENCRYPTION_KEY (32 bytes)
 * - Returns a string that must start with 'S' and have length 56
 *
 * @throws Error('Account not found')  if the user has no account row
 * @throws Error('Decryption failed')  if payload format or key is invalid
 */
export async function getPrivateKey(userId: number, db?: sqlite3.Database): Promise<string> {
	const conn = db ?? (await connectDB())
	const row = await findAccountByUserId(conn, userId)
	logger.debug({ message: 'get_private_key_lookup', user_id: userId, found: Boolean(row) })

	if (!row) {
		throw new Error('Account not found')
	}

	const encrypted = row.private_key
	const key = getEncryptionKey()

	let secret: string
	try {
		secret = decryptPrivateKey(encrypted, key)
		logger.debug({ message: 'private_key_decrypted', user_id: userId })
	} catch (err) {
		// Normalize all decryption/format errors to the required message
		logError(err, { user_id: userId, context: 'decrypt_private_key' })
		throw new Error('Decryption failed')
	}

	// Minimal shape validation to avoid returning garbage
	if (!StrKey.isValidEd25519SecretSeed(secret)) {
		throw new Error('Decryption failed')
	}

	return secret
}

/**
 * Signs a Stellar Transaction or FeeBumpTransaction for the given user.
 * - Retrieves user's decrypted S-secret via `getPrivateKey`
 * - Builds a Keypair and invokes `tx.sign(keypair)`
 *
 * @returns The same transaction instance (signed)
 * @throws Error('Account not found') or Error('Decryption failed') bubbled from `getPrivateKey`
 */
export async function signTransaction(
	userId: number,
	tx: StellarTx,
	db?: sqlite3.Database,
): Promise<StellarTx> {
	logger.debug({ message: 'sign_transaction_start', user_id: userId })
	const secret = await getPrivateKey(userId, db)
	const keypair = Keypair.fromSecret(secret)

	// Side-effect: signs the instance in-place (SDK API)
	tx.sign(keypair)
	logger.debug({
		message: 'sign_transaction_success',
		user_id: userId,
		tx_hash: 'hash' in tx && typeof tx.hash === 'function' ? tx.hash().toString('hex') : undefined,
	})
	return tx
}
