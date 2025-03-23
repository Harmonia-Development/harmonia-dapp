export type ProposalStatus = 'Active' | 'Passed' | 'Pending'
export type ProposalCategory = 'community' | 'technical' | 'treasury' | 'governance'

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
