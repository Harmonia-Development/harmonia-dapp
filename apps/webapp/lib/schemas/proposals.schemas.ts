import { z } from 'zod'

export const CreateProposalFormSchema = z.object({
	title: z
		.string()
		.min(5, { message: 'Title must be at least 5 characters' })
		.max(100, { message: 'Title must be less than 100 characters' }),
	category: z.enum(['community', 'technical', 'treasury', 'governance'] as const),
	description: z
		.string()
		.min(20, { message: 'Description must be at least 20 characters' })
		.max(1000, { message: 'Description must be less than 1000 characters' }),
	timeLeft: z
		.string()
		.refine((val) => !Number.isNaN(Number(val)), {
			message: 'Duration must be a number',
		})
		.refine((val) => Number(val) > 0, {
			message: 'Duration must be greater than 0',
		})
		.refine((val) => Number(val) <= 90, {
			message: 'Duration cannot exceed 90 days',
		}),
})
