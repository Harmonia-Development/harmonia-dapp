'use client'

import { EmptyState } from '@/components/ui/EmptyState'
import { ChartSkeleton, ProposalCardSkeleton } from '@/components/ui/loading-skeletons'
import { Skeleton } from '@/components/ui/skeleton'
import type { Proposal } from '@/lib/types/proposals.types'
import type { ProposalStatus } from '@/lib/types/proposals.types'
import { Suspense, lazy, useState } from 'react'
import { CreateProposalButton } from './CreateProposalButton'
import { ProposalCard } from './ProposalCard'
import { ProposalFilterTabs } from './ProposalFilterTabs'
type FilterStatus = ProposalStatus | 'all'

// Lazy load heavy components
const ProposalCategoryChart = lazy(() =>
	import('./ProposalCategoryChart').then((module) => ({
		default: module.ProposalCategoryChart,
	})),
)

const mockProposals: Proposal[] = [
	{
		id: '1',
		title: 'Increase Developer Grants Budget',
		description:
			'Proposal to increase the budget allocated for developer grants by 20% to support ecosystem growth.',
		category: 'treasury',
		status: 'active',
		votes: {
			for: 7500,
			against: 2200,
			abstain: 300,
		},
		timeLeft: '10 days',
		createdAt: '2025-04-20',
		creator: {
			id: '1',
			initials: 'JD',
		},
	},
	{
		id: '2',
		title: 'Protocol Fee Adjustment',
		description:
			'Reduce protocol fees from 0.3% to 0.25% to improve competitiveness with other platforms.',
		category: 'governance',
		status: 'pending',
		votes: {
			for: 0,
			against: 0,
			abstain: 0,
		},
		timeLeft: '15 days',
		createdAt: '2025-05-01',
		creator: {
			id: '2',
			initials: 'AS',
		},
	},
	{
		id: '3',
		title: 'Add New Liquidity Incentives',
		description:
			'Propose new liquidity mining incentives for stable pairs to increase TVL on the platform.',
		category: 'treasury',
		status: 'passed',
		votes: {
			for: 8900,
			against: 1000,
			abstain: 100,
		},
		timeLeft: '0 days',
		createdAt: '2025-03-15',
		creator: {
			id: '3',
			initials: 'ML',
	},
	{
		id: '4',
		title: 'Emergency Security Upgrade',
		description:
			"Critical security upgrade for the protocol's smart contracts to patch potential vulnerabilities.",
		category: 'technical',
		status: 'rejected',
		votes: {
			for: 3500,
			against: 6400,
			abstain: 100,
		},
		timeLeft: '0 days',
		createdAt: '2025-03-01',
		creator: {
			id: '4',
			initials: 'SK',
		},
	},
	{
		id: '5',
		title: 'Community Fund Allocation',
		description:
			'Allocate 100,000 tokens from the community fund to support education and marketing initiatives.',
		category: 'treasury',
		status: 'active',
		votes: {
			for: 5200,
			against: 4700,
			abstain: 100,
		},
		timeLeft: '5 days',
		createdAt: '2025-04-15',
		creator: {
			id: '5',
			initials: 'RJ',
		},
	},
]

const categoryColors: Record<string, string> = {
	treasury: 'chart-blue',
	governance: 'chart-purple',
	community: 'chart-green',
	technical: 'warning',
}

interface ProposalListProps {
	isLoading?: boolean
}

export function ProposalList({ isLoading = false }: ProposalListProps) {
	const [activeTab, setActiveTab] = useState<FilterStatus>('all')

	const filteredProposals = mockProposals.filter((proposal) => {
		if (activeTab === 'all') return true
		return proposal.status === activeTab
	})

	// Aggregate data for the chart based on filtered proposals
	const categoryCounts = filteredProposals.reduce(
		(acc, proposal) => {
			const category = proposal.category
			acc[category] = (acc[category] || 0) + 1
			return acc
		},
		{} as { [key: string]: number },
	)

	const chartData = Object.entries(categoryCounts).map(([name, value]) => ({
		name,
		value,
		color: categoryColors[name] || 'gray-dark',
	}))

	if (isLoading) {
		return (
			<div className="w-full px-4 sm:px-6 lg:px-8 py-6">
				<div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
					<Skeleton className="h-8 w-64" />
					<Skeleton className="h-10 w-32" />
				</div>

				<div className="mb-6">
					<Skeleton className="h-10 w-full" />
				</div>

				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{['a', 'b', 'c', 'd', 'e', 'f'].map((key) => (
						<ProposalCardSkeleton key={`skeleton-${key}`} />
					))}
				</div>

				<div className="mb-6">
					<ChartSkeleton />
				</div>
			</div>
		)
	}

	return (
		<div className="w-full  lg:px-8 py-6">
			<div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
				<h1 className="text-2xl font-bold">Governance Proposals</h1>
				<CreateProposalButton />
			</div>

			<div className="mb-6">
				<ProposalFilterTabs activeTab={activeTab} onTabChange={setActiveTab} />
			</div>

			<div>
				{filteredProposals.length === 0 ? (
					<EmptyState
						title="No Proposals Yet"
						description="Create your first proposal to get started."
						actionButton={<CreateProposalButton />}
					/>
				) : (
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{filteredProposals.map((proposal) => (
							<ProposalCard
								key={proposal.id}
								proposal={proposal}
								onVote={(proposalId, vote) => {
									console.log(`Voting ${vote} on proposal ${proposalId}`)
									// TODO: Implement actual voting logic
								}}
							/>
						))}
					</div>
				)}
			</div>

			<div className="mt-6">
				<Suspense fallback={<ChartSkeleton />}>
					<ProposalCategoryChart data={chartData} />
				</Suspense>
			</div>
		</div>
	)
}
