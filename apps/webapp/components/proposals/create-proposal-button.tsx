'use client'

import { Button } from '@/components/ui/button'

interface CreateProposalButtonProps {
	onCreate: () => void
}

export function CreateProposalButton({ onCreate }: CreateProposalButtonProps) {
	return (
		<Button className="font-semibold" onClick={onCreate}>
			Create Proposal
		</Button>
	)
}
