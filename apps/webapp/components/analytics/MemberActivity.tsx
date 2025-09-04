'use client'

import { useCallback } from 'react'
import {
	Bar,
	BarChart,
	Legend,
	ResponsiveContainer,
	Tooltip,
	type TooltipProps,
	XAxis,
	YAxis,
} from 'recharts'

import type { MemberData } from '@/lib/types/analytics.types'

interface MemberActivityProps {
	data: MemberData[]
	title: string
	xLabel: string
	yLabel: string
}

export function MemberActivity({ data, title, xLabel, yLabel }: MemberActivityProps) {
	// Custom tooltip that shows active and new members per day
	const renderTooltip = useCallback((props: TooltipProps<number, string>) => {
		const { active, payload, label } = props

		if (active && payload && payload.length) {
			return (
				<div className="rounded-lg border border-border/30 bg-background p-2 shadow-sm">
					<p className="text-sm font-medium">{label}</p>
					{payload.map((entry) => (
						<p key={entry.name} className="text-sm" style={{ color: entry.color }}>
							{entry.name}: {entry.value}
						</p>
					))}
				</div>
			)
		}
		return null
	}, [])

	// Custom legend showing which color represents which metric
	const renderLegend = useCallback(() => {
		return (
			<div className="flex justify-center gap-6 mt-5 text-xs">
				<div className="flex items-center">
					<div className="mr-2 h-3 w-3 rounded-sm bg-purple-dark" />
					<span className="text-purple-dark">Active Members</span>
				</div>
				<div className="flex items-center">
					<div className="mr-2 h-3 w-3 rounded-sm bg-blue-brand" />
					<span className="text-blue-brand">New Members</span>
				</div>
			</div>
		)
	}, [])

	return (
		<div className="space-y-2">
			<h3 className="text-lg md:text-xl font-medium text-muted-foreground mb-2">{title}</h3>
			<div className="h-[300px] w-full">
				<ResponsiveContainer width="100%" height="100%">
					<BarChart data={data} barGap={4}>
						<XAxis
							dataKey="day"
							label={{
								value: xLabel,
								position: 'insideBottom',
								offset: -10,
								fontSize: 12,
							}}
						/>
						<YAxis
							label={{
								value: yLabel,
								angle: -90,
								position: 'insideLeft',
								style: {
									textAnchor: 'middle',
									fontSize: 12,
								},
							}}
						/>
						<Tooltip content={renderTooltip} />
						<Legend content={renderLegend} verticalAlign="bottom" height={36} />
						<Bar
							dataKey="activeMembers"
							name="Active Members"
							fill="#9333ea"
							radius={[4, 4, 0, 0]}
							barSize={24}
						/>
						<Bar
							dataKey="newMembers"
							name="New Members"
							fill="#3b82f6"
							radius={[4, 4, 0, 0]}
							barSize={24}
						/>
					</BarChart>
				</ResponsiveContainer>
			</div>
		</div>
	)
}
