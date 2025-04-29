'use client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

interface AssetData {
	name: string
	value: number
	color: string
}

const assetData: AssetData[] = [
	{ name: 'XLM', value: 60, color: '#8884d8' },
	{ name: 'USDC', value: 20, color: '#26a17b' },
	{ name: 'ETH', value: 12, color: '#627eea' },
	{ name: 'BTC', value: 5, color: '#f7931a' },
	{ name: 'Other', value: 3, color: '#dddddd' },
]

// Define interface for custom label props
interface CustomizedLabelProps {
	cx: number
	cy: number
	midAngle: number
	innerRadius: number
	outerRadius: number
	percent: number
}

const RADIAN = Math.PI / 180
const renderCustomizedLabel = ({
	cx,
	cy,
	midAngle,
	innerRadius,
	outerRadius,
	percent,
}: CustomizedLabelProps) => {
	const radius = innerRadius + (outerRadius - innerRadius) * 0.5
	const x = cx + radius * Math.cos(-midAngle * RADIAN)
	const y = cy + radius * Math.sin(-midAngle * RADIAN)

	if (percent < 0.05) return null

	return (
		<text
			x={x}
			y={y}
			fill="white"
			textAnchor={x > cx ? 'start' : 'end'}
			dominantBaseline="central"
			fontSize={12}
		>
			{`${(percent * 100).toFixed(0)}%`}
		</text>
	)
}

// Define interface for legend entry
interface LegendPayload extends AssetData {
	payload: AssetData
}

export function AssetAllocationChart() {
	return (
		<Card className="col-span-2">
			<CardHeader>
				<CardTitle>Asset Allocation</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="h-80">
					<ResponsiveContainer width="100%" height="100%">
						<PieChart>
							<Pie
								data={assetData}
								cx="50%"
								cy="50%"
								labelLine={false}
								label={renderCustomizedLabel}
								outerRadius={100}
								innerRadius={60}
								fill="#8884d8"
								dataKey="value"
							>
								{assetData.map((entry) => (
									<Cell key={`cell-${entry.name}`} fill={entry.color} />
								))}
							</Pie>
							<Tooltip formatter={(value: number) => [`${value}%`, 'Allocation']} />
							<Legend
								layout="vertical"
								verticalAlign="middle"
								align="right"
								formatter={(value, entry) => {
									const { payload } = entry as unknown as LegendPayload
									return (
										<span style={{ color: payload.color, marginRight: 10 }}>
											{value} - {payload.value}%
										</span>
									)
								}}
							/>
						</PieChart>
					</ResponsiveContainer>
				</div>
			</CardContent>
		</Card>
	)
}
