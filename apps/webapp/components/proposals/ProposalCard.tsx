'use client'

import { cva } from 'class-variance-authority'
import { AlertTriangle, Calendar, Check, Clock, X } from 'lucide-react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import type {
	Creator,
	ProposalCategory,
	ProposalStatus,
	ProposalVotes,
	VoteOption,
} from '@/lib/types/proposals.types'

export interface ProposalCardProps {
	id: string
	title: string
	category: ProposalCategory
	status: ProposalStatus
	description: string
	timeLeft: string
	createdAt: string
	votes: ProposalVotes
	creator: Creator
	onSelect: (proposalId: string) => void
	onVote: (proposalId: string, vote: VoteOption) => void
}

// Define variants for category badges
const categoryVariants = cva('rounded-full', {
	variants: {
		category: {
			community: 'bg-emerald-500/10 text-emerald-500',
			technical: 'bg-amber-500/10 text-amber-500',
			treasury: 'bg-blue-500/10 text-blue-500',
			governance: 'bg-purple-500/10 text-purple-500',
		},
	},
	defaultVariants: {
		category: 'community',
	},
})

export function ProposalCard({
	id,
	title,
	category,
	status,
	description,
	timeLeft,
	createdAt,
	votes,
	creator,
	onSelect,
	onVote,
}: ProposalCardProps) {
	// Calculate total votes
	const totalVotes = votes.for + votes.against + votes.abstain

	// Calculate percentages
	const forPercentage = totalVotes > 0 ? Math.round((votes.for / totalVotes) * 100) : 33
	const againstPercentage = totalVotes > 0 ? Math.round((votes.against / totalVotes) * 100) : 33
	const abstainPercentage = totalVotes > 0 ? Math.round((votes.abstain / totalVotes) * 100) : 33

	// Handle vote action
	const handleVote = (vote: VoteOption) => {
		onSelect(id)
		onVote(id, vote)
	}

	return (
		<Card className="w-full overflow-hidden hover:bg-muted/50">
			<CardHeader className="p-3 sm:p-4">
				<div className="flex items-start justify-between">
					<div className="space-y-1">
						<div className="flex flex-wrap items-center gap-1 sm:gap-2">
							<h3 className="text-base sm:text-lg">{title}</h3>
							<div className="flex items-center gap-1">
								{status === 'passed' && <Check className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />}
								{(status === 'pending' || status === 'active') && (
									<Clock className="h-3 w-3 sm:h-4 sm:w-4 text-amber-500" />
								)}
								{status === 'rejected' && <X className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />}
								{status === 'expired' && (
									<AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
								)}
								<span className="text-xs text-muted-foreground">
									{status.charAt(0).toUpperCase() + status.slice(1)}
								</span>
							</div>
							<Badge variant="outline" className={categoryVariants({ category })}>
								{category.charAt(0).toUpperCase() + category.slice(1)}
							</Badge>
						</div>
						<p className="text-sm text-muted-foreground">{description}</p>
					</div>
					<Avatar className="h-7 w-7 sm:h-8 sm:w-8">
						<AvatarFallback>{creator.initials}</AvatarFallback>
					</Avatar>
				</div>
			</CardHeader>
			{status !== 'pending' && (
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
			)}
			<CardContent className="px-4 pb-4 pt-2">
				<div className="flex items-center text-xs text-muted-foreground gap-1">
					<Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
					<span>
						Created on{' '}
						{new Date(createdAt).toLocaleDateString('en-US', {
							year: 'numeric',
							month: 'long',
							day: 'numeric',
						})}
						{status === 'active' && ` • ${timeLeft} days left`}
						{status === 'pending' && ` • Starts in ${timeLeft} days`}
					</span>
				</div>
			</CardContent>
			{status === 'active' && (
				<CardFooter className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-2 p-3 sm:p-4 pt-0 sm:pt-0">
					<Button variant="outline" className="font-semibold" onClick={() => handleVote('against')}>
						Vote Against
					</Button>
					<Button variant="default" className="font-semibold" onClick={() => handleVote('for')}>
						Vote For
					</Button>
					<Button
						variant="secondary"
						className="font-semibold"
						onClick={() => handleVote('abstain')}
					>
						Abstain
					</Button>
				</CardFooter>
			)}
		</Card>
	)
}
