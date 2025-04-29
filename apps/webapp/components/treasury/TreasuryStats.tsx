'use client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowDownCircle, ArrowUpCircle, Coins, DollarSign } from 'lucide-react'

interface StatCardProps {
	title: string
	value: string
	description: string
	icon: React.ReactNode
	trend?: {
		value: string
		positive: boolean
	}
}

function StatCard({ title, value, description, icon, trend }: StatCardProps) {
	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle className="text-sm font-medium">{title}</CardTitle>
				<div className="h-5 w-5 text-muted-foreground">{icon}</div>
			</CardHeader>
			<CardContent>
				<div className="text-2xl font-bold">{value}</div>
				<p className="text-xs text-muted-foreground">{description}</p>
				{trend && (
					<div className="flex items-center pt-2">
						<span className={`text-xs ${trend.positive ? 'text-green-500' : 'text-red-500'}`}>
							{trend.positive ? '+' : ''}
							{trend.value}
						</span>
					</div>
				)}
			</CardContent>
		</Card>
	)
}

export function TreasuryStats() {
	return (
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
			<StatCard
				title="Total Balance"
				value="125,438 XLM"
				description="Total treasury balance in XLM"
				icon={<Coins className="h-4 w-4" />}
				trend={{ value: '+2.5% since last month', positive: true }}
			/>
			<StatCard
				title="USD Value"
				value="$347,520"
				description="Treasury value in USD"
				icon={<DollarSign className="h-4 w-4" />}
				trend={{ value: '+1.8% since last month', positive: true }}
			/>
			<StatCard
				title="Monthly Inflow"
				value="12,450 XLM"
				description="Total inflow this month"
				icon={<ArrowUpCircle className="h-4 w-4" />}
				trend={{ value: '+5.3% from previous month', positive: true }}
			/>
			<StatCard
				title="Monthly Outflow"
				value="8,230 XLM"
				description="Total outflow this month"
				icon={<ArrowDownCircle className="h-4 w-4" />}
				trend={{ value: '-2.1% from previous month', positive: true }}
			/>
		</div>
	)
}
