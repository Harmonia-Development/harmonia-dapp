'use client'

import { ProposalCardSkeleton } from '@/components/ui/loading-skeletons'
import { Skeleton } from '@/components/ui/skeleton'
import type { Proposal } from '@/lib/contracts/proposal-contract'
import type { VoteOption } from '@/lib/types/proposals.types'
import { useState } from 'react'
import { CreateProposalButton } from './CreateProposalButton'
import { ProposalCard } from './ProposalCard'
import { ProposalFilterTabs } from './ProposalFilterTabs'
import { ProposalPagination } from './ProposalPagination'

interface ProposalListProps {
	data: Proposal[]
	onVote: (proposalId: string, vote: VoteOption) => void
	isLoading?: boolean
}

const ITEMS_PER_PAGE = 5

export function ProposalList({ data, onVote, isLoading = false }: ProposalListProps) {
	const [activeTab, setActiveTab] = useState<'All' | Proposal['status']['tag']>('All')
	const [currentPage, setCurrentPage] = useState(1)

	// Filter proposals based on status tag
	const filteredProposals = data.filter((proposal) => {
		if (activeTab === 'All') return true
		return proposal.status.tag === activeTab
	})

	// Paginate filtered proposals
	const totalPages = Math.ceil(filteredProposals.length / ITEMS_PER_PAGE)
	const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
	const paginatedProposals = filteredProposals.slice(startIndex, startIndex + ITEMS_PER_PAGE)

	if (isLoading) {
		return (
			<div className="rounded-xl border bg-card text-card-foreground shadow p-6 space-y-4">
				{/* Header + Button */}
				<div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-2">
					<div>
						<Skeleton className="h-8 w-48" />
						<Skeleton className="h-5 w-64 mt-2" />
					</div>
					<Skeleton className="h-10 w-32" />
				</div>

				{/* Filter tabs */}
				<div className="mb-6">
					<Skeleton className="h-10 w-full" />
				</div>

				{/* Proposal cards */}
				<div className="space-y-4">
					{Array.from({ length: 3 }).map((_, i) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: using index is fine for static skeletons
						<ProposalCardSkeleton key={`skeleton-${i}`} />
					))}
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
					<div className="text-center py-12 space-y-3">
						{data.length === 0 ? (
							<>
								<h2 className="text-xl font-semibold">No proposals yet</h2>
								<p className="text-muted-foreground">
									There are currently no governance proposals. Be the first to create one!
								</p>
							</>
						) : (
							<p className="text-muted-foreground">No proposals found for this filter.</p>
						)}
					</div>
				) : (
					<div className="space-y-4">
						{paginatedProposals.map((proposal) => (
							<ProposalCard key={proposal.id} {...proposal} onVote={onVote} />
						))}
					</div>
				)}
			</div>

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
