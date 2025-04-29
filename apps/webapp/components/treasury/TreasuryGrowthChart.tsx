'use client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useState } from 'react'
import {
	Area,
	AreaChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts'

export type TimeView = 'weekly' | 'monthly' | 'yearly'

export interface TreasuryGrowthProps {
	view: TimeView
	data: Array<{ date: string; balance: number }>
}

// Mock data
const weeklyData = Array.from({ length: 7 }, (_, i) => ({
	date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric',
	}),
	balance: 120000 + Math.random() * 10000,
}))

const monthlyData = Array.from({ length: 30 }, (_, i) => ({
	date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric',
	}),
	balance: 115000 + Math.random() * 15000,
}))

const yearlyData = Array.from({ length: 12 }, (_, i) => ({
	date: new Date(2024, i, 1).toLocaleDateString('en-US', { month: 'short' }),
	balance: 100000 + Math.random() * 25000 + i * 2000,
}))

export function TreasuryGrowthChart() {
	const [view, setView] = useState<TimeView>('monthly')

	const getDataByView = () => {
		switch (view) {
			case 'weekly':
				return weeklyData
			case 'yearly':
				return yearlyData
			default:
				return monthlyData
		}
	}

	const formatYAxisTick = (value: number) => {
		return `${Math.round(value / 1000)}k`
	}

	return (
		<Card className="col-span-full">
			<CardHeader className="flex flex-row items-center justify-between">
				<CardTitle>Treasury Growth</CardTitle>
				<Tabs
					value={view}
					onValueChange={(value) => setView(value as TimeView)}
					className="w-[400px]"
				>
					<TabsList className="grid w-full grid-cols-3">
						<TabsTrigger value="weekly">Weekly</TabsTrigger>
						<TabsTrigger value="monthly">Monthly</TabsTrigger>
						<TabsTrigger value="yearly">Yearly</TabsTrigger>
					</TabsList>
				</Tabs>
			</CardHeader>
			<CardContent className="pt-2">
				<div className="h-80">
					<ResponsiveContainer width="100%" height="100%">
						<AreaChart
							data={getDataByView()}
							margin={{
								top: 20,
								right: 30,
								left: 20,
								bottom: 5,
							}}
						>
							<defs>
								<linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
									<stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
									<stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
								</linearGradient>
							</defs>
							<CartesianGrid strokeDasharray="3 3" vertical={false} />
							<XAxis dataKey="date" tick={{ fontSize: 12 }} tickMargin={10} />
							<YAxis tickFormatter={formatYAxisTick} tick={{ fontSize: 12 }} tickMargin={10} />
							<Tooltip
								formatter={(value: number) => [`${value.toLocaleString()} XLM`, 'Balance']}
								labelFormatter={(label) => `Date: ${label}`}
							/>
							<Area
								type="monotone"
								dataKey="balance"
								stroke="#8884d8"
								fillOpacity={1}
								fill="url(#colorBalance)"
							/>
						</AreaChart>
					</ResponsiveContainer>
				</div>
			</CardContent>
		</Card>
	)
}
