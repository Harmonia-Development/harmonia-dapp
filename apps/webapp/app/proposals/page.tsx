import { ProposalCalendar } from '@/components/proposals/ProposalCalendar'
import { ProposalList } from '@/components/proposals/ProposalList'
import { ProposalStats } from '@/components/proposals/ProposalStats'



export default function ProposalsPage() {
	return (
		<>
			<main className="bg-black h-full md:h-screen">
				<div className="px-7 py-4">
					<div className="">
						<h1 className="text-3xl font-bold tracking-tight text-foreground">Proposals</h1>
						<p className="text-muted-foreground text-lg">
							Create, vote, and track governance proposals
						</p>
					</div>
					<div className="mt-7">
						<ProposalStats />
					</div>
					<ProposalList />
				</div>
				<div className='px-7'>
					<ProposalCalendar events={[]} className='w-full m' />
				</div>
			</main>
		</>
	)
}
