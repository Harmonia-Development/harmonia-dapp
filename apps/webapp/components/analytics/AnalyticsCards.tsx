'use client'
import { BarChart4, TrendingUp, Users } from 'lucide-react'
import type React from 'react'
import { Card, CardDescription, CardHeader, CardTitle } from '../ui/card'

type MetricCardProps = {
	title: string
	value: string
	description: string
	label: string
	percent: string
	icon: React.ReactElement
	color: string // Card background color (hex)
}

// Lighten a hex color by a percentage
const lightenColor = (hex: string, percent: number): string => {
	const num = Number.parseInt(hex.replace('#', ''), 16)
	const r = Math.min(255, (num >> 16) + (255 - (num >> 16)) * percent)
	const g = Math.min(255, ((num >> 8) & 0xff) + (255 - ((num >> 8) & 0xff)) * percent)
	const b = Math.min(255, (num & 0xff) + (255 - (num & 0xff)) * percent)
	return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`
}

const MetricCard: React.FC<MetricCardProps> = ({
	title,
	value,
	description,
	label,
	percent,
	icon,
	color,
}) => {
	// Use the same color as the card background but make it brighter for the icon
	const iconColor = lightenColor(color, 0.6) // 60% brighter for better visibility
	const iconWrapperBg = lightenColor(color, 0.2) // Wrapper still a bit lighter

	return (
		<div
			className="p-4 rounded-xl shadow-md w-full space-y-3 transition-all duration-300 hover:transform hover:scale-[1.02] hover:shadow-lg overflow-hidden"
			style={{ backgroundColor: color }}
		>
			<div className="flex justify-between items-center">
				<div className="text-white text-sm">{title}</div>
				<div className="p-2 rounded-full" style={{ backgroundColor: iconWrapperBg }}>
					<div style={{ color: iconColor }}>
						<div style={{ fontSize: '12px' }}>{icon}</div>
					</div>
				</div>
			</div>
			<div className="text-white text-2xl font-semibold">{value}</div>
			<div className="text-green-400 text-xs">{description}</div>
			<div className="text-gray-400 text-xs mt-2">{label}</div>
			<div className="w-full bg-gray-700 h-1 rounded-full overflow-hidden">
				<div className="bg-purple-500 h-full rounded-full" style={{ width: percent }} />
			</div>
			<div className="text-sm text-white text-right mb-1">{percent}</div>
		</div>
	)
}

export default function AnalyticsCard() {
	return (
		<Card className="mb-4 overflow-hidden">
			<CardHeader className="pb-2">
				<CardTitle className="text-2xl font-bold">Analytics Dashboard</CardTitle>
				<CardDescription>
					Comprehensive insights and data visualisation for your DAO
				</CardDescription>
			</CardHeader>
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-6 bg-black">
				<MetricCard
					title="Governance Score"
					value="92/100"
					description="→ Top 5% of DAOs"
					label="Rating"
					percent="92%"
					icon={<BarChart4 />}
					color="#1c140d"
				/>
				<MetricCard
					title="Member Engagement"
					value="78%"
					description="→ +12% from last month"
					label="Participation"
					percent="78%"
					icon={<Users />}
					color="#0d1a2b"
				/>
				<MetricCard
					title="Treasury Growth"
					value="+32%"
					description="→ YTD Increase"
					label="Performance"
					percent="85%"
					icon={<TrendingUp />}
					color="#10291c"
				/>
				<MetricCard
					title="Operational Efficiency"
					value="68%"
					description="→ +8% from last quarter"
					label="Efficiency"
					percent="68%"
					icon={<BarChart4 />}
					color="#2d1a0d"
				/>
			</div>
		</Card>
	)
}
