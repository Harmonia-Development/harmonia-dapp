import { useState } from 'react'
import { mockTransactions } from '../mock/data.mock'

export const useTransactionHistory = () => {
	const [searchQuery, setSearchQuery] = useState('')
	const [currentPage, setCurrentPage] = useState(1)
	const [selectedType, setSelectedType] = useState<string>('all')
	const [selectedStatus, setSelectedStatus] = useState<string>('all')
	const [sortOrder, setSortOrder] = useState<string>('newest')
	const [showFilters, setShowFilters] = useState<boolean>(false)

	const itemsPerPage = 6

	// Filter transactions based on search query, type, and status
	const filteredTransactions = mockTransactions.filter((transaction) => {
		const matchesSearch =
			transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
			transaction.id.toLowerCase().includes(searchQuery.toLowerCase())

		const matchesType =
			selectedType === 'all' ||
			(selectedType === 'inflow' && transaction.amount > 0) ||
			(selectedType === 'outflow' && transaction.amount < 0)

		const matchesStatus =
			selectedStatus === 'all' || transaction.status.toLowerCase() === selectedStatus.toLowerCase()

		return matchesSearch && matchesType && matchesStatus
	})

	// Sort transactions
	const sortedTransactions = [...filteredTransactions].sort((a, b) => {
		const dateA = new Date(a.date).getTime()
		const dateB = new Date(b.date).getTime()

		return sortOrder === 'newest' ? dateB - dateA : dateA - dateB
	})

	// Paginate transactions
	const paginatedTransactions = sortedTransactions.slice(
		(currentPage - 1) * itemsPerPage,
		currentPage * itemsPerPage,
	)

	const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage)

	return {
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
	}
}
