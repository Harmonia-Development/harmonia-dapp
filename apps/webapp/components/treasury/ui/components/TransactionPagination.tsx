'use client'

import { Button } from '@/components/ui/button'

interface TransactionPaginationProps {
	currentPage: number
	totalPages: number
	onPageChange: (page: number) => void
}

export default function TransactionPagination({
	currentPage,
	totalPages,
	onPageChange,
}: TransactionPaginationProps) {
	const handlePrevious = () => {
		if (currentPage > 1) {
			onPageChange(currentPage - 1)
		}
	}

	const handleNext = () => {
		if (currentPage < totalPages) {
			onPageChange(currentPage + 1)
		}
	}

	return (
		<div className="w-full flex items-center justify-between py-4">
			<Button variant="outline" onClick={handlePrevious} disabled={currentPage === 1}>
				Previous
			</Button>

			<div className="flex items-center gap-1">
				{Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
					<Button
						key={page}
						variant={currentPage === page ? 'default' : 'outline'}
						className={currentPage === page ? 'bg-primary hover:bg-primary/90' : ''}
						onClick={() => onPageChange(page)}
					>
						{page}
					</Button>
				))}
			</div>

			<Button variant="outline" onClick={handleNext} disabled={currentPage === totalPages}>
				Next
			</Button>
		</div>
	)
}
