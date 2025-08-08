import { z } from 'zod'

export const depositFundsSchema = z.object({
	asset: z.string({
		required_error: 'Select an asset',
	}),
	amount: z.coerce
		.number({
			required_error: 'Amount required',
			invalid_type_error: 'Must be a number',
		})
		.positive('Amount must be positive'),
	source: z.string().min(1, 'Source wallet required'),
	memo: z.string().optional(),
})

export type DepositFundsFormValues = z.infer<typeof depositFundsSchema>
