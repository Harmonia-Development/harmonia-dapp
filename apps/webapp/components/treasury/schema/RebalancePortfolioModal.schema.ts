import { z } from 'zod'

export const rebalancePortfolioSchema = z
	.object({
		xlm: z.coerce.number().min(0, 'Cannot be negative').max(100, 'Cannot exceed 100'),
		usdc: z.coerce.number().min(0, 'Cannot be negative').max(100, 'Cannot exceed 100'),
		eth: z.coerce.number().min(0, 'Cannot be negative').max(100, 'Cannot exceed 100'),
		btc: z.coerce.number().min(0, 'Cannot be negative').max(100, 'Cannot exceed 100'),
	})
	.refine(
		(data) => {
			const total = data.xlm + data.usdc + data.eth + data.btc
			return total === 100
		},
		{
			message: 'Total must equal 100%',
			path: ['xlm'],
		},
	)

export type RebalancePortfolioFormValues = z.infer<typeof rebalancePortfolioSchema>
