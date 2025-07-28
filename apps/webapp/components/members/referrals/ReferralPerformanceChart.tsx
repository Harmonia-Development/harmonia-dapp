'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	Legend,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts'

// Mock data for donut chart
const conversionData = [
	{ name: 'Converted', value: 65, color: '#10B981' },
	{ name: 'Pending', value: 25, color: '#F59E0B' },
	{ name: 'Expired', value: 10, color: '#6B7280' },
]

// Mock data for bar chart
const channelData = [
	{ channel: 'Email', referrals: 65, conversions: 42 },
	{ channel: 'Twitter', referrals: 45, conversions: 28 },
	{ channel: 'Telegram', referrals: 35, conversions: 18 },
	{ channel: 'Discord', referrals: 12, conversions: 8 },
]

/**
 * Performance tab component showing conversion breakdown and channel performance
 */
export function ReferralPerformanceChart() {
	return (
		<div className="space-y-6">
			{/* Donut Chart - Conversion Breakdown */}
			<Card className="bg-[#070709] border-[#1a1a1d]">
				<CardHeader>
					<CardTitle className="text-white">Conversion Breakdown</CardTitle>
					<p className="text-sm text-gray-400">
						Analysis of referral invitation outcomes over the last 90 days.
					</p>
				</CardHeader>
				<CardContent>
					<div className="flex items-center justify-center">
						{/* Donut Chart */}
						<div className="relative">
							<ResponsiveContainer width={300} height={300}>
								<PieChart>
									<Pie
										data={conversionData}
										cx={150}
										cy={150}
										innerRadius={80}
										outerRadius={120}
										paddingAngle={2}
										dataKey="value"
									>
										{conversionData.map((entry) => (
											<Cell key={entry.name} fill={entry.color} />
										))}
									</Pie>
								</PieChart>
							</ResponsiveContainer>
							{/* Center Text */}
							<div className="absolute inset-0 flex items-center justify-center">
								<div className="text-center">
									<div className="text-sm text-green-500 font-medium">Converted</div>
									<div className="text-2xl font-bold text-white">65%</div>
								</div>
							</div>
						</div>
					</div>

					{/* Legend */}
					<div className="flex justify-center mt-6">
						<div className="flex gap-2">
							{conversionData.map((item) => (
								<div key={item.name} className="flex items-center">
									<div
										className="w-3 h-3 rounded-full mr-2"
										style={{ backgroundColor: item.color }}
									/>
									<span className="text-sm text-gray-300">{item.name}</span>
									<span className="text-sm font-medium text-white ml-2">{item.value}%</span>
								</div>
							))}
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Bar Chart - Channel Performance */}
			<Card className="bg-[#070709] border-[#1a1a1d]">
				<CardHeader>
					<CardTitle className="text-white">Referral Performance by Channel</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="h-80 w-full">
						<ResponsiveContainer width="100%" height="100%">
							<BarChart data={channelData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
								<CartesianGrid strokeDasharray="3 3" stroke="#374151" />
								<XAxis dataKey="channel" stroke="#9CA3AF" fontSize={12} />
								<YAxis stroke="#9CA3AF" fontSize={12} />
								<Tooltip
									contentStyle={{
										backgroundColor: '#171719',
										border: '1px solid #1a1a1d',
										borderRadius: '8px',
										color: '#F9FAFB',
									}}
								/>
								<Legend />
								<Bar dataKey="referrals" fill="#8B5CF6" name="Referrals" radius={[4, 4, 0, 0]} />
								<Bar
									dataKey="conversions"
									fill="#10B981"
									name="Conversions"
									radius={[4, 4, 0, 0]}
								/>
							</BarChart>
						</ResponsiveContainer>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
