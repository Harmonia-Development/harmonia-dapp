import { z } from 'zod'

/**
 * Validation rules:
 * - name: at least 2 characters, letters and spaces only (supports accents)
 * - document: 8–20 characters, alphanumeric only
 */
export const KycSchema = z.object({
	name: z
		.string('name is required and must be a string')
		.trim()
		.min(2, 'name must be at least 2 characters')
		.regex(/^[A-Za-zÀ-ÿ\s]+$/, 'name must contain only letters and spaces'),
	document: z
		.string('document is required and must be a string')
		.trim()
		.min(8, 'document must be between 8 and 20 characters')
		.max(20, 'document must be between 8 and 20 characters')
		.regex(/^[A-Za-z0-9]+$/, 'document must be alphanumeric'),
})

export type KycInput = z.infer<typeof KycSchema>

/**
 * Validates incoming KYC data.
 * @param input - Unknown payload to validate against KycSchema
 * @returns { isValid, errors, data }:
 *  - isValid: whether validation succeeded
 *  - errors: user-friendly error messages (empty when valid)
 *  - data: typed and trimmed payload when valid
 */
export function validateKycData(input: unknown): {
	isValid: boolean
	errors: string[]
	data?: KycInput
} {
	const result = KycSchema.safeParse(input)
	if (result.success) return { isValid: true, errors: [], data: result.data }

	const errors = result.error.issues.map((e) => e.message)
	return { isValid: false, errors }
}
