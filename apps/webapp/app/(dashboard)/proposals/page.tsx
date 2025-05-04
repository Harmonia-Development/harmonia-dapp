import Header from '@/components/dashboard/Header'
import { ProposalCalendar } from '@/components/proposals/ProposalCalendar'
import ProposalCategoryChart from '@/components/proposals/ProposalCategoryChart'
import { ProposalList } from '@/components/proposals/ProposalList'

const initialDummyData = [
	{ name: "Governance", color: "#8B5CF6", value: 28 },
	{ name: "Treasury", color: "#3B82F6", value: 42 },
	{ name: "Technical", color: "#F59E0B", value: 12 },
	{ name: "Community", color: "#10B981", value: 18 }
  ];

export default function ProposalsPage() {
	return (
		<div className="h-full md:h-screen">
			<Header />
			<div className="container mx-auto mt-5">
				<div className="flex flex-col md:flex-row justify-between">
					<div className="w-full grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
						<div className="order-1 md:order-1 md:col-span-1 lg:col-span-2">
							<ProposalList />
						</div>

						<div className="order-2 md:order-1 md:col-span-1">
							<ProposalCategoryChart data={initialDummyData}/>
							<div className="mt-6">
								<ProposalCalendar events={[]}/>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
