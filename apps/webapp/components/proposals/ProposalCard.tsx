'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import type { Proposal as TypesProposal, VoteOption } from '@/lib/types/proposals.types'
import { categoryVariants, renderStatus } from '@/lib/utils/proposal'
import { Calendar } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { MouseEvent } from 'react'

interface ProposalCardProps {
	proposal: TypesProposal
	onVote: (proposalId: string, vote: VoteOption) => void
}

export function ProposalCard({ proposal, onVote }: ProposalCardProps) {
	const router = useRouter()
	const proposalId = proposal.id

	const totalVotes = proposal.votes.for + proposal.votes.against + proposal.votes.abstain
	const forPercentage = totalVotes > 0 ? Math.round((proposal.votes.for / totalVotes) * 100) : 33
	const againstPercentage =
		totalVotes > 0 ? Math.round((proposal.votes.against / totalVotes) * 100) : 33
	const abstainPercentage =
		totalVotes > 0 ? Math.round((proposal.votes.abstain / totalVotes) * 100) : 33

	const handleCardClick = () => {
		router.push(`/proposals/${proposalId}`)
	}

	const handleVote = (e: MouseEvent, vote: VoteOption) => {
		e.stopPropagation()
		onVote(proposalId, vote)
	}

	// Convert status to contract format for renderStatus
	const statusInfo = renderStatus(proposal.status.toUpperCase())

	return (
		<Card
			className="w-full overflow-hidden hover:bg-muted/50 cursor-pointer flex flex-col"
			onClick={handleCardClick}
		>
			<CardHeader className="p-3 sm:p-4 pb-2">
				<div className="flex items-start justify-between">
					<div className="space-y-1 flex-1 min-w-0">
						<div className="flex flex-wrap items-center gap-1 sm:gap-2">
							<h3 className="text-base sm:text-lg truncate">{proposal.title}</h3>
							<div className="flex items-center gap-1 flex-shrink-0">
								{statusInfo.icon}
								<span className="text-xs text-muted-foreground">{statusInfo.label}</span>
							</div>
							<Badge
								variant="outline"
								className={categoryVariants({
									category: (proposal.category.charAt(0).toUpperCase() +
										proposal.category.slice(1)) as
										| 'Treasury'
										| 'Governance'
										| 'Community'
										| 'Technical',
								})}
							>
								{proposal.category}
							</Badge>
						</div>
						<p className="text-sm text-muted-foreground line-clamp-2">{proposal.description}</p>
					</div>
				</div>
			</CardHeader>

			<CardContent className="p-4 pt-0 pb-2">
				<div className="space-y-2">
					<div className="flex items-center justify-between text-xs">
						<p className="font-medium">For: {forPercentage}%</p>
						<p className="font-medium">Against: {againstPercentage}%</p>
						<p className="font-medium">Abstain: {abstainPercentage}%</p>
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

			<CardContent className="px-4 pb-2 pt-0">
				<div className="flex items-center text-xs text-muted-foreground gap-1">
					<Calendar className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
					<span className="truncate">
						Created on{' '}
						{new Date(proposal.createdAt).toLocaleDateString('en-US', {
							year: 'numeric',
							month: 'long',
							day: 'numeric',
						})}
					</span>
				</div>
			</CardContent>

			{proposal.status === 'active' && (
				<CardFooter className="p-3 sm:p-4 pt-0 mt-auto">
					<div className="grid grid-cols-3 gap-1.5 w-full">
						<Button
							variant="outline"
							size="sm"
							className="w-full text-green-600 border-green-600 hover:bg-green-50 hover:text-green-700 text-xs px-1"
							onClick={(e) => handleVote(e, 'For')}
						>
							<span className="truncate">Vote For</span>
						</Button>
						<Button
							variant="outline"
							size="sm"
							className="w-full text-red-600 border-red-600 hover:bg-red-50 hover:text-red-700 text-xs px-1"
							onClick={(e) => handleVote(e, 'Against')}
						>
							<span className="truncate">Vote Against</span>
						</Button>
						<Button
							variant="outline"
							size="sm"
							className="w-full text-gray-600 border-gray-600 hover:bg-gray-50 hover:text-gray-700 text-xs px-1"
							onClick={(e) => handleVote(e, 'Abstain')}
						>
							<span className="truncate">Abstain</span>
						</Button>
					</div>
				</CardFooter>
			)}
		</Card>
	)
}
