'use client'
import AnalyticsCard from '@/components/analytics/analytics-cards'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import React from 'react'

import { ComparativeDashboard } from '@/components/analytics/comparative-analysis'
import { GovernanceDashboard } from '@/components/analytics/governance-analytics'
import MemberEngagementChart from '@/components/analytics/member-engagement'
import NetworkDashboard from '@/components/analytics/network-dashboard'
import { TreasuryDashboard } from '@/components/analytics/treasury-perfomance-chart'

export default function Page() {
	return (
		<Card>
			<AnalyticsCard />
			<div className="flex flex-col lg:flex-row gap-4 outline-none border-none">
				<div className="flex-1 max-w[900px]">
					<Card className="border-none">
						<GovernanceDashboard />
						<TreasuryDashboard />
						<ComparativeDashboard />
					</Card>
				</div>
				<div className="border-none">
					<Card>
						<CardHeader className="pb-2">
							<CardTitle className="text-2xl font-bold">Member Engagement.</CardTitle>
							<CardDescription>Participation metrics and member activity</CardDescription>
							<MemberEngagementChart />
						</CardHeader>
					</Card>
					<Card>
						<CardHeader className="pb-2">
							<CardTitle className="text-2xl font-bold">Network Activity</CardTitle>
							<CardDescription>Visualization od DAO network interactions</CardDescription>
							<NetworkDashboard />
						</CardHeader>
					</Card>
				</div>
			</div>
		</Card>
	)
}
