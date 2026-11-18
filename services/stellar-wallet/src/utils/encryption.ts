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