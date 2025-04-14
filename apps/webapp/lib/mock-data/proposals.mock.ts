import type { Proposal } from '../types/proposals.types'

export const proposals: Proposal[] = [
	{
		id: '1',
		title: 'Community Garden Initiative',
		category: 'community',
		status: 'Active',
		description:
			'Fund the creation of a community garden in the local area to promote sustainability.',
		timeLeft: '2',
		votes: {
			for: 65,
			against: 25,
			abstain: 10,
		},
		creator: {
			id: 'user1',
			initials: 'ED',
		},
	},
	{
		id: '2',
		title: 'Protocol Upgrade v2.5',
		category: 'technical',
		status: 'Passed',
		description: 'Implement the latest protocol upgrade to improve security and performance.',
		timeLeft: '0',
		votes: {
			for: 82,
			against: 12,
			abstain: 6,
		},
		creator: {
			id: 'user2',
			initials: 'JW',
		},
	},
	{
		id: '3',
		title: 'Treasury Diversification',
		category: 'treasury',
		status: 'Active',
		description: 'Diversify the DAO treasury by allocating 10% to stablecoins for risk management.',
		timeLeft: '5',
		votes: {
			for: 48,
			against: 42,
			abstain: 10,
		},
		creator: {
			id: 'user3',
			initials: 'FD',
		},
	},
	{
		id: '4',
		title: 'Governance Framework Update',
		category: 'governance',
		status: 'Pending',
		description: 'Update the governance framework to improve decision-making processes.',
		timeLeft: '2',
		votes: {
			for: 0,
			against: 0,
			abstain: 0,
		},
		creator: {
			id: 'user4',
			initials: 'GA',
		},
	},
]
