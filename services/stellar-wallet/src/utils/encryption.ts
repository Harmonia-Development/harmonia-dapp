import crypto from 'node:crypto'

/**
 * Decodes ENCRYPTION_KEY from env (Base64 or Hex) and ensures 32 bytes.
 */
export function getEncryptionKey(): Buffer {
	const raw = process.env.ENCRYPTION_KEY
	if (!raw) {
		throw new Error('ENCRYPTION_KEY environment variable is required')
	}

	// try base64 first
	try {
		const b64 = Buffer.from(raw, 'base64')
		if (b64.length === 32) return b64
	} catch {
		/* noop */
	}

	// then hex
	try {
		const hex = Buffer.from(raw, 'hex')
		if (hex.length === 32) return hex
	} catch {
		/* noop */
	}

	throw new Error('ENCRYPTION_KEY must be 32 bytes (base64 or hex)')
}

/**
 * Encrypts plaintext using AES-256-GCM.
 * Returns compact string "iv:tag:ciphertext" (all parts Base64).
 */
export function encryptPrivateKey(plaintext: string, key: Buffer): string {
	// 12-byte IV is recommended for GCM
	const iv = crypto.randomBytes(12)
	const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
	const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
	const tag = cipher.getAuthTag()

	return `${iv.toString('base64')}:${tag.toString('base64')}:${ciphertext.toString('base64')}`
}

/**
 * Decrypts payload produced by `encryptPrivateKey` using AES-256-GCM.
 * Expects the compact format "iv:tag:ciphertext" (all Base64).
 *
 * Security notes:
 * - Validates IV length (12 bytes) and auth tag length (16 bytes) before decrypting.
 * - Throws on any malformed input or authentication failure.
 */
export function decryptPrivateKey(payload: string, key: Buffer): string {
	const parts = payload.split(':')
	if (parts.length !== 3) {
		throw new Error('Invalid encrypted payload format')
	}

	const [ivB64, tagB64, ctB64] = parts

	let iv: Buffer
	let tag: Buffer
	let ciphertext: Buffer
	try {
		iv = Buffer.from(ivB64, 'base64')
		tag = Buffer.from(tagB64, 'base64')
		ciphertext = Buffer.from(ctB64, 'base64')
	} catch {
		throw new Error('Invalid encrypted payload format')
	}

	// GCM requires a 12-byte nonce and a 16-byte auth tag for AES-256-GCM
	if (iv.length !== 12 || tag.length !== 16 || ciphertext.length === 0) {
		throw new Error('Invalid encrypted payload format')
	}

	try {
		const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
		decipher.setAuthTag(tag)
		const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()])
		return plaintext.toString('utf8')
	} catch {
		// Authentication failure or bad key
		throw new Error('Invalid encrypted payload format')
	}
}
