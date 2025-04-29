import { ProposalCalendar } from '@/components/proposals/ProposalCalendar'
import { ProposalFilterTabs } from '@/components/proposals/ProposalFilterTabs'
import { ProposalList } from '@/components/proposals/ProposalList'

// Sample proposal events data
const proposalEvents = [
	{
		date: '2025-04-15',
		label: 'Treasury Allocation',
		type: 'start',
	},
	{
		date: '2025-04-18',
		label: 'New Member Onboarding',
		type: 'voting',
	},
	{
		date: '2025-04-22',
		label: 'Protocol Upgrade',
		type: 'live',
	},
	{
		date: '2025-04-25',
		label: 'Governance Update',
		type: 'end',
	},
	{
		date: '2025-04-25',
		label: 'Community Fund',
		type: 'start',
	},
]

export default function ProposalsPage() {
	return (
		<div className="container py-6 space-y-6">
			<h1 className="text-3xl font-bold">Proposals</h1>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				<div className="md:col-span-2">
					<ProposalFilterTabs />
					<ProposalList />
				</div>

				<div>
					<ProposalCalendar events={proposalEvents} />
				</div>
			</div>
		</div>
	)
}
