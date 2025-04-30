'use client'

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { TransferFundsForm } from '../forms/TransferFundsForm'

interface TransferFundsModalProps {
	isOpen: boolean
	onClose: () => void
}

export default function TransferFundsModal({ isOpen, onClose }: TransferFundsModalProps) {
	return (
		<Dialog
			open={isOpen}
			onOpenChange={(open) => {
				if (!open) {
					onClose()
				}
			}}
		>
			<DialogContent className="sm:max-w-[425px] bg-background text-foreground">
				<DialogHeader>
					<DialogTitle>Transfer Funds</DialogTitle>
					<DialogDescription>
						Send assets from the treasury to another wallet or account.
					</DialogDescription>
				</DialogHeader>

				<TransferFundsForm onClose={onClose} />
			</DialogContent>
		</Dialog>
	)
}
