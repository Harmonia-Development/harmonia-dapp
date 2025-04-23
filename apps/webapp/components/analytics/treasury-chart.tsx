'use client'

import { useCallback } from 'react'
import {
	Area,
	AreaChart,
	ResponsiveContainer,
	Tooltip,
	type TooltipProps,
	XAxis,
	YAxis,
} from 'recharts'

import type { TreasuryData } from '@/lib/types/analytics.types'

interface TreasuryChartProps {
	data: TreasuryData[]
	title: string
	xLabel: string
	yLabel: string
}

export function TreasuryChart({ data, title, xLabel, yLabel }: TreasuryChartProps) {
	// Format Y-axis values (e.g. 1000 => 1k)
	const formatYAxis = (value: number): string => {
		return value >= 1000 ? `${(value / 1000).toFixed(0)}k` : `${value}`
	}

	// Custom tooltip for displaying balance info
	const renderTooltip = useCallback((props: TooltipProps<number, string>) => {
		const { active, payload } = props

		if (active && payload && payload.length) {
			const data = payload[0].payload
			return (
				<div className="rounded-lg border border-border/30 bg-background p-2 shadow-sm">
					<p className="text-sm font-medium">{data.date}</p>
					<p className="text-sm text-muted-foreground">
						<span className="text-primary font-medium">
							{new Intl.NumberFormat('en-US', {
								style: 'currency',
								currency: 'XLM',
								minimumFractionDigits: 0,
							}).format(data.balance)}
						</span>{' '}
						XLM
					</p>
				</div>
			)
		}
		return null
	}, [])

	return (
		<div className="h-[350px] w-full">
			<h3 className="text-lg md:text-xl font-medium text-muted-foreground mb-2">{title}</h3>
			<ResponsiveContainer width="100%" height="100%">
				<AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
					<defs>
						<linearGradient id="treasuryGradient" x1="0" y1="0" x2="0" y2="1">
							<stop offset="5%" stopColor="rgb(124, 58, 237)" stopOpacity={0.2} />
							<stop offset="95%" stopColor="rgb(124, 58, 237)" stopOpacity={0} />
						</linearGradient>
					</defs>

					<XAxis
						dataKey="date"
						label={{
							value: xLabel,
							position: 'insideBottom',
							offset: -10,
							fontSize: 12,
						}}
					/>

					<YAxis
						tickFormatter={formatYAxis}
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

					<Area
						type="monotone"
						dataKey="balance"
						stroke="rgb(124, 58, 237)"
						strokeWidth={1.5}
						fillOpacity={1}
						fill="url(#treasuryGradient)"
						activeDot={{
							r: 4,
							stroke: 'rgb(124, 58, 237)',
							strokeWidth: 2,
							fill: 'white',
						}}
					/>
				</AreaChart>
			</ResponsiveContainer>
		</div>
	)
}
