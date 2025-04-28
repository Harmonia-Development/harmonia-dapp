import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

export type ProposalStatus = 'all' | 'active' | 'passed' | 'rejected' | 'pending'

interface ProposalFilterTabsProps {
	activeTab: ProposalStatus
	onTabChange: (tab: ProposalStatus) => void
}

export function ProposalFilterTabs({ activeTab, onTabChange }: ProposalFilterTabsProps) {
	return (
		<Tabs value={activeTab} onValueChange={(value) => onTabChange(value as ProposalStatus)}>
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
