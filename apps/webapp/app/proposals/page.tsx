'use client'

import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { ProposalCalendar } from '@/components/proposals/ProposalCalendar'
import { ProposalCategoryChart } from '@/components/proposals/ProposalCategoryChart'
import { ProposalList } from '@/components/proposals/ProposalList'
import { ProposalStats } from '@/components/proposals/ProposalStats'
import { LayoutWrapper } from '@/components/ui/layout-wrapper'
import { ThemeWrapper } from '@/components/ui/theme-wrapper'
import { useProposal } from '@/hooks/useProposal'
import type { Proposal } from '@/lib/contracts/src'
import type { VoteOption } from '@/lib/types/proposals.types'
import { useEffect, useMemo, useState } from 'react'

export default function ProposalsPage() {
	const { getAllProposals, castVote } = useProposal()
	const [proposals, setProposals] = useState<Proposal[]>([])
	const [isLoading, setIsLoading] = useState(true)

	// Load proposals from contract
	useEffect(() => {
		const fetchProposals = async () => {
			try {
				setIsLoading(true)
				const result = await getAllProposals()
				setProposals(result)
			} catch (err) {
				console.error('Failed to load proposals:', err)
			} finally {
				setIsLoading(false)
			}
		}

		fetchProposals()
	}, [getAllProposals])

	// Calculate category data for chart
	const categoryData = useMemo(() => {
		if (proposals.length === 0) return []

		const categoryCounts = proposals.reduce(
			(acc, proposal) => {
				const category = proposal.proposal_type
				acc[category.tag] = (acc[category.tag] || 0) + 1
				return acc
			},
			{} as Record<string, number>,
		)

		const categoryConfig = {
			Treasury: { name: 'Treasury', color: '#9333ea' },
			Governance: { name: 'Governance', color: '#3b82f6' },
			Community: { name: 'Community', color: '#22c55e' },
			Technical: { name: 'Technical', color: '#f59e0b' },
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
	const handleVote = async (proposalId: string, vote: VoteOption) => {
		const success = await castVote(Number(proposalId), vote)
		if (!success) return

		setProposals((prevProposals) =>
			prevProposals.map((proposal) => {
				if (proposal.id === Number(proposalId)) {
					return {
						...proposal,
						for_votes: vote === 'For' ? proposal.for_votes + 1 : proposal.for_votes,
						against_votes: vote === 'Against' ? proposal.against_votes + 1 : proposal.against_votes,
						abstain_votes: vote === 'Abstain' ? proposal.abstain_votes + 1 : proposal.abstain_votes,
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
									isLoading={isLoading}
								/>
							</ErrorBoundary>
						</div>
						<div className="space-y-6">
							<ErrorBoundary>
								<ProposalCategoryChart data={categoryData} isLoading={isLoading} />
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
