import { z } from 'zod'

export const depositFundsSchema = z.object({
	asset: z.string({
		required_error: 'Please select an asset',
	}),
	amount: z.coerce
		.number({
			required_error: 'Amount is required',
			invalid_type_error: 'Amount must be a number',
		})
		.positive('Amount must be positive'),
	source: z.string().min(1, 'Source wallet address is required'),
	memo: z.string().optional(),
})

export type DepositFundsFormValues = z.infer<typeof depositFundsSchema>
