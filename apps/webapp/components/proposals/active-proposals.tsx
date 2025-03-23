'use client'

import { ArrowRight } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Toaster } from '@/components/ui/toaster'
import { toast } from '@/hooks/use-toast'
import { proposals as sampleProposals } from '@/lib/mock-data/mock-proposals'
import type { CreateProposalFormValues } from '@/lib/types/proposals.types'
import { CreateProposalButton } from './create-proposal-button'
import { CreateProposalForm } from './create-proposal-form'
import { ProposalsList } from './proposals-list'

export function ActiveProposals() {
	const [proposals, setProposals] = useState(sampleProposals)
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

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
		<main className="space-y-4">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl">Active Proposals</h1>
					<p className="text-muted-foreground">Vote on current proposals or create a new one</p>
				</div>
				<CreateProposalButton onCreate={handleCreateProposal} />
			</div>

			<ProposalsList data={proposals} />

			<div className="flex items-center justify-between pt-4">
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
				<DialogContent className="sm:max-w-[550px]">
					<DialogHeader>
						<DialogTitle>Create New Proposal</DialogTitle>
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
