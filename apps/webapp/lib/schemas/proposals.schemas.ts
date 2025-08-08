import { z } from 'zod'

export const CreateProposalFormSchema = z.object({
	title: z.string().min(5, { message: 'Title too short' }).max(100, { message: 'Title too long' }),
	category: z.enum(['community', 'technical', 'treasury', 'governance'] as const),
	description: z
		.string()
		.min(20, { message: 'Description too short' })
		.max(1000, { message: 'Description too long' }),
	timeLeft: z
		.string()
		.refine((val) => !Number.isNaN(Number(val)), {
			message: 'Must be a number',
		})
		.refine((val) => Number(val) > 0, {
			message: 'Must be greater than 0',
		})
		.refine((val) => Number(val) <= 90, {
			message: 'Max 90 days',
		}),
})
