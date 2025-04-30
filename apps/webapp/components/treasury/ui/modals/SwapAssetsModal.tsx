'use client'

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { SwapAssetsForm } from '../forms/SwapAssetsForm'

interface SwapAssetsModalProps {
	isOpen: boolean
	onClose: () => void
}

export default function SwapAssetsModal({ isOpen, onClose }: SwapAssetsModalProps) {
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
					<DialogTitle>Swap Assets</DialogTitle>
					<DialogDescription>Exchange one asset for another within the treasury.</DialogDescription>
				</DialogHeader>

				<SwapAssetsForm onClose={onClose} />
			</DialogContent>
		</Dialog>
	)
}
