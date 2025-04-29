'use client'

import { useState } from 'react'
import { CreateProposalButton } from './CreateProposalButton'
import { ProposalFilterTabs, type ProposalStatus } from './ProposalFilterTabs'
import { type Proposal, ProposalItemCard } from './ProposalItemCard'

// Mock data for proposals
const mockProposals: Proposal[] = [
	{
		id: '1',
		title: 'Increase Developer Grants Budget',
		summary:
			'Proposal to increase the budget allocated for developer grants by 20% to support ecosystem growth.',
		category: 'Treasury',
		status: 'active',
		votes: {
			for: 7500,
			against: 2200,
			abstain: 300,
		},
		startDate: '2025-04-20',
		endDate: '2025-04-30',
	},
	{
		id: '2',
		title: 'Protocol Fee Adjustment',
		summary:
			'Reduce protocol fees from 0.3% to 0.25% to improve competitiveness with other platforms.',
		category: 'Governance',
		status: 'pending',
		votes: {
			for: 0,
			against: 0,
			abstain: 0,
		},
		startDate: '2025-05-01',
		endDate: '2025-05-10',
	},
	{
		id: '3',
		title: 'Add New Liquidity Incentives',
		summary:
			'Propose new liquidity mining incentives for stable pairs to increase TVL on the platform.',
		category: 'Treasury',
		status: 'passed',
		votes: {
			for: 8900,
			against: 1000,
			abstain: 100,
		},
		startDate: '2025-03-15',
		endDate: '2025-03-25',
	},
	{
		id: '4',
		title: 'Emergency Security Upgrade',
		summary:
			"Critical security upgrade for the protocol's smart contracts to patch potential vulnerabilities.",
		category: 'Technical',
		status: 'rejected',
		votes: {
			for: 3500,
			against: 6400,
			abstain: 100,
		},
		startDate: '2025-03-01',
		endDate: '2025-03-10',
	},
	{
		id: '5',
		title: 'Community Fund Allocation',
		summary:
			'Allocate 100,000 tokens from the community fund to support education and marketing initiatives.',
		category: 'Treasury',
		status: 'active',
		votes: {
			for: 5200,
			against: 4700,
			abstain: 100,
		},
		startDate: '2025-04-15',
		endDate: '2025-04-25',
	},
]

export function ProposalList() {
	const [activeTab, setActiveTab] = useState<ProposalStatus>('all')

	// Filter proposals based on the active tab
	const filteredProposals = mockProposals.filter((proposal) => {
		if (activeTab === 'all') return true
		return proposal.status === activeTab
	})

	return (
		<div className="container mx-auto py-6">
			<div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
				<h1 className="text-2xl font-bold">Governance Proposals</h1>
				<CreateProposalButton />
			</div>

			<div className="mb-6">
				<ProposalFilterTabs activeTab={activeTab} onTabChange={setActiveTab} />
			</div>

			{filteredProposals.length === 0 ? (
				<div className="text-center py-12">
					<p className="text-muted-foreground">No proposals found for this filter.</p>
				</div>
			) : (
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{filteredProposals.map((proposal) => (
						<ProposalItemCard key={proposal.id} proposal={proposal} />
					))}
				</div>
			)}
		</div>
	)
}
