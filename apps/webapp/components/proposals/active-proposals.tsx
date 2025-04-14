'use client'

import { ArrowRight } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Toaster } from '@/components/ui/toaster'
import { toast } from '@/hooks/use-toast'
import { proposals as sampleProposals } from '@/lib/mock-data/proposals.mock'
import type { CreateProposalFormValues, VoteOption } from '@/lib/types/proposals.types'
import { DialogDescription } from '@radix-ui/react-dialog'
import { CreateProposalButton } from './create-proposal-button'
import { CreateProposalForm } from './create-proposal-form'
import { ProposalsList } from './proposals-list'

export function ActiveProposals() {
	const [proposals, setProposals] = useState(sampleProposals)
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

	// Handle voting on proposals
	const handleVote = (proposalId: string, vote: VoteOption) => {
		setProposals((prevProposals) =>
			prevProposals.map((proposal) => {
				if (proposal.id === proposalId) {
					// Create a new votes object with updated values
					const updatedVotes = { ...proposal.votes }

					// Increment the selected vote type
					if (vote === 'for') updatedVotes.for += 1
					else if (vote === 'against') updatedVotes.against += 1
					else if (vote === 'abstain') updatedVotes.abstain += 1

					return {
						...proposal,
						votes: updatedVotes,
					}
				}
				return proposal
			}),
		)
	}

	// Handle opening the create proposal modal
	const handleCreateProposal = () => {
		setIsCreateModalOpen(true)
	}

	// Handle form submission
	const handleFormSubmit = (values: CreateProposalFormValues) => {
		// Create a new proposal
		const newProposal = {
			id: `${proposals.length + 1}`,
			title: values.title,
			category: values.category,
			status: 'Active' as const,
			description: values.description,
			timeLeft: values.timeLeft,
			votes: {
				for: 0,
				against: 0,
				abstain: 0,
			},
			creator: {
				id: 'currentUser', // In a real app, this would be the current user's ID
				initials: 'ME', // In a real app, this would be the current user's initials
			},
		}

		// Add the new proposal to the list
		setProposals([newProposal, ...proposals])

		// Close the modal
		setIsCreateModalOpen(false)

		// Show a success toast
		toast({
			title: 'Proposal Created',
			description: `Your proposal has been successfully created and will be active for ${values.timeLeft} days.`,
		})
	}

	return (
		<main className="rounded-xl border bg-card text-card-foreground shadow p-6 space-y-4">
			<div className="flex flex-col sm:flex-row gap-2 sm:gap-0 sm:items-center justify-between">
				<div>
					<h1 className="text-2xl">Active Proposals</h1>
					<p className="text-muted-foreground">Vote on current proposals or create a new one</p>
				</div>
				<CreateProposalButton onCreate={handleCreateProposal} />
			</div>

			<ProposalsList
				data={proposals}
				onVote={handleVote}
				onSelect={(id) => console.log(`Selected proposal: ${id}`)}
			/>

			<div className="flex flex-col sm:flex-row gap-2 sm:gap-0 items-center justify-between">
				<Button variant="ghost" className="font-semibold">
					View All Proposals
				</Button>
				<Button variant="link" className="font-semibold">
					Governance Details
					<ArrowRight className="h-4 w-4" />
				</Button>
			</div>

			{/* Create Proposal Modal */}
			<Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
				<DialogContent className="sm:max-w-[550px] max-h-[100vh] overflow-y-auto pb-6">
					<DialogHeader>
						<DialogTitle className="text-2xl font-medium">Create New Proposal</DialogTitle>
						<DialogDescription className="text-muted-foreground">
							Fill out the form below to submit a new proposal.
						</DialogDescription>
					</DialogHeader>
					<CreateProposalForm
						onSubmit={handleFormSubmit}
						onCancel={() => setIsCreateModalOpen(false)}
					/>
				</DialogContent>
			</Dialog>

			<Toaster />
		</main>
	)
}
