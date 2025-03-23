'use client'

import { cva } from 'class-variance-authority'
import { Check, Clock } from 'lucide-react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import type {
	Creator,
	ProposalCategory,
	ProposalStatus,
	ProposalVotes,
} from '@/lib/types/proposals.types'

export interface ProposalCardProps {
	title: string
	category: ProposalCategory
	status: ProposalStatus
	description: string
	timeLeft: string
	votes: ProposalVotes
	creator: Creator
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
	title,
	category,
	status,
	description,
	timeLeft,
	votes,
	creator,
}: ProposalCardProps) {
	// Calculate total votes
	const totalVotes = votes.for + votes.against + votes.abstain

	// Calculate percentages
	const forPercentage = totalVotes > 0 ? Math.round((votes.for / totalVotes) * 100) : 0
	const againstPercentage = totalVotes > 0 ? Math.round((votes.against / totalVotes) * 100) : 0
	const abstainPercentage = totalVotes > 0 ? Math.round((votes.abstain / totalVotes) * 100) : 0

	return (
		<Card className="w-full overflow-hidden hover:bg-muted/50">
			<CardHeader className="p-4">
				<div className="flex items-start justify-between">
					<div className="space-y-1">
						<div className="flex items-center gap-2">
							<h3 className="text-lg">{title}</h3>
							<Badge variant="outline" className={categoryVariants({ category })}>
								{category}
							</Badge>
							<div className="flex items-center gap-1">
								{status === 'Passed' ? (
									<Check className="h-4 w-4 text-green-500" />
								) : (
									<Clock className="h-4 w-4 text-amber-500" />
								)}
								<span className="text-xs text-muted-foreground">
									{status === 'Active'
										? `Active • ${timeLeft} days`
										: status === 'Pending'
											? `Pending • Starts in ${timeLeft} days`
											: 'Passed'}
								</span>
							</div>
						</div>
						<p className="text-muted-foreground">{description}</p>
					</div>
					<Avatar className="h-8 w-8">
						<AvatarFallback>{creator.initials}</AvatarFallback>
					</Avatar>
				</div>
			</CardHeader>
			{status !== 'Pending' && (
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
			{status === 'Active' && (
				<CardFooter className="grid grid-cols-3 gap-2 p-4 pt-0">
					<Button variant="outline" className="font-semibold">
						Vote Against
					</Button>
					<Button variant="default" className="font-semibold">
						Vote For
					</Button>
					<Button variant="secondary" className="font-semibold">
						Abstain
					</Button>
				</CardFooter>
			)}
		</Card>
	)
}
