import Header from '@/components/dashboard/Header'
import { ProposalList } from '@/components/proposals/ProposalList'

export default function ProposalsPage() {
	return (
		<>
			<Header />
			<main className="min-h-screen bg-background">
				<ProposalList />
			</main>
		</>
	)
}
