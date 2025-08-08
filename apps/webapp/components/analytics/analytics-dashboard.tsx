'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartSkeleton } from '@/components/ui/loading-skeletons'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { categoryData, memberData, treasuryData, votingData } from '@/lib/mock-data/analytics.mock'
import { Suspense, lazy } from 'react'

// Lazy load heavy chart components
const MemberActivity = lazy(() =>
	import('./MemberActivity').then((module) => ({
		default: module.MemberActivity,
	})),
)
const TreasuryChart = lazy(() =>
	import('./TreasuryChart').then((module) => ({
		default: module.TreasuryChart,
	})),
)
const ProposalCategories = lazy(() =>
	import('./ProposalCategories').then((module) => ({
		default: module.ProposalCategories,
	})),
)
const VotingDistribution = lazy(() =>
	import('./VotingDistribution').then((module) => ({
		default: module.VotingDistribution,
	})),
)

interface AnalyticsDashboardProps {
	isLoading?: boolean
}

export default function AnalyticsDashboard({ isLoading = false }: AnalyticsDashboardProps) {
	if (isLoading) {
		return (
			<div className="space-y-6">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
					{['total-proposals', 'active-members', 'treasury-value', 'voting-participation'].map(
						(key) => (
							<Card key={key}>
								<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
									<Skeleton className="h-4 w-24" />
									<Skeleton className="h-4 w-4" />
								</CardHeader>
								<CardContent>
									<Skeleton className="h-8 w-16 mb-2" />
									<Skeleton className="h-3 w-32" />
								</CardContent>
							</Card>
						),
					)}
				</div>
				<ChartSkeleton />
			</div>
		)
	}

	return (
		<div className="space-y-6">
			{/* Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Proposals</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">1,234</div>
						<p className="text-xs text-muted-foreground">+12% from last month</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Active Members</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">567</div>
						<p className="text-xs text-muted-foreground">+8% from last month</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Treasury Value</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">$2.4M</div>
						<p className="text-xs text-muted-foreground">+5% from last month</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Voting Participation</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">89%</div>
						<p className="text-xs text-muted-foreground">+2% from last month</p>
					</CardContent>
				</Card>
			</div>

			{/* Charts */}
			<Tabs defaultValue="treasury" className="space-y-4">
				<TabsList className="grid w-full grid-cols-4">
					<TabsTrigger value="treasury">Treasury</TabsTrigger>
					<TabsTrigger value="proposals">Proposals</TabsTrigger>
					<TabsTrigger value="members">Members</TabsTrigger>
					<TabsTrigger value="voting">Voting</TabsTrigger>
				</TabsList>
				<TabsContent value="treasury" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Treasury Performance</CardTitle>
							<CardDescription>Track treasury growth and asset allocation</CardDescription>
						</CardHeader>
						<CardContent className="pl-2">
							<Suspense fallback={<ChartSkeleton />}>
								<TreasuryChart
									data={treasuryData}
									title="Treasury Balance Over Time"
									xLabel="Date"
									yLabel="Balance (XLM)"
								/>
							</Suspense>
						</CardContent>
					</Card>
				</TabsContent>
				<TabsContent value="proposals" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Proposal Categories</CardTitle>
							<CardDescription>Distribution of proposals by category</CardDescription>
						</CardHeader>
						<CardContent className="pl-2">
							<Suspense fallback={<ChartSkeleton />}>
								<ProposalCategories
									data={categoryData}
									title="Proposal Categories"
									description="Distribution of proposals by category"
								/>
							</Suspense>
						</CardContent>
					</Card>
				</TabsContent>
				<TabsContent value="members" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Member Activity</CardTitle>
							<CardDescription>Member engagement and participation trends</CardDescription>
						</CardHeader>
						<CardContent className="pl-2">
							<Suspense fallback={<ChartSkeleton />}>
								<MemberActivity
									data={memberData}
									title="Member Activity"
									xLabel="Date"
									yLabel="Members"
								/>
							</Suspense>
						</CardContent>
					</Card>
				</TabsContent>
				<TabsContent value="voting" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Voting Distribution</CardTitle>
							<CardDescription>Vote distribution across proposals</CardDescription>
						</CardHeader>
						<CardContent className="pl-2">
							<Suspense fallback={<ChartSkeleton />}>
								<VotingDistribution
									data={votingData}
									title="Voting Distribution"
									description="Distribution of votes across proposals"
								/>
							</Suspense>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	)
}
