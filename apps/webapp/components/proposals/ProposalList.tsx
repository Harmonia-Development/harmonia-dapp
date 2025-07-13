'use client'

import { ChartSkeleton, ProposalCardSkeleton } from '@/components/ui/loading-skeletons'
import { Skeleton } from '@/components/ui/skeleton'
import type { Proposal, ProposalStatus, VoteOption } from '@/lib/types/proposals.types'
import { useState } from 'react'
import { CreateProposalButton } from './CreateProposalButton'
import { ProposalCard } from './ProposalCard'
import { ProposalFilterTabs } from './ProposalFilterTabs'
import { ProposalPagination } from './ProposalPagination'

interface ProposalListProps {
	data: Proposal[]
	onSelect: (proposalId: string) => void
	onVote: (proposalId: string, vote: VoteOption) => void
	isLoading?: boolean
}

const ITEMS_PER_PAGE = 5

export function ProposalList({ data, onSelect, onVote, isLoading = false }: ProposalListProps) {
	const [activeTab, setActiveTab] = useState<ProposalStatus | 'all'>('all')
	const [currentPage, setCurrentPage] = useState(1)

	const filteredProposals = data.filter((proposal) => {
		if (activeTab === 'all') return true
		return proposal.status === activeTab
	})

	// Paginate filtered proposals
	const totalPages = Math.ceil(filteredProposals.length / ITEMS_PER_PAGE)
	const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
	const paginatedProposals = filteredProposals.slice(startIndex, startIndex + ITEMS_PER_PAGE)

	if (isLoading) {
		return (
			<div className="container mx-auto py-6">
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
		<div className="rounded-xl border bg-card text-card-foreground shadow p-6 space-y-4">
			<div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-2">
				<div>
					<h1 className="text-2xl font-bold">All Proposals</h1>
					<p className="text-sm text-muted-foreground">Browse and vote on governance proposals</p>
				</div>
				<CreateProposalButton />
			</div>

			<div className="mb-6">
				<ProposalFilterTabs activeTab={activeTab} onTabChange={setActiveTab} />
			</div>

			<div>
				{paginatedProposals.length === 0 ? (
					<div className="text-center py-12">
						<p className="text-muted-foreground">No proposals found for this filter.</p>
					</div>
				) : (
					<div className="space-y-4">
						{paginatedProposals.map((proposal) => (
							<ProposalCard key={proposal.id} {...proposal} onSelect={onSelect} onVote={onVote} />
						))}
					</div>
				)}
			</div>

			{/* Pagination */}
			{totalPages > 1 && (
				<ProposalPagination
					currentPage={currentPage}
					totalPages={totalPages}
					onPageChange={setCurrentPage}
				/>
			)}
		</div>
	)
}
