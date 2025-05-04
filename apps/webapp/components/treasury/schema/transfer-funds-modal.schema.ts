import { z } from 'zod'

export const transferFundsSchema = z.object({
	asset: z.string({
		required_error: 'Please select an asset',
	}),
	amount: z.coerce
		.number({
			required_error: 'Amount is required',
			invalid_type_error: 'Amount must be a number',
		})
		.positive('Amount must be positive'),
	destination: z.string().min(1, 'Destination wallet address is required'),
	memo: z.string().optional(),
})

export type TransferFundsFormValues = z.infer<typeof transferFundsSchema>
