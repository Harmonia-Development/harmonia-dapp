'use client'

import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { ProposalDetail } from '@/components/proposals/ProposalDetail'
import { ProposalDetailSkeleton } from '@/components/proposals/ProposalDetailSkeleton'
import { Button } from '@/components/ui/button'
import { useProposal } from '@/hooks/useProposal'
import type { Proposal } from '@/lib/contracts/proposal-contract'
import type { VoteOption } from '@/lib/types/proposals.types'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export interface ProposalDetailWrapperProps {
	id: string
}

export function ProposalDetailWrapper({ id }: ProposalDetailWrapperProps) {
	const router = useRouter()
	const { getProposal, castVote } = useProposal()

	const [proposal, setProposal] = useState<Proposal | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [userVote, setUserVote] = useState<VoteOption | null>(null)

	useEffect(() => {
		async function loadProposal() {
			try {
				setLoading(true)
				setError(null)
				const data = await getProposal(Number(id))
				if (!data) throw new Error('Proposal not found')
				setProposal(data)
			} catch (err) {
				setError(err instanceof Error ? err.message : 'Failed to load proposal')
			} finally {
				setLoading(false)
			}
		}

		if (id) {
			loadProposal()
		}
	}, [id, getProposal])

	const handleVote = async (vote: VoteOption) => {
		if (!proposal) return

		const success = await castVote(proposal.id, vote)

		if (!success) return

		toast.success(`Your ${vote.toLowerCase()} vote has been recorded successfully.`)
		setUserVote(vote)

		setProposal((prev) => {
			if (!prev) return prev

			const updatedProposal = { ...prev }
			if (vote === 'For') updatedProposal.for_votes += 1
			else if (vote === 'Against') updatedProposal.against_votes += 1
			else if (vote === 'Abstain') updatedProposal.abstain_votes += 1

			return updatedProposal
		})
	}

	if (loading) {
		return (
			<main className="container mx-auto min-h-screen p-4 md:p-6">
				<ProposalDetailSkeleton />
			</main>
		)
	}

	if (error || !proposal) {
		return (
			<main className="container mx-auto min-h-screen p-4 md:p-6">
				<div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
					<h1 className="text-2xl font-bold text-destructive">Error</h1>
					<p className="text-muted-foreground">{error || 'Proposal not found'}</p>
					<Button
						onClick={() => router.back()}
						className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
					>
						Go Back
					</Button>
				</div>
			</main>
		)
	}

	return (
		<main className="container mx-auto min-h-screen p-4 md:p-6">
			<ErrorBoundary>
				<ProposalDetail proposal={proposal} onVote={handleVote} userVote={userVote} />
			</ErrorBoundary>
		</main>
	)
}
