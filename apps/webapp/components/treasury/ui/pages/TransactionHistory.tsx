'use client'

import { Button } from '@/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { TableSkeleton } from '@/components/ui/loading-skeletons'
import { Skeleton } from '@/components/ui/skeleton'
import { ChevronDownIcon, DownloadIcon, FilterIcon, SearchIcon } from 'lucide-react'
import { useTransactionHistory } from '../../hooks/useTransactionHistory.hook'
import { AddToTreasuryButton } from '../../modals'
import TransactionPagination from '../components/TransactionPagination'
import TransactionTable from '../tables/TransactionTable'

interface TransactionHistoryProps {
	isLoading?: boolean
}

export default function TransactionHistory({ isLoading = false }: TransactionHistoryProps) {
	const {
		searchQuery,
		sortOrder,
		paginatedTransactions,
		totalPages,
		currentPage,
		selectedStatus,
		selectedType,
		showFilters,
		setShowFilters,
		setSearchQuery,
		setCurrentPage,
		setSelectedType,
		setSelectedStatus,
		setSortOrder,
	} = useTransactionHistory()

	if (isLoading) {
		return (
			<div className="rounded-lg border bg-card text-card-foreground shadow">
				<div className="flex flex-row items-center justify-between p-6">
					<div>
						<Skeleton className="h-6 w-40 mb-2" />
						<Skeleton className="h-3 w-48" />
					</div>
					<div className="flex flex-col sm:flex-row items-center gap-4">
						<Skeleton className="h-10 w-10" />
						<Skeleton className="h-10 w-32" />
					</div>
				</div>

				<div className="p-6 pt-0">
					<div className="flex items-center gap-4 py-4">
						<Skeleton className="h-10 flex-1" />
						<Skeleton className="h-10 w-10" />
					</div>

					<TableSkeleton rows={8} />
				</div>
			</div>
		)
	}

	return (
		<div className="rounded-lg border bg-card text-card-foreground shadow">
			<div className="flex flex-row items-center justify-between p-6">
				<div>
					<h3 className="text-xl font-semibold leading-none tracking-tight">Transaction History</h3>
					<p className="text-xs mt-2 text-muted-foreground">Recent treasury transactions</p>
				</div>
				<div className="flex flex-col sm:flex-row items-center gap-4">
					<Button variant="outline" size="icon">
						<DownloadIcon className="h-4 w-4" />
						<span className="sr-only">Export</span>
					</Button>
					<AddToTreasuryButton />
				</div>
			</div>

			<div className="p-6 pt-0">
				<div className="flex items-center gap-4 py-4">
					<div className="relative flex-1">
						<SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Search transactions..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-8 bg-background border-input"
						/>
					</div>
					<Button variant="outline" size="icon" onClick={() => setShowFilters(!showFilters)}>
						<FilterIcon className="h-4 w-4" />
						<span className="sr-only">Filter</span>
					</Button>
				</div>

				<div className="flex flex-wrap items-center gap-4 py-4">
					{showFilters && (
						<>
							{/* Type Filter */}
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="outline" className="bg-background">
										{selectedType === 'all'
											? 'All Types'
											: selectedType === 'inflow'
												? 'Inflow'
												: 'Outflow'}
										<ChevronDownIcon className="ml-2 h-4 w-4" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent>
									<DropdownMenuItem onClick={() => setSelectedType('all')}>
										All Types
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => setSelectedType('inflow')}>
										Inflow
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => setSelectedType('outflow')}>
										Outflow
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>

							{/* Status Filter */}
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										variant="outline"
										className={`bg-background ${
											selectedStatus !== 'all' ? 'border-primary ring-1 ring-primary' : ''
										}`}
									>
										{selectedStatus === 'all'
											? 'All Statuses'
											: selectedStatus === 'completed'
												? 'Completed'
												: 'Pending'}
										<ChevronDownIcon className="ml-2 h-4 w-4" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent>
									<DropdownMenuItem onClick={() => setSelectedStatus('all')}>
										All Statuses
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => setSelectedStatus('completed')}>
										Completed
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => setSelectedStatus('pending')}>
										Pending
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>

							{/* Sort Order */}
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="outline" className="bg-background">
										{sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}
										<ChevronDownIcon className="ml-2 h-4 w-4" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent>
									<DropdownMenuItem onClick={() => setSortOrder('newest')}>
										Newest First
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => setSortOrder('oldest')}>
										Oldest First
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</>
					)}

					<TransactionTable transactions={paginatedTransactions} />

					<TransactionPagination
						currentPage={currentPage}
						totalPages={totalPages}
						onPageChange={setCurrentPage}
					/>
				</div>
			</div>
		</div>
	)
}
