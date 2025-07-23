'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import type { Proposal } from '@/lib/contracts/proposal-contract'
import type { VoteOption } from '@/lib/types/proposals.types'
import { cn } from '@/lib/utils'
import {
	categoryVariants,
	formatTimestamp,
	formatWalletAddress,
	getTimeRemaining,
	renderStatus,
} from '@/lib/utils/proposal'
import { motion } from 'framer-motion'
import {
	ArrowLeft,
	Calendar,
	Check,
	Clock,
	Minus,
	Target,
	ThumbsDown,
	ThumbsUp,
	User,
	Users,
	XCircle,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface ProposalDetailProps {
	proposal: Proposal
	onVote: (vote: VoteOption) => Promise<void>
	userVote: VoteOption | null
}

export function ProposalDetail({ proposal, onVote, userVote }: ProposalDetailProps) {
	const router = useRouter()
	const [isVoting, setIsVoting] = useState(false)

	const totalVotes = proposal.for_votes + proposal.against_votes + proposal.abstain_votes
	const forPercentage = totalVotes > 0 ? Math.round((proposal.for_votes / totalVotes) * 100) : 0
	const againstPercentage =
		totalVotes > 0 ? Math.round((proposal.against_votes / totalVotes) * 100) : 0
	const abstainPercentage =
		totalVotes > 0 ? Math.round((proposal.abstain_votes / totalVotes) * 100) : 0

	const timeRemaining = getTimeRemaining(proposal.deadline)
	const isOpen = proposal.status.tag === 'Open' && !timeRemaining.isExpired

	const handleVote = async (vote: VoteOption) => {
		if (!isOpen || isVoting) return

		try {
			setIsVoting(true)
			await onVote(vote)
		} catch {
		} finally {
			setIsVoting(false)
		}
	}

	console.log(proposal.status.tag)

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
			className="space-y-6"
		>
			{/* Back Button */}
			<Button variant="ghost" onClick={() => router.push('/proposals')} className="mb-4">
				<ArrowLeft className="h-4 w-4 mr-2" />
				Back to Proposals
			</Button>

			{/* Header Card */}
			<Card className="bg-card border-border/40">
				<CardHeader className="pb-4">
					<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
						<div className="space-y-3">
							<div className="flex flex-wrap items-center">
								<Badge
									variant="outline"
									className="flex items-center gap-1 border-none text-xs text-muted-foreground"
								>
									{renderStatus(proposal.status.tag).icon}
									<span>{renderStatus(proposal.status.tag).label}</span>
								</Badge>

								<Badge
									className={categoryVariants({
										category: proposal.proposal_type.tag,
									})}
								>
									{proposal.proposal_type.tag}
								</Badge>
							</div>
							<CardTitle className="text-2xl sm:text-3xl font-bold leading-tight">
								{proposal.title}
							</CardTitle>
						</div>
					</div>
				</CardHeader>

				<CardContent className="space-y-6">
					{/* Metadata */}
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
						<div className="flex items-center gap-2">
							<User className="h-4 w-4 text-muted-foreground" />
							<div>
								<p className="text-muted-foreground">Created by</p>
								<p className="font-mono text-xs">{formatWalletAddress(proposal.created_by)}</p>
							</div>
						</div>

						<div className="flex items-center gap-2">
							<Calendar className="h-4 w-4 text-muted-foreground" />
							<div>
								<p className="text-muted-foreground">Created</p>
								<p className="font-medium">{formatTimestamp(proposal.created_at)}</p>
							</div>
						</div>

						<div className="flex items-center gap-2">
							<Clock className="h-4 w-4 text-muted-foreground" />
							<div>
								<p className="text-muted-foreground">Deadline</p>
								<p className={cn('font-medium', timeRemaining.isExpired && 'text-red-500')}>
									{timeRemaining.text}
								</p>
							</div>
						</div>

						<div className="flex items-center gap-2">
							<Target className="h-4 w-4 text-muted-foreground" />
							<div>
								<p className="text-muted-foreground">Quorum</p>
								<p className="font-medium">
									{proposal.quorum !== undefined
										? proposal.quorum.toLocaleString()
										: 'No quorum set'}
								</p>
							</div>
						</div>
					</div>

					<Separator />

					{/* Description */}
					<div className="space-y-3">
						<h3 className="text-lg font-semibold">Description</h3>
						<p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
							{proposal.description}
						</p>
					</div>
				</CardContent>
			</Card>

			{/* Voting Section */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Vote Breakdown */}
				<Card className="lg:col-span-2 bg-card border-border/40">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Users className="h-5 w-5" />
							Voting Results
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-6">
						{/* Vote Statistics */}
						<div className="grid grid-cols-3 gap-4">
							<div className="text-center space-y-2">
								<div className="flex items-center justify-center gap-2">
									<ThumbsUp className="h-4 w-4 text-green-500" />
									<span className="text-sm font-medium text-green-500">For</span>
								</div>
								<div className="text-2xl font-bold">{proposal.for_votes.toLocaleString()}</div>
								<div className="text-sm text-muted-foreground">{forPercentage}%</div>
							</div>

							<div className="text-center space-y-2">
								<div className="flex items-center justify-center gap-2">
									<ThumbsDown className="h-4 w-4 text-red-500" />
									<span className="text-sm font-medium text-red-500">Against</span>
								</div>
								<div className="text-2xl font-bold">{proposal.against_votes.toLocaleString()}</div>
								<div className="text-sm text-muted-foreground">{againstPercentage}%</div>
							</div>

							<div className="text-center space-y-2">
								<div className="flex items-center justify-center gap-2">
									<Minus className="h-4 w-4 text-gray-500" />
									<span className="text-sm font-medium text-gray-500">Abstain</span>
								</div>
								<div className="text-2xl font-bold">{proposal.abstain_votes.toLocaleString()}</div>
								<div className="text-sm text-muted-foreground">{abstainPercentage}%</div>
							</div>
						</div>

						{/* Progress Bars */}
						<div className="space-y-3">
							<div className="text-sm font-medium">Vote distribution</div>

							<div className="h-2 w-full overflow-hidden rounded-full">
								<div className="flex h-full gap-1">
									<div className="bg-green-500" style={{ width: `${forPercentage}%` }} />
									<div className="bg-red-500" style={{ width: `${againstPercentage}%` }} />
									<div className="bg-gray-500" style={{ width: `${abstainPercentage}%` }} />
								</div>
							</div>

							<div className="flex justify-between text-xs text-muted-foreground mt-1">
								<span>For: {forPercentage}%</span>
								<span>Against: {againstPercentage}%</span>
								<span>Abstain: {abstainPercentage}%</span>
							</div>
						</div>

						<div className="pt-2 border-t">
							<div className="flex justify-between text-sm">
								<span className="font-medium">Total Votes</span>
								<span>{totalVotes.toLocaleString()}</span>
							</div>
							<div className="flex justify-between text-sm text-muted-foreground mt-1">
								<span>Quorum Required</span>
								<span>
									{proposal.quorum !== undefined
										? proposal.quorum.toLocaleString()
										: 'No quorum set'}
								</span>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Vote Actions */}
				<Card className="bg-card border-border/40">
					<CardHeader>
						<CardTitle>Cast Your Vote</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						{isOpen ? (
							<>
								<p className="text-sm text-muted-foreground">
									Choose your vote on this proposal. Your vote will be recorded on the blockchain.
								</p>

								<div className="flex flex-col gap-2 sm:gap-4">
									<Button
										variant="outline"
										className="font-semibold flex justify-center gap-2"
										onClick={() => handleVote('Against')}
										disabled={isVoting}
									>
										Vote Against
										{userVote === 'Against' && <Check className="h-4 w-4" />}
									</Button>
									<Button
										variant="default"
										className="font-semibold flex justify-center gap-2"
										onClick={() => handleVote('For')}
										disabled={isVoting}
									>
										Vote For
										{userVote === 'For' && <Check className="h-4 w-4" />}
									</Button>
									<Button
										variant="secondary"
										className="font-semibold flex justify-center gap-2"
										onClick={() => handleVote('Abstain')}
										disabled={isVoting}
									>
										Abstain
										{userVote === 'Abstain' && <Check className="h-4 w-4" />}
									</Button>
								</div>

								{userVote && (
									<motion.div
										initial={{ opacity: 0, scale: 0.95 }}
										animate={{ opacity: 1, scale: 1 }}
										className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg"
									>
										<p className="text-sm text-green-600 dark:text-green-400">
											✓ Your {userVote} vote has been recorded
										</p>
									</motion.div>
								)}
							</>
						) : (
							<div className="text-center py-8 space-y-3">
								<div className="text-muted-foreground">
									{timeRemaining.isExpired ? (
										<Clock className="h-8 w-8 mx-auto mb-2" />
									) : (
										<XCircle className="h-8 w-8 mx-auto mb-2" />
									)}
								</div>
								<p className="font-medium">
									{timeRemaining.isExpired ? 'Voting Period Ended' : 'Voting Closed'}
								</p>
								<p className="text-sm text-muted-foreground">
									This proposal is no longer accepting votes
								</p>
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</motion.div>
	)
}
