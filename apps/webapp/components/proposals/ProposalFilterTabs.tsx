import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { ProposalStatus } from '@/lib/types/proposals.types'

interface ProposalFilterTabsProps {
	activeTab: ProposalStatus | 'all'
	onTabChange: (tab: ProposalStatus | 'all') => void
}

export function ProposalFilterTabs({ activeTab, onTabChange }: ProposalFilterTabsProps) {
	return (
		<Tabs value={activeTab} onValueChange={(value) => onTabChange(value as ProposalStatus | 'all')}>
			<TabsList className="grid grid-cols-5 md:w-auto w-full">
				<TabsTrigger value="all">All</TabsTrigger>
				<TabsTrigger value="active">Active</TabsTrigger>
				<TabsTrigger value="passed">Passed</TabsTrigger>
				<TabsTrigger value="rejected">Rejected</TabsTrigger>
				<TabsTrigger value="pending">Pending</TabsTrigger>
			</TabsList>
		</Tabs>
	)
}
