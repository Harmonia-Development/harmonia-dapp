'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
	currentPage: number
	totalPages: number
	onPageChange: (page: number) => void
}

export function ProposalPagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
	const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

	return (
		<div className="flex flex-wrap items-center justify-between gap-2 sm:gap-4 mt-4">
			<Button
				variant="outline"
				onClick={() => onPageChange(Math.max(1, currentPage - 1))}
				disabled={currentPage === 1}
				className="border-border/40 flex-1 sm:flex-none"
			>
				<ChevronLeft className="h-4 w-4 mr-1" />
				Previous
			</Button>

			<div className="flex flex-wrap justify-center gap-1 sm:gap-2">
				{pages.map((page) => (
					<Button
						key={page}
						variant={currentPage === page ? 'default' : 'outline'}
						size="sm"
						onClick={() => onPageChange(page)}
						className={cn(
							'w-8 h-8 p-0',
							currentPage === page ? 'bg-primary text-primary-foreground' : 'border-border/40',
						)}
					>
						{page}
					</Button>
				))}
			</div>

			<Button
				variant="outline"
				onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
				disabled={currentPage === totalPages}
				className="border-border/40 flex-1 sm:flex-none"
			>
				Next
				<ChevronRight className="h-4 w-4 ml-1" />
			</Button>
		</div>
	)
}
