'use client'

import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { ProposalCalendar } from '@/components/proposals/ProposalCalendar'
import { ProposalCategoryChart } from '@/components/proposals/ProposalCategoryChart'
import { ProposalList } from '@/components/proposals/ProposalList'
import { ProposalStats } from '@/components/proposals/ProposalStats'
import { LayoutWrapper } from '@/components/ui/layout-wrapper'
import { ThemeWrapper } from '@/components/ui/theme-wrapper'
import { proposals as sampleProposals } from '@/lib/mock-data/proposals.mock'
import type { VoteOption } from '@/lib/types/proposals.types'
import { useMemo, useState } from 'react'

export default function ProposalsPage() {
	const [proposals, setProposals] = useState(sampleProposals)

	// Dynamically calculate category data based on current proposals
	const categoryData = useMemo(() => {
		if (proposals.length === 0) return []

		const categoryCounts = proposals.reduce(
			(acc, proposal) => {
				const category = proposal.category
				acc[category] = (acc[category] || 0) + 1
				return acc
			},
			{} as Record<string, number>,
		)

		const categoryConfig = {
			treasury: { name: 'Treasury', color: '#9333ea' },
			governance: { name: 'Governance', color: '#3b82f6' },
			community: { name: 'Community', color: '#22c55e' },
			technical: { name: 'Technical', color: '#f59e0b' },
		}

		return Object.entries(categoryCounts)
			.map(([category, count]) => {
				const config = categoryConfig[category as keyof typeof categoryConfig]
				return {
					name: config?.name || category,
					value: count,
					color: config?.color || '#6b7280',
				}
			})
			.sort((a, b) => b.value - a.value)
	}, [proposals])

	// Handle voting on proposals
	const handleVote = (proposalId: string, vote: VoteOption) => {
		setProposals((prevProposals) =>
			prevProposals.map((proposal) => {
				if (proposal.id === proposalId) {
					// Create a new votes object with updated values
					const updatedVotes = { ...proposal.votes }

					// Increment the selected vote type
					if (vote === 'for') updatedVotes.for += 1
					else if (vote === 'against') updatedVotes.against += 1
					else if (vote === 'abstain') updatedVotes.abstain += 1

					return {
						...proposal,
						votes: updatedVotes,
					}
				}
				return proposal
			}),
		)
	}

	return (
		<ErrorBoundary>
			<ThemeWrapper>
				<LayoutWrapper>
					<div>
						<h1 className="text-3xl font-bold tracking-tight">Proposals</h1>
						<p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
							Create, vote, and track governance proposals
						</p>
					</div>
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
						<div className="lg:col-span-2 space-y-6">
							<ErrorBoundary>
								<ProposalStats />
							</ErrorBoundary>
							<ErrorBoundary>
								<ProposalList
									data={proposals}
									onVote={handleVote}
									onSelect={(id) => console.log(`Selected proposal: ${id}`)}
								/>
							</ErrorBoundary>
						</div>
						<div className="space-y-6">
							<ErrorBoundary>
								<ProposalCategoryChart data={categoryData} />
							</ErrorBoundary>
							<ErrorBoundary>
								<ProposalCalendar events={[]} />
							</ErrorBoundary>
						</div>
					</div>
				</LayoutWrapper>
			</ThemeWrapper>
		</ErrorBoundary>
	)
}
