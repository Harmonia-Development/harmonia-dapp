'use client'
import AnalyticsCard from '@/components/analytics/AnalyticsCards'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LayoutWrapper } from '@/components/ui/layout-wrapper'
import { ThemeWrapper } from '@/components/ui/theme-wrapper'
import React from 'react'

import { ComparativeDashboard } from '@/components/analytics/ComparativeAnalysis'
import { GovernanceDashboard } from '@/components/analytics/GovernanceAnalytics'
import MemberEngagementChart from '@/components/analytics/MemberEngagement'
import NetworkDashboard from '@/components/analytics/NetworkDashboard'
import { TreasuryDashboard } from '@/components/analytics/TreasuryPerfomanceChart'

export default function Page() {
	return (
		<ThemeWrapper>
			<LayoutWrapper>
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
			</LayoutWrapper>
		</ThemeWrapper>
	)
}
