import { CheckCircle2, FileText, Users, XCircle } from 'lucide-react'
import { ProposalStatCard } from './ProposalStatCard'

export const ProposalStats = () => {
	return (
		<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
			<ProposalStatCard
				title="Active Proposals"
				value={12}
				description="Proposals open for voting"
				icon={<FileText />}
				percentage={35}
				progressLabel="Proportion"
				variant="info"
			/>
			<ProposalStatCard
				title="Passed Proposals"
				value={24}
				description="Successfully approved"
				icon={<CheckCircle2 />}
				percentage={65}
				progressLabel="Success Rate"
				variant="success"
			/>
			<ProposalStatCard
				title="Rejected Proposals"
				value={8}
				description="Did not reach consensus"
				icon={<XCircle />}
				percentage={25}
				progressLabel="Rejection Rate"
				variant="error"
			/>
			<ProposalStatCard
				title="Voter Participation"
				value={78}
				description="Average participation rate"
				icon={<Users />}
				percentage={78}
				progressLabel="Participation"
				variant="default"
			/>
		</div>
	)
}
