import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import type { CreateProposalFormValues } from '@/lib/types/proposals.types'
import { logDev } from '@/lib/utils/logger'
import { PlusCircle } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { ErrorBoundary } from '../common/ErrorBoundary'
import { CreateProposalForm } from './CreateProposalForm'

export function CreateProposalButton() {
	const [open, setOpen] = useState(false)

	const handleSubmit = (values: CreateProposalFormValues) => {
		logDev('Submitting proposal:', values)
		setOpen(false)
		toast.success(`Your proposal has been created and will be active for ${values.timeLeft} days.`)
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
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Create New Proposal</DialogTitle>
					</DialogHeader>
					<div className="py-4">
						<CreateProposalForm onSubmit={handleSubmit} onCancel={handleCancel} />
					</div>
				</DialogContent>
			</Dialog>
		</ErrorBoundary>
	)
}
