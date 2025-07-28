'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { categoryData, memberData, treasuryData, votingData } from '@/lib/mock-data/analytics.mock'
import { MemberActivity } from './MemberActivity'
import { ProposalCategories } from './ProposalCategories'
import { TreasuryChart } from './TreasuryChart'
import { VotingDistribution } from './VotingDistribution'

export function AnalyticsDashboard() {
	return (
		<Card>
			<CardHeader className="pb-2">
				<CardTitle className="text-2xl font-bold">Analytics Dashboard</CardTitle>
				<CardDescription>Comprehensive analytics for your DAO&apos;s performance</CardDescription>
			</CardHeader>
			<CardContent className="p-6 pb-10 pt-0">
				<Tabs defaultValue="treasury" className="w-full">
					<TabsList className="grid w-full grid-cols-4">
						<TabsTrigger value="treasury">Treasury</TabsTrigger>
						<TabsTrigger value="voting">Voting</TabsTrigger>
						<TabsTrigger value="members">Members</TabsTrigger>
						<TabsTrigger value="proposals">Proposals</TabsTrigger>
					</TabsList>

					<TabsContent value="treasury" className="mt-0 pt-4">
						<TreasuryChart
							title="Treasury Growth"
							data={treasuryData}
							xLabel="Month"
							yLabel="Balance (XLM)"
						/>
					</TabsContent>

					<TabsContent value="voting" className="mt-0 pt-4">
						<VotingDistribution
							title="Latest Proposal Voting"
							data={votingData}
							description='Current distribution of votes for the "Community Garden Initiative" proposal.'
						/>
					</TabsContent>

					<TabsContent value="members" className="mt-0 pt-4">
						<MemberActivity
							title="Member Activity"
							data={memberData}
							xLabel="Day"
							yLabel="Members"
						/>
					</TabsContent>

					<TabsContent value="proposals" className="mt-0 pt-4">
						<ProposalCategories
							title="Proposal Categories"
							data={categoryData}
							description="Distribution of proposals by category over the last 6 months"
						/>
					</TabsContent>
				</Tabs>
			</CardContent>
		</Card>
	)
}
