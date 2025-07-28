import { z } from 'zod'

export const transferFundsSchema = z.object({
	asset: z.string({
		required_error: 'Select an asset',
	}),
	amount: z.coerce
		.number({
			required_error: 'Amount required',
			invalid_type_error: 'Must be a number',
		})
		.positive('Amount must be positive'),
	destination: z.string().min(1, 'Destination wallet required'),
	memo: z.string().optional(),
})

export type TransferFundsFormValues = z.infer<typeof transferFundsSchema>
