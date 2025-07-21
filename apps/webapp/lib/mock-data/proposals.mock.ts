import type { Proposal } from '../types/proposals.types'

export const proposals: Proposal[] = [
	{
		id: '1',
		title: 'Community Garden Initiative',
		category: 'community',
		status: 'active',
		description:
			'Fund the creation of a community garden in the local area to promote sustainability and community engagement. This proposal includes budget allocation for land, seeds, tools, and educational workshops.',
		timeLeft: '2',
		createdAt: '2023-05-15',
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
		status: 'passed',
		description:
			'Implement the latest protocol upgrade to improve security and performance. This upgrade addresses several vulnerabilities and optimizes gas usage for common operations.',
		timeLeft: '0',
		createdAt: '2023-05-10',
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
		status: 'active',
		description:
			'Diversify the DAO treasury by allocating 10% to stablecoins for risk management. This will provide a buffer against market volatility and ensure operational continuity during bear markets.',
		timeLeft: '5',
		createdAt: '2023-05-12',
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
		status: 'pending',
		description:
			'Update the governance framework to improve decision-making processes. The new framework introduces tiered voting weights based on contribution history and a formal dispute resolution mechanism.',
		timeLeft: '2',
		createdAt: '2023-05-18',
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
	{
		id: '5',
		title: 'Community Events Budget',
		category: 'community',
		status: 'rejected',
		description:
			'Allocate funds for quarterly community events and meetups. This budget will cover venue costs, refreshments, speaker honorariums, and promotional materials.',
		timeLeft: '0',
		createdAt: '2023-04-28',
		votes: {
			for: 35,
			against: 60,
			abstain: 5,
		},
		creator: {
			id: 'user5',
			initials: 'ET',
		},
	},
	{
		id: '6',
		title: 'Strategic Partnership with DeFi Alliance',
		category: 'governance',
		status: 'expired',
		description:
			'Establish a strategic partnership with the DeFi Alliance to gain access to mentorship, funding opportunities, and a broader network of DeFi projects.',
		timeLeft: '0',
		createdAt: '2023-04-15',
		votes: {
			for: 48,
			against: 48,
			abstain: 4,
		},
		creator: {
			id: 'user6',
			initials: 'PT',
		},
	},
]
