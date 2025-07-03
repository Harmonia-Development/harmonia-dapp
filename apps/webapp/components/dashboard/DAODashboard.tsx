import { BarChart3, FileText, Users, Wallet } from 'lucide-react'
import DashboardCard from './DashboardCard'

const DAODashboard: React.FC = () => {
	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-4 sm:p-6">
			<DashboardCard
				title="Active Proposals"
				label="Completion"
				text="+2 since last week"
				value={12}
				change={{ value: 2, direction: 'up' }}
				completionPercentage={75}
				icon={FileText}
				gradient={{
					from: 'from-blue-900/40',
					to: 'to-blue-950/40',
				}}
				iconBackground="bg-blue-500/20"
			/>

			<DashboardCard
				title="Treasury Balance"
				label="Growth"
				text="+2.5% from last month"
				value="125,430 XLM"
				change={{ value: 2.5, direction: 'up' }}
				completionPercentage={65}
				icon={Wallet}
				gradient={{
					from: 'from-green-900/40',
					to: 'to-green-950/40',
				}}
				iconBackground="bg-green-500/20"
			/>

			<DashboardCard
				title="Active Members"
				label="Engagement"
				text="+180 new members this month"
				value={2345}
				change={{ value: 180, direction: 'up' }}
				completionPercentage={75}
				icon={Users}
				gradient={{
					from: 'from-purple-900/40',
					to: 'to-purple-950/40',
				}}
				iconBackground="bg-purple-500/20"
			/>

			<DashboardCard
				title="Governance Score"
				label="Rating"
				text="5% of DAOs"
				value={92}
				change={{ value: 0, direction: 'up' }}
				completionPercentage={90}
				icon={BarChart3}
				gradient={{
					from: 'from-orange-900/40',
					to: 'to-orange-950/40',
				}}
				iconBackground="bg-orange-500/20"
			/>
		</div>
	)
}
export default DAODashboard
