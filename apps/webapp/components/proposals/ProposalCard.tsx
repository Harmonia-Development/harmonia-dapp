'use client'

import { cva } from 'class-variance-authority'
import { AlertTriangle, Calendar, Check, Clock, X } from 'lucide-react'

// import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import type { Proposal } from '@/lib/contracts/src'
import type { VoteOption } from '@/lib/types/proposals.types'

interface ProposalCardProps extends Proposal {
	onSelect: (proposalId: string) => void
	onVote: (proposalId: string, vote: VoteOption) => void
	// creator: { initials: string }
}

const categoryVariants = cva('rounded-full', {
	variants: {
		category: {
			Community: 'bg-emerald-500/10 text-emerald-500',
			Technical: 'bg-amber-500/10 text-amber-500',
			Treasury: 'bg-blue-500/10 text-blue-500',
			Governance: 'bg-purple-500/10 text-purple-500',
		},
	},
	defaultVariants: {
		category: 'Community',
	},
})

function renderStatus(status: Proposal['status']['tag']) {
	switch (status) {
		case 'Accepted':
			return {
				icon: <Check className="h-4 w-4 text-green-500" />,
				label: 'Accepted',
			}
		case 'Rejected':
			return {
				icon: <X className="h-4 w-4 text-red-500" />,
				label: 'Rejected',
			}
		case 'Open':
			return {
				icon: <Clock className="h-4 w-4 text-amber-500" />,
				label: 'Open',
			}
		case 'Closed':
			return {
				icon: <AlertTriangle className="h-4 w-4 text-gray-400" />,
				label: 'Closed',
			}
		default:
			return { icon: null, label: status }
	}
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
	// creator,
	onSelect,
	onVote,
}: ProposalCardProps) {
	const totalVotes = for_votes + against_votes + abstain_votes

	const forPercentage = totalVotes > 0 ? Math.round((for_votes / totalVotes) * 100) : 33
	const againstPercentage = totalVotes > 0 ? Math.round((against_votes / totalVotes) * 100) : 33
	const abstainPercentage = totalVotes > 0 ? Math.round((abstain_votes / totalVotes) * 100) : 33

	const handleVote = (vote: VoteOption) => {
		onSelect(id.toString())
		onVote(id.toString(), vote)
	}

	const statusInfo = renderStatus(status.tag)

	return (
		<Card className="w-full overflow-hidden hover:bg-muted/50">
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

					{/*
					<Avatar className="h-7 w-7 sm:h-8 sm:w-8">
						<AvatarFallback>{creator.initials}</AvatarFallback>
					</Avatar>
					*/}
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
					<Button variant="outline" className="font-semibold" onClick={() => handleVote('Against')}>
						Vote Against
					</Button>
					<Button variant="default" className="font-semibold" onClick={() => handleVote('For')}>
						Vote For
					</Button>
					<Button
						variant="secondary"
						className="font-semibold"
						onClick={() => handleVote('Abstain')}
					>
						Abstain
					</Button>
				</CardFooter>
			)}
		</Card>
	)
}
