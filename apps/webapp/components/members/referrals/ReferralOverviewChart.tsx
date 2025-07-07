'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp } from 'lucide-react'
import {
	CartesianGrid,
	Legend,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts'

// Mock data for the line chart
const chartData = [
	{ month: 'Jan', referrals: 8, conversions: 5 },
	{ month: 'Feb', referrals: 12, conversions: 8 },
	{ month: 'Mar', referrals: 10, conversions: 6 },
	{ month: 'Apr', referrals: 14, conversions: 9 },
	{ month: 'May', referrals: 16, conversions: 11 },
	{ month: 'Jun', referrals: 18, conversions: 12 },
	{ month: 'Jul', referrals: 20, conversions: 14 },
]

// Interface for referral data points
// interface ReferralPoint {
//   month: string;
//   referrals: number;
//   conversions: number;
// }

/**
 * Overview tab component showing key metrics and trend chart
 */
export function ReferralOverviewChart() {
	return (
		<div className="space-y-6">
			{/* Metrics Cards */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				{/* Total Referrals Card */}
				<Card className="bg-[#070709] border-[#1a1a1d]">
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-gray-400">Total Referrals</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-bold text-white">157</div>
						<div className="flex items-center mt-2 text-sm">
							<TrendingUp className="w-4 h-4 text-green-500 mr-1" />
							<span className="text-green-500">+22% from last month</span>
						</div>
					</CardContent>
				</Card>

				{/* Conversion Rate Card */}
				<Card className="bg-[#070709] border-[#1a1a1d]">
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-gray-400">Conversion Rate</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-bold text-white">65%</div>
						<div className="flex items-center mt-2 text-sm">
							<TrendingUp className="w-4 h-4 text-green-500 mr-1" />
							<span className="text-green-500">+5% from last month</span>
						</div>
					</CardContent>
				</Card>

				{/* Active Referrers Card */}
				<Card className="bg-[#070709] border-[#1a1a1d]">
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-gray-400">Active Referrers</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-bold text-white">28</div>
						<div className="flex items-center mt-2 text-sm">
							<TrendingUp className="w-4 h-4 text-green-500 mr-1" />
							<span className="text-green-500">+3 from last month</span>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Line Chart */}
			<Card className="bg-[#070709] border-[#1a1a1d]">
				<CardHeader>
					<CardTitle className="text-white">Monthly Referral Trends</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="h-80 w-full">
						<ResponsiveContainer width="100%" height="100%">
							<LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
								<CartesianGrid strokeDasharray="3 3" stroke="#374151" />
								<XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} />
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
								<Line
									type="monotone"
									dataKey="referrals"
									stroke="#8B5CF6"
									strokeWidth={3}
									name="Referrals"
									dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
								/>
								<Line
									type="monotone"
									dataKey="conversions"
									stroke="#10B981"
									strokeWidth={3}
									name="Conversions"
									dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
								/>
							</LineChart>
						</ResponsiveContainer>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
