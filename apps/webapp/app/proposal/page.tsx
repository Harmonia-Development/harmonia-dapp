import { ProposalCalendar } from '@/components/proposals/ProposalCalendar'
import { ProposalList } from '@/components/proposals/ProposalList'



export default function ProposalsPage() {
	return (
		<div className="container py-6 space-y-6">
			<h1 className="text-3xl font-bold">Proposals</h1>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				<div className="md:col-span-2">
					<ProposalList />
				</div>

				<div>
					<ProposalCalendar events={[]} />
				</div>
			</div>
		</div>
	)
}
