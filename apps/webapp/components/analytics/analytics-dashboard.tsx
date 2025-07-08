'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartSkeleton } from '@/components/ui/loading-skeletons'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { categoryData, memberData, treasuryData, votingData } from '@/lib/mock-data/analytics.mock'
import { MemberActivity } from './MemberActivity'
import { TreasuryChart } from './TreasuryChart'
import { ProposalCategories } from './ProposalCategories'
import { VotingDistribution } from './VotingDistribution'

interface AnalyticsDashboardProps {
	isLoading?: boolean
}

export function AnalyticsDashboard({ isLoading = false }: AnalyticsDashboardProps) {
	if (isLoading) {
		return (
			<Card>
				<CardHeader className="pb-2">
					<Skeleton className="h-8 w-48 mb-2" />
					<Skeleton className="h-4 w-80" />
				</CardHeader>
				<CardContent className="p-6 pb-10 pt-0">
					<Skeleton className="h-10 w-full mb-4" />
					<ChartSkeleton />
				</CardContent>
			</Card>
		)
	}

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
