import { BarChart3, Coins, LaptopMinimalCheck, Users } from 'lucide-react'
import { DashboardCard } from './DashboardCard'

export function DashboardMetrics() {
	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 mb-6">
			<DashboardCard
				title="Active Proposals"
				label="Completion"
				text="+2 since last week"
				value={12}
				change={{ value: 2, direction: 'up' }}
				completionPercentage={75}
				icon={LaptopMinimalCheck}
				color="blue"
			/>

			<DashboardCard
				title="Treasury Balance"
				label="Growth"
				text="+2.5% from last month"
				value={125_430}
				valueSuffix="XLM"
				change={{ value: 2.5, direction: 'up' }}
				completionPercentage={62}
				icon={Coins}
				color="green"
			/>

			<DashboardCard
				title="Active Members"
				label="Engagement"
				text="+180 new members this month"
				value={2345}
				change={{ value: 180, direction: 'up' }}
				completionPercentage={88}
				icon={Users}
				color="purple"
			/>

			<DashboardCard
				title="Governance Score"
				label="Rating"
				text="Top 5% of DAOs"
				value={92}
				valueSuffix="/100"
				change={{ value: 0, direction: 'up' }}
				completionPercentage={92}
				icon={BarChart3}
				color="orange"
			/>
		</div>
	)
}
