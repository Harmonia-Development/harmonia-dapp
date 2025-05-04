'use client'

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { RebalancePortfolioForm } from '../forms/RebalancePortfolioForm'

interface RebalancePortfolioModalProps {
	isOpen: boolean
	onClose: () => void
}

export default function RebalancePortfolioModal({ isOpen, onClose }: RebalancePortfolioModalProps) {
	return (
		<Dialog
			open={isOpen}
			onOpenChange={(open) => {
				if (!open) {
					onClose()
				}
			}}
		>
			<DialogContent className="sm:max-w-[500px] bg-background text-foreground">
				<DialogHeader>
					<DialogTitle>Rebalance Portfolio</DialogTitle>
					<DialogDescription>Adjust asset allocation to meet target percentages.</DialogDescription>
				</DialogHeader>

				<RebalancePortfolioForm onClose={onClose} />
			</DialogContent>
		</Dialog>
	)
}
