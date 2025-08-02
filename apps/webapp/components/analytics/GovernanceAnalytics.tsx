'use client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { data, memberData, votingData } from '@/lib/mock-data/governance-mock'
import {
	Bar,
	BarChart,
	CartesianGrid,
	Legend,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts'
import { VotingDistribution } from './VotingDistribution'
const CustomTooltip = ({
	active,
	payload,
	label,
}: {
	active?: boolean
	payload?: {
		value: number
		dataKey: string
		name: string
		color: string
		payload: {
			rate1: number
			rate2: number
			name: string
		}
	}[]
	label?: string
}) => {
	if (active && payload && payload.length) {
		return (
			<div className="bg-gray-800 text-white p-2 rounded shadow-md text-sm">
				<p className="font-semibold">{label}</p>
				<p className="text-purple-400">Participation Rate: {payload[0].value}%</p>
				<p className="text-gray-400">Participation Rate: {payload[1].value}%</p>
			</div>
		)
	}

	return null
}

export function GovernanceDashboard() {
	return (
		<Card className="mb-4">
			<CardHeader className="pb-2">
				<CardTitle className="text-2xl font-bold">Governance Analytics</CardTitle>
				<CardDescription>Analytics of propasal activity and voting platform</CardDescription>
			</CardHeader>
			<CardContent className="p-6 pb-10 pt-0">
				<Tabs defaultValue="treasury" className="w-full">
					<TabsList className="grid w-full grid-cols-3">
						<TabsTrigger value="members">Proposal</TabsTrigger>
						<TabsTrigger value="voting">Voting</TabsTrigger>
						<TabsTrigger value="treasury">Participation</TabsTrigger>
					</TabsList>
					<TabsContent value="members" className="mt-0 pt-4">
						<ResponsiveContainer width="100%" height={400}>
							<BarChart data={memberData}>
								<XAxis dataKey="month" />
								<YAxis />
								<Tooltip />
								<Legend />
								<Bar dataKey="active" name="Active" fill="#a855f7" radius={[5, 5, 0, 0]} />
								<Bar dataKey="passed" name="Passed" fill="#22c55e" radius={[5, 5, 0, 0]} />
								<Bar dataKey="rejected" name="Rejected" fill="#ef4444 " radius={[5, 5, 0, 0]} />
							</BarChart>
						</ResponsiveContainer>
					</TabsContent>

					<TabsContent value="voting" className="mt-0 pt-4">
						<VotingDistribution
							title="Voting"
							data={votingData}
							description="Avereage Voting distribution across all platform in the last quarter."
						/>
					</TabsContent>

					<TabsContent value="treasury" className="mt-0 pt-4">
						<div className="w-full h-[300px]">
							<ResponsiveContainer width="100%" height="100%">
								<LineChart data={data}>
									<CartesianGrid strokeDasharray="3 3" stroke="#333" />
									<XAxis dataKey="name" stroke="#999" />
									<YAxis stroke="#999" />
									<Tooltip content={<CustomTooltip />} />
									<Line
										type="monotone"
										dataKey="rate1"
										stroke="#A855F7"
										strokeWidth={2}
										dot={{
											r: 5,
											stroke: '#fff',
											strokeWidth: 2,
											fill: '#A855F7',
										}}
										activeDot={{ r: 6 }}
									/>
									<Line
										type="monotone"
										dataKey="rate2"
										stroke="#8884d8"
										strokeDasharray="5 5"
										strokeWidth={2}
										dot={{
											r: 4,
											stroke: '#fff',
											strokeWidth: 1,
											fill: '#8884d8',
										}}
									/>
								</LineChart>
							</ResponsiveContainer>
						</div>
					</TabsContent>
				</Tabs>
			</CardContent>
		</Card>
	)
}
