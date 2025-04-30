import Header from '@/components/dashboard/Header'
import { ProposalList } from '@/components/proposals/ProposalList'
import { ProposalStats } from '@/components/proposals/ProposalStats'

export default function ProposalsPage() {
	return (
		<>
			<Header />
			<main className="min-h-screen bg-background">
				<div className="max-w-7xl mx-auto">
					<div className="container mx-auto py-6">
						<h1 className="text-3xl font-bold tracking-tight text-foreground">Proposals</h1>
						<p className="text-muted-foreground text-lg">
							Create, vote, and track governance proposals
						</p>
					</div>
					<div className="container mx-auto py-3">
						<ProposalStats />
					</div>
					<ProposalList />
				</div>
			</main>
		</>
	)
}
