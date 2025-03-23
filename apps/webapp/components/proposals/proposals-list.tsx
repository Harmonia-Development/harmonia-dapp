'use client'

import { useState } from 'react'

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import type { Proposal } from '@/lib/types/proposals.types'
import { ProposalCard } from './proposal-card'

interface ProposalsListProps {
	data: Proposal[]
}

export function ProposalsList({ data }: ProposalsListProps) {
	const [statusFilter, setStatusFilter] = useState<string>('all')
	const [categoryFilter, setCategoryFilter] = useState<string>('all')

	// Sort and filter proposals
	const sortedAndFilteredProposals = [...data]
		.filter((proposal) => statusFilter === 'all' || proposal.status === statusFilter)
		.filter((proposal) => categoryFilter === 'all' || proposal.category === categoryFilter)
		.sort((a, b) => {
			// Active proposals at the top
			if (a.status === 'Active' && b.status !== 'Active') return -1
			if (a.status !== 'Active' && b.status === 'Active') return 1

			// Then pending proposals
			if (a.status === 'Pending' && b.status !== 'Pending') return -1
			if (a.status !== 'Pending' && b.status === 'Pending') return 1

			// Passed proposals at the bottom
			return 0
		})

	return (
		<div className="space-y-4">
			<div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
				<h2 className="text-lg font-semibold">{sortedAndFilteredProposals.length} Proposals</h2>
				<div className="flex items-center space-x-2">
					<Select value={categoryFilter} onValueChange={setCategoryFilter}>
						<SelectTrigger className="h-8 w-[130px]">
							<SelectValue placeholder="Category" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Categories</SelectItem>
							<SelectItem value="community">Community</SelectItem>
							<SelectItem value="technical">Technical</SelectItem>
							<SelectItem value="treasury">Treasury</SelectItem>
							<SelectItem value="governance">Governance</SelectItem>
						</SelectContent>
					</Select>
					<Select value={statusFilter} onValueChange={setStatusFilter}>
						<SelectTrigger className="h-8 w-[130px]">
							<SelectValue placeholder="Status" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Status</SelectItem>
							<SelectItem value="Active">Active</SelectItem>
							<SelectItem value="Pending">Pending</SelectItem>
							<SelectItem value="Passed">Passed</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>
			<div className="max-h-[600px] overflow-y-auto pr-1 scrollbar-thin">
				<div className="space-y-4">
					{sortedAndFilteredProposals.map(({ id, ...proposal }) => (
						<ProposalCard key={id} {...proposal} />
					))}
					{sortedAndFilteredProposals.length === 0 && (
						<div className="flex h-40 items-center justify-center rounded-lg border border-dashed">
							<p className="text-center text-muted-foreground">No proposals match your filters</p>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}
