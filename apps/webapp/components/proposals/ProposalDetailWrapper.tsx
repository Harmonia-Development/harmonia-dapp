'use client'

import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { ProposalDetail } from '@/components/proposals/ProposalDetail'
import { ProposalDetailSkeleton } from '@/components/proposals/ProposalDetailSkeleton'
import { Button } from '@/components/ui/button'
import type { Proposal } from '@/lib/contracts/src'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

// Mock API function - replace with actual backend call
async function fetchProposalById(id: string): Promise<Proposal> {
	// Simulate API delay
	await new Promise((resolve) => setTimeout(resolve, 1000))

	// Mock data - replace with actual API call
	const mockProposals: Record<string, Proposal> = {
		'1': {
			id: 1,
			title: 'Community Garden Initiative',
			description:
				'This proposal aims to fund the creation of a community garden in the local area to promote sustainability and community engagement. The initiative includes budget allocation for land acquisition, seeds, gardening tools, and educational workshops for community members. The garden will serve as a space for learning about sustainable agriculture, fostering community connections, and providing fresh produce for local families. We estimate the total cost to be 50,000 XLM, which will be distributed over 12 months to ensure proper implementation and maintenance of the project.',
			created_by: 'GCKFBEIYTKP56VOOHQHHUUQKQXPQZLW4EDVR3RZQX3VQZXVQZXVQZXVQ',
			created_at: BigInt(Math.floor(Date.now() / 1000) - 172800), // 2 days ago
			deadline: BigInt(Math.floor(Date.now() / 1000) + 518400), // 6 days from now
			proposal_type: { tag: 'Community', values: null },
			quorum: 1000,
			status: { tag: 'Open', values: null },
			for_votes: 650,
			against_votes: 250,
			abstain_votes: 100,
		},
		'2': {
			id: 2,
			title: 'Treasury Diversification Strategy',
			description:
				'Diversify the DAO treasury by allocating 10% to stablecoins for risk management. This will provide a buffer against market volatility and ensure operational continuity during bear markets.',
			created_by: 'GBCKFBEIYTKP56VOOHQHHUUQKQXPQZLW4EDVR3RZQX3VQZXVQZXVQZXVQ',
			created_at: BigInt(Math.floor(Date.now() / 1000) - 432000), // 5 days ago
			deadline: BigInt(Math.floor(Date.now() / 1000) + 259200), // 3 days from now
			proposal_type: { tag: 'Treasury', values: null },
			quorum: 1500,
			status: { tag: 'Open', values: null },
			for_votes: 480,
			against_votes: 420,
			abstain_votes: 100,
		},
		'3': {
			id: 3,
			title: 'Protocol Upgrade v2.5',
			description:
				'Implement the latest protocol upgrade to improve security and performance. This upgrade addresses several vulnerabilities and optimizes gas usage for common operations.',
			created_by: 'GCCKFBEIYTKP56VOOHQHHUUQKQXPQZLW4EDVR3RZQX3VQZXVQZXVQZXVQ',
			created_at: BigInt(Math.floor(Date.now() / 1000) - 1209600), // 14 days ago
			deadline: BigInt(Math.floor(Date.now() / 1000) - 86400), // 1 day ago (closed)
			proposal_type: { tag: 'Technical', values: null },
			quorum: 800,
			status: { tag: 'Accepted', values: null },
			for_votes: 820,
			against_votes: 120,
			abstain_votes: 60,
		},
		'4': {
			id: 4,
			title: 'Governance Framework Update',
			description:
				'Update the governance framework to improve decision-making processes. The new framework introduces tiered voting weights based on contribution history.',
			created_by: 'GDCKFBEIYTKP56VOOHQHHUUQKQXPQZLW4EDVR3RZQX3VQZXVQZXVQZXVQ',
			created_at: BigInt(Math.floor(Date.now() / 1000) - 86400), // 1 day ago
			deadline: BigInt(Math.floor(Date.now() / 1000) + 604800), // 7 days from now
			proposal_type: { tag: 'Governance', values: null },
			quorum: 1200,
			status: { tag: 'Open', values: null },
			for_votes: 0,
			against_votes: 0,
			abstain_votes: 0,
		},
	}

	const proposal = mockProposals[id]
	if (!proposal) {
		throw new Error('Proposal not found')
	}

	return proposal
}

export interface ProposalDetailWrapperProps {
	id: string
}

export function ProposalDetailWrapper({ id }: ProposalDetailWrapperProps) {
	const router = useRouter()
	const [proposal, setProposal] = useState<Proposal | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		async function loadProposal() {
			try {
				setLoading(true)
				setError(null)
				const data = await fetchProposalById(id)
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
	}, [id])

	const handleVote = async (vote: 'for' | 'against' | 'abstain') => {
		if (!proposal) return

		// Simulate API call
		await new Promise((resolve) => setTimeout(resolve, 500))

		// Update local state
		setProposal((prev) => {
			if (!prev) return prev

			const updatedProposal = { ...prev }
			if (vote === 'for') updatedProposal.for_votes += 1
			else if (vote === 'against') updatedProposal.against_votes += 1
			else if (vote === 'abstain') updatedProposal.abstain_votes += 1

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
				<ProposalDetail proposal={proposal} onVote={handleVote} />
			</ErrorBoundary>
		</main>
	)
}
