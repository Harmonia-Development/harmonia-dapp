'use client'

import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { ProposalCardSkeleton } from '@/components/ui/loading-skeletons'
import { useProposal } from '@/hooks/useProposal'
import type { Proposal } from '@/lib/contracts/proposal-contract'
import type { VoteOption } from '@/lib/types/proposals.types'
import { CreateProposalButton } from './CreateProposalButton'
import { ProposalCard } from './ProposalCard'

export function ActiveProposals() {
	const { getAllProposals, castVote } = useProposal()
	const [proposals, setProposals] = useState<Proposal[]>([])
	const [isLoading, setIsLoading] = useState(true)

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

	const handleVote = async (proposalId: string, vote: VoteOption) => {
		const ok = await castVote(Number(proposalId), vote)
		if (!ok) return
		setProposals((prev) =>
			prev.map((p) =>
				p.id === Number(proposalId)
					? {
							...p,
							for_votes: vote === 'For' ? p.for_votes + 1 : p.for_votes,
							against_votes: vote === 'Against' ? p.against_votes + 1 : p.against_votes,
							abstain_votes: vote === 'Abstain' ? p.abstain_votes + 1 : p.abstain_votes,
						}
					: p,
			),
		)
	}

	const active = proposals.filter((p) => p.status?.tag === 'Open')

	return (
		<section className="rounded-xl border bg-card text-card-foreground shadow p-6 space-y-4 mt-6">
			<div className="flex flex-col sm:flex-row gap-2 sm:gap-0 sm:items-center justify-between">
				<div>
					<h1 className="text-2xl">Active Proposals</h1>
					<p className="text-muted-foreground">Vote on current proposals or create a new one</p>
				</div>
				<CreateProposalButton />
			</div>

			{/* Proposal cards */}
			{isLoading ? (
				<div className="space-y-4">
					{Array.from({ length: 3 }).map((_, i) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: using index is fine for static skeletons
						<ProposalCardSkeleton key={`skeleton-${i}`} />
					))}
				</div>
			) : active.length > 0 ? (
				<div className="grid grid-cols-1 gap-3">
					{active.map((p) => (
						<ProposalCard key={p.id.toString()} {...p} onVote={handleVote} />
					))}
				</div>
			) : (
				<div className="text-center py-12 space-y-3">
					<p className="text-muted-foreground">No active proposals</p>
				</div>
			)}

			{/* Footer actions */}
			<div className="flex flex-col sm:flex-row gap-2 sm:gap-0 items-center justify-between">
				<Button asChild variant="ghost" className="font-semibold">
					<Link href="/proposals">View All Proposals</Link>
				</Button>
				<Button asChild variant="link" className="font-semibold">
					<Link href="/governance">
						Governance Details
						<ArrowRight className="ml-1 h-4 w-4" />
					</Link>
				</Button>
			</div>
		</section>
	)
}
