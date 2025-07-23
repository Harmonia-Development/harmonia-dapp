'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft } from 'lucide-react'

export function ProposalDetailSkeleton() {
	return (
		<div className="space-y-6">
			{/* Back Button */}
			<Button variant="ghost" disabled>
				<ArrowLeft className="h-4 w-4 mr-2" />
				Back to Proposals
			</Button>

			{/* Header Card Skeleton */}
			<Card className="bg-card border-border/40">
				<CardHeader className="pb-4">
					<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
						<div className="space-y-3">
							<div className="flex flex-wrap items-center gap-2">
								<Skeleton className="h-6 w-20 rounded-full" />
								<Skeleton className="h-6 w-16 rounded-full" />
							</div>
							<Skeleton className="h-8 w-96 max-w-full" />
						</div>
					</div>
				</CardHeader>

				<CardContent className="space-y-6">
					{/* Metadata Skeleton */}
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
						{Array.from({ length: 4 }).map((_, i) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: acceptable in static skeleton
							<div key={i} className="flex items-center gap-2">
								<Skeleton className="h-4 w-4 rounded-full" />
								<div className="space-y-1">
									<Skeleton className="h-3 w-16" />
									<Skeleton className="h-4 w-24" />
								</div>
							</div>
						))}
					</div>

					<div className="border-t pt-6">
						<Skeleton className="h-6 w-24 mb-3" />
						<div className="space-y-2">
							<Skeleton className="h-4 w-full" />
							<Skeleton className="h-4 w-full" />
							<Skeleton className="h-4 w-3/4" />
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Voting Section Skeleton */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Vote Breakdown Skeleton */}
				<Card className="lg:col-span-2 bg-card border-border/40">
					<CardHeader>
						<div className="flex items-center gap-2">
							<Skeleton className="h-5 w-5" />
							<Skeleton className="h-6 w-32" />
						</div>
					</CardHeader>
					<CardContent className="space-y-6">
						{/* Vote Statistics Skeleton */}
						<div className="grid grid-cols-3 gap-4">
							{Array.from({ length: 3 }).map((_, i) => (
								// biome-ignore lint/suspicious/noArrayIndexKey: acceptable in static skeleton
								<div key={i} className="text-center space-y-2">
									<div className="flex items-center justify-center gap-2">
										<Skeleton className="h-4 w-4 rounded-full" />
										<Skeleton className="h-4 w-12" />
									</div>
									<Skeleton className="h-8 w-16 mx-auto" />
									<Skeleton className="h-4 w-8 mx-auto" />
								</div>
							))}
						</div>

						{/* Progress Bars Skeleton */}
						<div className="space-y-3">
							<Skeleton className="h-4 w-32" />
							<div className="h-2 w-full rounded-full overflow-hidden bg-muted" />
							<div className="flex justify-between text-xs text-muted-foreground mt-1">
								<Skeleton className="h-3 w-16" />
								<Skeleton className="h-3 w-16" />
								<Skeleton className="h-3 w-16" />
							</div>
						</div>

						{/* Totals */}
						<div className="pt-2 border-t space-y-2">
							<div className="flex justify-between text-sm">
								<Skeleton className="h-4 w-24" />
								<Skeleton className="h-4 w-12" />
							</div>
							<div className="flex justify-between text-sm">
								<Skeleton className="h-4 w-32" />
								<Skeleton className="h-4 w-12" />
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Vote Actions Skeleton */}
				<Card className="bg-card border-border/40">
					<CardHeader>
						<Skeleton className="h-6 w-32" />
					</CardHeader>
					<CardContent className="space-y-4">
						<Skeleton className="h-4 w-full" />
						<div className="flex flex-col gap-2 sm:gap-4">
							{Array.from({ length: 3 }).map((_, i) => (
								// biome-ignore lint/suspicious/noArrayIndexKey: acceptable in static skeleton
								<Skeleton key={i} className="h-10 w-full" />
							))}
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}
