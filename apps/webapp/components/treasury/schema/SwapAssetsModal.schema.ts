import { z } from 'zod'

export const swapAssetsSchema = z
	.object({
		fromAsset: z.string({
			required_error: 'Select source asset',
		}),
		toAsset: z.string({
			required_error: 'Select destination asset',
		}),
		amount: z.coerce
			.number({
				required_error: 'Amount required',
				invalid_type_error: 'Must be a number',
			})
			.positive('Amount must be positive'),
	})
	.refine((data) => data.fromAsset !== data.toAsset, {
		message: 'Source and destination must be different',
		path: ['toAsset'],
	})

export type SwapAssetsFormValues = z.infer<typeof swapAssetsSchema>
