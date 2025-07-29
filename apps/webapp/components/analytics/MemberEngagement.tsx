import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

const engagementData = [
	{ name: 'Active', value: 65 },
	{ name: 'Occasional', value: 20 },
	{ name: 'Inactive', value: 15 },
] as const

const COLORS = {
	Active: 'chart-cyan',
	Occasional: 'chart-yellow',
	Inactive: 'chart-indigo',
} as const

export default function MemberEngagementChart() {
	return (
		<div className="w-full max-w-md mx-auto p-4 text-white rounded-xl shadow-lg">
			<h2 className="text-center text-lg font-semibold mb-4">Engagement Distribution</h2>
			<ResponsiveContainer width="100%" height={300}>
				<PieChart>
					<Pie
						data={[...engagementData]}
						cx="50%"
						cy="50%"
						innerRadius={70}
						outerRadius={100}
						dataKey="value"
						paddingAngle={2}
					>
						{engagementData.map((entry) => (
							<Cell key={entry.name} fill={COLORS[entry.name]} />
						))}
					</Pie>
					<Tooltip formatter={(value: number) => `${value}%`} />
				</PieChart>
			</ResponsiveContainer>
			<div className="flex justify-around mt-6 text-sm md:text-base">
				{engagementData.map((entry) => (
					<div key={entry.name} className="flex flex-col items-center gap-2">
						<div className="flex items-center ">
							<div className={`w-3 h-3 rounded-full bg-${COLORS[entry.name]}`} />

							<span> &nbsp;{entry.name}</span>
						</div>
						<div className="font-semibold">{entry.value}%</div>
					</div>
				))}
			</div>
		</div>
	)
}
