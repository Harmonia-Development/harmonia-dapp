'use client'

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { DepositFundsForm } from '../forms/DepositFundsForm'

interface DepositFundsModalProps {
	isOpen: boolean
	onClose: () => void
}

export default function DepositFundsModal({ isOpen, onClose }: DepositFundsModalProps) {
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
					<DialogTitle>Deposit Funds</DialogTitle>
					<DialogDescription>
						Add assets to the treasury from an external wallet or exchange.
					</DialogDescription>
				</DialogHeader>

				<DepositFundsForm onClose={onClose} />
			</DialogContent>
		</Dialog>
	)
}
