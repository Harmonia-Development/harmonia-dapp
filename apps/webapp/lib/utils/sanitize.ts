// Input sanitization - keep it simple
// TODO: Consider DOMPurify for production

export function sanitizeString(input: string): string {
	if (typeof input !== 'string') return ''

	// Remove HTML tags
	const withoutTags = input.replace(/<[^>]*>/g, '')

	// Escape basic HTML entities
	const escaped = withoutTags
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#x27;')

	return escaped.trim()
}

export function sanitizeEmail(email: string): string {
	if (typeof email !== 'string') return ''

	const sanitized = email.toLowerCase().trim()
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

	return emailRegex.test(sanitized) ? sanitized : ''
}

export function sanitizeWalletAddress(address: string): string {
	if (typeof address !== 'string') return ''

	const sanitized = address.trim()
	const stellarRegex = /^G[A-Z2-7]{55}$/

	return stellarRegex.test(sanitized) ? sanitized : ''
}

export function sanitizeNumber(input: string | number): number {
	const num = typeof input === 'string' ? Number.parseFloat(input) : input

	if (Number.isNaN(num) || !Number.isFinite(num)) {
		return 0
	}

	return num
}

// Quick sanitize object - handle common cases
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
	const sanitized = {} as T

	for (const [key, value] of Object.entries(obj)) {
		if (typeof value === 'string') {
			sanitized[key as keyof T] = sanitizeString(value) as T[keyof T]
		} else if (typeof value === 'number') {
			sanitized[key as keyof T] = sanitizeNumber(value) as T[keyof T]
		} else if (Array.isArray(value)) {
			sanitized[key as keyof T] = value.map((item) =>
				typeof item === 'string' ? sanitizeString(item) : item,
			) as T[keyof T]
		} else if (value && typeof value === 'object') {
			sanitized[key as keyof T] = sanitizeObject(value as Record<string, unknown>) as T[keyof T]
		} else {
			sanitized[key as keyof T] = value as T[keyof T]
		}
	}

	return sanitized
}
