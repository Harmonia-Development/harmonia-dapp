'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import type { Proposal } from '@/lib/contracts/proposal-contract'
import type { VoteOption } from '@/lib/types/proposals.types'
import { categoryVariants, renderStatus } from '@/lib/utils/proposal'
import { Calendar } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { MouseEvent } from 'react'

interface ProposalCardProps extends Proposal {
	onVote: (proposalId: string, vote: VoteOption) => void
}

export function ProposalCard({
	id,
	title,
	description,
	for_votes,
	against_votes,
	abstain_votes,
	status,
	proposal_type,
	created_at,
	onVote,
}: ProposalCardProps) {
	const router = useRouter()
	const proposalId = id.toString()

	const totalVotes = for_votes + against_votes + abstain_votes
	const forPercentage = totalVotes > 0 ? Math.round((for_votes / totalVotes) * 100) : 33
	const againstPercentage = totalVotes > 0 ? Math.round((against_votes / totalVotes) * 100) : 33
	const abstainPercentage = totalVotes > 0 ? Math.round((abstain_votes / totalVotes) * 100) : 33

	const handleCardClick = () => {
		router.push(`/proposals/${proposalId}`)
	}

	const handleVote = (e: MouseEvent, vote: VoteOption) => {
		e.stopPropagation()
		onVote(proposalId, vote)
	}

	const statusInfo = renderStatus(status.tag)

	return (
		<Card
			className="w-full overflow-hidden hover:bg-muted/50 cursor-pointer"
			onClick={handleCardClick}
		>
			<CardHeader className="p-3 sm:p-4">
				<div className="flex items-start justify-between">
					<div className="space-y-1">
						<div className="flex flex-wrap items-center gap-1 sm:gap-2">
							<h3 className="text-base sm:text-lg">{title}</h3>
							<div className="flex items-center gap-1">
								{statusInfo.icon}
								<span className="text-xs text-muted-foreground">{statusInfo.label}</span>
							</div>
							<Badge
								variant="outline"
								className={categoryVariants({ category: proposal_type.tag })}
							>
								{proposal_type.tag}
							</Badge>
						</div>
						<p className="text-sm text-muted-foreground">{description}</p>
					</div>
				</div>
			</CardHeader>

			<CardContent className="p-4 pt-0">
				<div className="space-y-2">
					<div className="flex items-center justify-between">
						<p className="text-sm font-medium">For: {forPercentage}%</p>
						<p className="text-sm font-medium">Against: {againstPercentage}%</p>
						<p className="text-sm font-medium">Abstain: {abstainPercentage}%</p>
					</div>
					<div className="h-2 w-full overflow-hidden rounded-full">
						<div className="flex h-full gap-1">
							<div className="bg-green-500" style={{ width: `${forPercentage}%` }} />
							<div className="bg-red-500" style={{ width: `${againstPercentage}%` }} />
							<div className="bg-gray-500" style={{ width: `${abstainPercentage}%` }} />
						</div>
					</div>
				</div>
			</CardContent>

			<CardContent className="px-4 pb-4 pt-2">
				<div className="flex items-center text-xs text-muted-foreground gap-1">
					<Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
					<span>
						Created on{' '}
						{new Date(Number(created_at) * 1000).toLocaleDateString('en-US', {
							year: 'numeric',
							month: 'long',
							day: 'numeric',
						})}
					</span>
				</div>
			</CardContent>

			{status.tag === 'Open' && (
				<CardFooter className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-2 p-3 sm:p-4 pt-0">
					<Button
						variant="outline"
						className="font-semibold"
						onClick={(e) => handleVote(e, 'Against')}
					>
						Vote Against
					</Button>
					<Button variant="default" className="font-semibold" onClick={(e) => handleVote(e, 'For')}>
						Vote For
					</Button>
					<Button
						variant="secondary"
						className="font-semibold"
						onClick={(e) => handleVote(e, 'Abstain')}
					>
						Abstain
					</Button>
				</CardFooter>
			)}
		</Card>
	)
}
