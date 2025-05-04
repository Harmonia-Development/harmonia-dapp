"use client"
import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { PlusCircle } from 'lucide-react'
import { useState } from 'react'

export function CreateProposalButton() {
	const [open, setOpen] = useState(false)
	const { toast } = useToast()

	const handleCreateProposal = () => {
		console.log('Create proposal button clicked')
		setOpen(false)
		toast({
			title: 'Create Proposal',
			description: 'This functionality will be implemented in a future update.',
		})
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button size="default" className="font-medium">
					<PlusCircle className="mr-2 h-4 w-4" />
					Create Proposal
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Create New Proposal</DialogTitle>
				</DialogHeader>
				<div className="py-4">
					<p className="text-muted-foreground">
						The proposal creation form will be implemented in a future update. This is just a
						placeholder.
					</p>
				</div>
				<div className="flex justify-end">
					<Button onClick={handleCreateProposal}>Continue</Button>
				</div>
			</DialogContent>
		</Dialog>
	)
}
