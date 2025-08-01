import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import { useProposal } from '@/hooks/useProposal'
import type { CreateProposalFormValues } from '@/lib/types/proposals.types'
import { logDev } from '@/lib/utils/logger'
import { PlusCircle } from 'lucide-react'
import { useState } from 'react'
import { ErrorBoundary } from '../common/ErrorBoundary'
import { CreateProposalForm } from './CreateProposalForm'

export function CreateProposalButton() {
	const { createProposal } = useProposal()
	const [open, setOpen] = useState(false)

	const handleSubmit = async (values: CreateProposalFormValues) => {
		logDev('Submitting proposal:', values)

		const deadlineInSeconds = Math.floor(Date.now() / 1000) + Number(values.timeLeft) * 86400

		const success = await createProposal(
			values.title,
			values.description,
			BigInt(deadlineInSeconds),
			values.category,
			10,
		)

		if (success) {
			setOpen(false)
		}
	}

	const handleCancel = () => {
		setOpen(false)
	}

	return (
		<ErrorBoundary>
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogTrigger asChild>
					<Button size="default" className="font-medium">
						<PlusCircle className="mr-2 h-4 w-4" />
						Create Proposal
					</Button>
				</DialogTrigger>
				<DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
					<DialogHeader className="pb-4">
						<DialogTitle className="text-lg sm:text-xl">Create New Proposal</DialogTitle>
					</DialogHeader>
					<div className="py-2 sm:py-4">
						<CreateProposalForm onSubmit={handleSubmit} onCancel={handleCancel} />
					</div>
				</DialogContent>
			</Dialog>
		</ErrorBoundary>
	)
}
