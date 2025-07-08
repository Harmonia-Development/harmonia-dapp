'use client'

import type { CategoryData, PieLabelRenderProps } from '@/lib/types/analytics.types'
import { useCallback } from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, type TooltipProps } from 'recharts'

interface ProposalCategoriesProps {
	data: CategoryData[]
	title: string
	description: string
	legend?: boolean
}

export function ProposalCategories({
	data,
	title,
	description,
	legend = true,
}: ProposalCategoriesProps) {
	// Custom label that positions text around the pie
	const renderCustomizedLabel = useCallback(
		({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: PieLabelRenderProps) => {
			const RADIAN = Math.PI / 180
			const radius = innerRadius + (outerRadius - innerRadius) * 1.4
			const x = cx + radius * Math.cos(-midAngle * RADIAN)
			const y = cy + radius * Math.sin(-midAngle * RADIAN)

			return (
				<text
					x={x}
					y={y}
					fill={data[index].color}
					textAnchor={x > cx ? 'start' : 'end'}
					dominantBaseline="central"
					className="text-xs md:text-sm font-medium"
				>
					{`${data[index].category}: ${(percent * 100).toFixed(0)}%`}
				</text>
			)
		},
		[data],
	)

	// Custom tooltip showing category and value
	const renderTooltip = useCallback((props: TooltipProps<number, string>) => {
		const { active, payload } = props

		if (active && payload && payload.length) {
			const data = payload[0].payload
			return (
				<div className="rounded-lg border bg-background p-2 shadow-sm">
					<p className="text-sm font-medium">
						{data.category}: {data.value}%
					</p>
				</div>
			)
		}
		return null
	}, [])

	return (
		<div className="flex flex-col lg:flex-row items-center justify-between gap-8">
			{/* Pie chart */}
			<div className="h-[300px] w-full max-w-[500px]">
				<ResponsiveContainer width="100%" height="100%">
					<PieChart>
						<Pie
							data={data}
							cx="50%"
							cy="50%"
							labelLine={true}
							label={renderCustomizedLabel}
							outerRadius={100}
							fill="#8884d8"
							dataKey="value"
							nameKey="category"
							strokeWidth={1}
						>
							{data.map((entry) => (
								<Cell key={`cell-${entry.category}`} fill={entry.color} />
							))}
						</Pie>
						<Tooltip content={renderTooltip} />
					</PieChart>
				</ResponsiveContainer>
			</div>

			{/* Title, description, and legend */}
			<div className="flex flex-1 flex-col justify-center space-y-6">
				<div className="space-y-2">
					<h3 className="text-xl font-bold">{title}</h3>
					<p className="text-sm text-muted-foreground">{description}</p>
				</div>

				{legend && (
					<div className="space-y-3">
						{data.map((item) => (
							<div key={item.category} className="flex items-center">
								<div
									className="mr-2 h-3 w-3 rounded-full"
									style={{ backgroundColor: item.color }}
								/>
								<span className="flex-1">{item.category}</span>
								<span className="font-medium">{item.value}%</span>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	)
}
