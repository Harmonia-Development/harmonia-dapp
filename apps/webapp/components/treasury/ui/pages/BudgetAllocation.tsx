'use client'

import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Bar, BarChart, Cell, XAxis, YAxis } from 'recharts'

const budgetData = [
	{ category: 'Development', percentage: 35, color: 'hsl(var(--chart-1))' },
	{ category: 'Marketing', percentage: 20, color: 'hsl(var(--chart-2))' },
	{ category: 'Operations', percentage: 15, color: 'hsl(var(--chart-3))' },
	{ category: 'Community', percentage: 18, color: 'hsl(var(--chart-4))' },
	{ category: 'Reserve', percentage: 12, color: 'hsl(var(--chart-5))' },
]

// Transform data for horizontal bar chart
const chartData = budgetData.map((item) => ({
	category: item.category,
	value: item.percentage,
}))

export default function BudgetAllocation() {
	const chartConfig = budgetData.reduce(
		(acc, item) => {
			acc[item.category.toLowerCase()] = {
				label: item.category,
				color: item.color,
			}
			return acc
		},
		{} as Record<string, { label: string; color: string }>,
	)

	return (
		<div className="rounded-lg border bg-card text-card-foreground shadow">
			<div className="p-6">
				<h3 className="text-xl font-semibold leading-none tracking-tight">Budget Allocation</h3>
				<p className="text-xs mt-2 text-muted-foreground">How treasury funds are allocated</p>
			</div>

			<div className="p-6 pt-0">
				<div className="h-[300px]">
					<ChartContainer config={chartConfig}>
						<BarChart
							data={chartData}
							layout="vertical"
							margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
						>
							<XAxis type="number" hide />
							<YAxis type="category" dataKey="category" hide />
							<Bar
								dataKey="value"
								radius={[4, 4, 4, 4]}
								background={{ fill: 'rgba(0, 0, 0, 0.05)' }}
							>
								{budgetData.map((item) => (
									<Cell key={item.category} fill={item.color} />
								))}
							</Bar>

							<ChartTooltip
								content={
									<ChartTooltipContent
										formatter={(value, _name, props) => (
											<div className="flex items-center justify-between gap-2">
												<span>{props.payload.category}</span>
												<span className="font-medium">{value}%</span>
											</div>
										)}
									/>
								}
							/>
						</BarChart>
					</ChartContainer>
				</div>

				<div className="mt-4 space-y-4">
					{budgetData.map((item) => (
						<div key={item.category} className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
								<span>{item.category}</span>
							</div>
							<span className="font-medium">{item.percentage}%</span>
						</div>
					))}
				</div>
			</div>
		</div>
	)
}
