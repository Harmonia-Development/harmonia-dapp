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
