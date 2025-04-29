'use client'
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

export function AddToTreasuryButton() {
	const [open, setOpen] = useState(false)
	const { toast } = useToast()

	const handleAddToTreasury = () => {
		console.log('Add to Treasury button clicked')
		setOpen(false)
		toast({
			title: 'Add to Treasury',
			description: 'This functionality will be implemented in a future update.',
		})
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="default" size="default" className="font-medium">
					<PlusCircle className="mr-2 h-4 w-4" />
					Add to Treasury
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Add to Treasury</DialogTitle>
				</DialogHeader>
				<div className="py-4">
					<p className="text-muted-foreground">
						The treasury contribution form will be implemented in a future update. This is just a
						placeholder.
					</p>
				</div>
				<div className="flex justify-end">
					<Button onClick={handleAddToTreasury}>Continue</Button>
				</div>
			</DialogContent>
		</Dialog>
	)
}
