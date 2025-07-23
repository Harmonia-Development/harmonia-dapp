import { Skeleton } from '@/components/ui/skeleton'

// Card skeleton for general content
export function CardSkeleton() {
	return (
		<div className="p-4 rounded-lg border border-gray-700">
			<Skeleton className="h-6 w-32 mb-2" />
			<Skeleton className="h-4 w-48 mb-4" />
			<Skeleton className="h-20 w-full" />
		</div>
	)
}

// Chart skeleton for analytics components
export function ChartSkeleton() {
	const legendKeys = ['legend-a', 'legend-b', 'legend-c', 'legend-d']
	return (
		<div className="rounded-xl border bg-card text-card-foreground shadow p-6 space-y-4">
			<Skeleton className="h-6 w-40 mb-2" />
			<Skeleton className="h-4 w-48 mb-4" />
			<Skeleton className="h-64 w-full rounded-md" />
			<div className="grid grid-cols-1 gap-4 mt-4">
				{legendKeys.map((key) => (
					<div key={key} className="flex justify-between items-center">
						<div className="flex items-center gap-2">
							<Skeleton className="w-4 h-4 rounded-full" />
							<Skeleton className="h-4 w-20" />
						</div>
						<Skeleton className="h-4 w-8" />
					</div>
				))}
			</div>
		</div>
	)
}

// Table skeleton for data tables
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
	const headerKeys = ['header-a', 'header-b', 'header-c', 'header-d']
	return (
		<div className="space-y-3">
			<div className="flex justify-between items-center">
				<Skeleton className="h-8 w-32" />
				<Skeleton className="h-10 w-24" />
			</div>
			<div className="border border-gray-700 rounded-lg">
				<div className="p-4 border-b border-gray-700">
					<div className="grid grid-cols-4 gap-4">
						{headerKeys.map((key) => (
							<Skeleton key={key} className="h-4 w-20" />
						))}
					</div>
				</div>
				{Array.from({ length: rows }).map((_, i) => {
					const rowKey = `row-${i}-${Date.now()}`
					return (
						<div key={rowKey} className="p-4 border-b border-gray-700 last:border-b-0">
							<div className="grid grid-cols-4 gap-4">
								{headerKeys.map((headerKey) => (
									<Skeleton key={`cell-${rowKey}-${headerKey}`} className="h-4 w-full" />
								))}
							</div>
						</div>
					)
				})}
			</div>
		</div>
	)
}

// Proposal card skeleton
export function ProposalCardSkeleton() {
	return (
		<div className="w-full border rounded-xl bg-muted/40 p-4 space-y-4">
			<div className="flex flex-wrap justify-between gap-2 items-start">
				<div className="space-y-2 w-full sm:w-auto">
					<Skeleton className="h-5 w-48 rounded-md" />
					<div className="flex items-center gap-2">
						<Skeleton className="h-4 w-20 rounded-full" />
						<Skeleton className="h-4 w-20 rounded-full" />
					</div>
				</div>
			</div>

			<div className="space-y-1">
				<Skeleton className="h-4 w-full" />
				<Skeleton className="h-4 w-5/6" />
			</div>

			<div className="space-y-2">
				<div className="flex justify-between text-sm">
					<Skeleton className="h-4 w-16" />
					<Skeleton className="h-4 w-20" />
					<Skeleton className="h-4 w-20" />
				</div>
				<div className="w-full h-2 rounded-full bg-muted" />
			</div>

			<div className="flex items-center gap-2 text-xs text-muted-foreground">
				<Skeleton className="h-4 w-4 rounded-full" />
				<Skeleton className="h-4 w-32" />
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
				<Skeleton className="h-8 w-full rounded-md" />
				<Skeleton className="h-8 w-full rounded-md" />
				<Skeleton className="h-8 w-full rounded-md" />
			</div>
		</div>
	)
}

// Member card skeleton
export function MemberCardSkeleton() {
	return (
		<div className="p-4 rounded-lg border border-gray-700 space-y-3">
			<div className="flex items-center gap-3">
				<Skeleton className="w-12 h-12 rounded-full" />
				<div className="space-y-2">
					<Skeleton className="h-4 w-32" />
					<Skeleton className="h-3 w-24" />
				</div>
			</div>
			<div className="flex justify-between items-center">
				<Skeleton className="h-4 w-20" />
				<Skeleton className="h-6 w-16" />
			</div>
		</div>
	)
}

// Dashboard stats skeleton
export function StatsSkeleton() {
	const statKeys = ['stat-a', 'stat-b', 'stat-c', 'stat-d']
	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
			{statKeys.map((key) => (
				<div key={key} className="p-4 rounded-lg border border-gray-700">
					<Skeleton className="h-4 w-24 mb-2" />
					<Skeleton className="h-8 w-16 mb-1" />
					<Skeleton className="h-3 w-20" />
				</div>
			))}
		</div>
	)
}

// Modal skeleton
export function ModalSkeleton() {
	return (
		<div className="p-6 space-y-4">
			<Skeleton className="h-6 w-32" />
			<div className="space-y-3">
				<Skeleton className="h-4 w-full" />
				<Skeleton className="h-4 w-3/4" />
				<Skeleton className="h-10 w-full" />
			</div>
			<div className="flex justify-end gap-2">
				<Skeleton className="h-10 w-20" />
				<Skeleton className="h-10 w-20" />
			</div>
		</div>
	)
}
