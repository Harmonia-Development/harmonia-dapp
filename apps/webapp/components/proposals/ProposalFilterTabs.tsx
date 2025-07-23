import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { Proposal } from '@/lib/contracts/proposal-contract'

interface ProposalFilterTabsProps {
	activeTab: Proposal['status']['tag'] | 'all'
	onTabChange: (tab: Proposal['status']['tag'] | 'all') => void
}

export function ProposalFilterTabs({ activeTab, onTabChange }: ProposalFilterTabsProps) {
	return (
		<Tabs
			value={activeTab}
			onValueChange={(value) => onTabChange(value as Proposal['status']['tag'] | 'all')}
		>
			<TabsList className="grid grid-cols-5 md:w-auto w-full">
				<TabsTrigger value="all">All</TabsTrigger>
				<TabsTrigger value="Open">Open</TabsTrigger>
				<TabsTrigger value="Accepted">Accepted</TabsTrigger>
				<TabsTrigger value="Rejected">Rejected</TabsTrigger>
				<TabsTrigger value="Closed">Closed</TabsTrigger>
			</TabsList>
		</Tabs>
	)
}
