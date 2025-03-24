import type { z } from 'zod'
import type { CreateProposalFormSchema } from '../schemas/proposals.schemas'

export type ProposalStatus = 'Active' | 'Passed' | 'Pending'
export type ProposalCategory = 'community' | 'technical' | 'treasury' | 'governance'
export type VoteOption = 'for' | 'against' | 'abstain'
export type CreateProposalFormValues = z.infer<typeof CreateProposalFormSchema>

export interface ProposalVotes {
	for: number
	against: number
	abstain: number
}

export interface Creator {
	id: string
	initials: string
}

export interface Proposal {
	id: string
	title: string
	category: ProposalCategory
	status: ProposalStatus
	description: string
	timeLeft: string
	votes: ProposalVotes
	creator: Creator
}
