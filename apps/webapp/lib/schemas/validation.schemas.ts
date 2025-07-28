import { z } from 'zod'

// Basic validation patterns - keep it simple
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const stellarPattern = /^G[A-Z2-7]{55}$/

// Core schemas - what we actually need
export const baseStringSchema = z.string().min(1, 'Required').max(1000, 'Too long')

export const emailSchema = z
	.string()
	.email('Invalid email')
	.regex(emailPattern, 'Invalid email format')

export const stellarAddressSchema = z.string().regex(stellarPattern, 'Invalid Stellar address')

// User profile - practical fields only
export const userProfileSchema = z.object({
	name: z.string().min(2, 'Name too short').max(50, 'Name too long'),
	email: emailSchema,
	bio: z.string().max(500, 'Bio too long').optional(),
	website: z.string().url('Invalid URL').optional(),
})

// Proposal validation - business focused
export const proposalSchema = z.object({
	title: z
		.string()
		.min(5, 'Title too short')
		.max(100, 'Title too long')
		.refine((val) => !/<[^>]*>/.test(val), 'No HTML allowed'),
	description: z
		.string()
		.min(20, 'Description too short')
		.max(2000, 'Description too long')
		.refine((val) => !/<[^>]*>/.test(val), 'No HTML allowed'),
	category: z.enum(['community', 'technical', 'treasury', 'governance']),
	duration: z.number().min(1, 'Min 1 day').max(90, 'Max 90 days'),
	quorum: z.number().min(1, 'Min 1%').max(100, 'Max 100%').optional(),
})

// Treasury stuff - practical limits
export const treasuryTransactionSchema = z.object({
	asset: z.string().min(1, 'Asset required'),
	amount: z.number().positive('Amount must be positive').max(1000000, 'Amount too large'), // Practical limit
	recipient: stellarAddressSchema,
	memo: z.string().max(100, 'Memo too long').optional(),
})

// Member invite - business rules
export const memberInvitationSchema = z.object({
	email: emailSchema,
	role: z.enum(['member', 'moderator', 'admin']),
	message: z.string().max(500, 'Message too long').optional(),
	referralCode: z.string().min(6, 'Code required').max(20, 'Code too long'),
	expiresIn: z.enum(['1d', '7d', '30d']),
})

// Search - keep it simple
export const searchSchema = z.object({
	query: z.string().min(1, 'Query required').max(100, 'Query too long'),
	filters: z
		.object({
			category: z.enum(['all', 'proposals', 'members', 'treasury']).optional(),
			dateRange: z.enum(['all', 'today', 'week', 'month', 'year']).optional(),
			status: z.enum(['all', 'active', 'pending', 'completed']).optional(),
		})
		.optional(),
})

// User settings - practical fields
export const userSettingsSchema = z.object({
	theme: z.enum(['light', 'dark', 'auto']),
	notifications: z.object({
		email: z.boolean(),
		push: z.boolean(),
		inApp: z.boolean(),
	}),
	privacy: z.object({
		profileVisible: z.boolean(),
		activityPublic: z.boolean(),
	}),
})

// Comments - basic validation
export const commentSchema = z.object({
	content: z
		.string()
		.min(1, 'Comment cannot be empty')
		.max(1000, 'Comment too long')
		.refine((val) => !/<[^>]*>/.test(val), 'No HTML allowed'),
	parentId: z.string().optional(),
	proposalId: z.string().optional(),
})

// Export types for use
export type UserProfile = z.infer<typeof userProfileSchema>
export type Proposal = z.infer<typeof proposalSchema>
export type TreasuryTransaction = z.infer<typeof treasuryTransactionSchema>
export type MemberInvitation = z.infer<typeof memberInvitationSchema>
export type SearchQuery = z.infer<typeof searchSchema>
export type UserSettings = z.infer<typeof userSettingsSchema>
export type Comment = z.infer<typeof commentSchema>
