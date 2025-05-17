/* eslint-disable @typescript-eslint/no-explicit-any */
import type React from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

type ProposalCategory = {
	name: string
	color: string
	value: number
}

interface Props {
	data: ProposalCategory[]
}

const ProposalCategoryChart: React.FC<Props> = ({ data }) => {
	const total = data.reduce((sum, entry) => sum + entry.value, 0)

	const dataWithPercentages = data.map((entry) => ({
		...entry,
		percentage: total > 0 ? ((entry.value / total) * 100).toFixed(0) : 0, // Handle case where total is 0
	}))

	return (
		<div className="w-full max-w-md mx-auto p-4 rounded-lg border border-gray-700">
			<h2
				className="text-lg font-semibold mb-2 text-gray-300"
				aria-label="Proposal Categories Chart"
			>
				Proposal Categories
			</h2>
			<p className="text-sm text-gray-400 mb-4">Distribution by proposal type</p>
			<ResponsiveContainer width="100%" height={250}>
				<PieChart>
					<Pie
						data={dataWithPercentages}
						dataKey="value"
						nameKey="name"
						cx="50%"
						cy="50%"
						innerRadius={60}
						outerRadius={82}
						paddingAngle={0} // Set to 0 to remove gaps between segments
						animationDuration={800}
						animationBegin={0}
						label={({ name, percentage }) => `${name}: ${percentage}%`}
						labelLine={false}
						isAnimationActive={true}
					>
						{dataWithPercentages.map((entry, index) => (
							<Cell
								key={`cell-${index}`}
								fill={entry.color}
								stroke="#fff"
								strokeWidth={2}
								aria-label={`${entry.name}: ${entry.percentage}%`}
							/>
						))}
					</Pie>
					<Tooltip
						contentStyle={{
							backgroundColor: '#1F2937',
							border: 'none',
							borderRadius: '4px',
							color: '#fff',
						}}
						formatter={(value: number, name: string, props: any) => [
							`${props.payload.percentage}%`,
							name,
						]}
					/>
				</PieChart>
			</ResponsiveContainer>
			<div className="grid grid-cols-1 gap-4 mt-4">
				{dataWithPercentages.map((entry) => (
					<div key={entry.name} className="flex justify-between items-center">
						<div className="flex items-center gap-2">
							<span
								className="w-4 h-4 rounded-full"
								style={{ backgroundColor: entry.color }}
								aria-hidden="true"
							></span>
							<span className="text-gray-300">{entry.name}</span>
						</div>
						<span className="text-gray-300">{entry.percentage}%</span>
					</div>
				))}
			</div>
		</div>
	)
}

export default ProposalCategoryChart
