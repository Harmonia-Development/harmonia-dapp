import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartSkeleton } from '@/components/ui/loading-skeletons'
import type React from 'react'
import { useCallback } from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, type TooltipProps } from 'recharts'

type ProposalCategory = {
	name: string
	color: string
	value: number
}

interface ProposalCategoryWithPercentage extends ProposalCategory {
	percentage: string
}

interface ProposalCategoryChartProps {
	data: ProposalCategory[]
	isLoading?: boolean
}

export function ProposalCategoryChart({ data, isLoading = false }: ProposalCategoryChartProps) {
	const total = data.reduce((sum, entry) => sum + entry.value, 0)

	const dataWithPercentages: ProposalCategoryWithPercentage[] = data.map((entry) => ({
		...entry,
		percentage: total > 0 ? ((entry.value / total) * 100).toFixed(0) : '0',
	}))

	// Custom tooltip showing category and value
	const renderTooltip = useCallback((props: TooltipProps<number, string>) => {
		const { active, payload } = props

		if (active && payload && payload.length) {
			const data = payload[0].payload
			return (
				<div className="rounded-lg border bg-background p-2 shadow-sm">
					<p className="text-sm font-medium">
						{data.name}: {data.percentage}%
					</p>
				</div>
			)
		}
		return null
	}, [])

	if (isLoading) {
		return <ChartSkeleton />
	}

	return (
		<Card className="w-full max-w-md ">
			<CardHeader>
				<CardTitle className="text-xl font-bold">Proposal Categories</CardTitle>
				<CardDescription>Distribution by proposal type</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
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
							paddingAngle={0}
							animationDuration={800}
							animationBegin={0}
							label={({ name, percentage }) => `${name}: ${percentage}%`}
							labelLine={false}
							isAnimationActive={true}
						>
							{dataWithPercentages.map((entry) => (
								<Cell
									key={entry.name}
									fill={entry.color}
									stroke="#fff"
									strokeWidth={2}
									aria-label={`${entry.name}: ${entry.percentage}%`}
								/>
							))}
						</Pie>
						<Tooltip content={renderTooltip} />
					</PieChart>
				</ResponsiveContainer>

				<div className="grid grid-cols-1 gap-4">
					{dataWithPercentages.map((entry) => (
						<div key={entry.name} className="flex justify-between items-center">
							<div className="flex items-center gap-2">
								<span
									className="w-4 h-4 rounded-full"
									style={{ backgroundColor: entry.color }}
									aria-hidden="true"
								/>
								<span className="text-gray-900 dark:text-gray-300">{entry.name}</span>
							</div>
							<span className="text-gray-900 dark:text-gray-300">{entry.percentage}%</span>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	)
}
