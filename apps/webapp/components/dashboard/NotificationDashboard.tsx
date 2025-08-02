'use client'

import { Building, DollarSign, Menu, MoreVertical, Search, Settings, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { EmptyState } from '../ui/EmptyState'
import { Button } from '../ui/button'

// Types
interface Notification {
	id: string
	title: string
	message: string
	time: string
	priority: string
	category: string
	from: string
	read: boolean
}

// Mock data function
function fetchNotifications() {
	return [
		{
			id: '1',
			title: 'Proposal Ending Soon',
			message: 'Community Garden initiative voting ends in 24 hours. Cast your vote now!',
			time: '1 hour ago',
			priority: 'High',
			category: 'Governance',
			from: '@governance.dao',
			read: false,
		},
		{
			id: '2',
			title: 'Treasury Update',
			message: 'Monthly treasury report is now available for review.',
			time: '2 hours ago',
			priority: 'Medium',
			category: 'Treasury',
			from: 'treasury.admin',
			read: false,
		},
		{
			id: '3',
			title: 'New Member Joined',
			message: 'stellar.dev has joined the DAO. Say hello!',
			time: '1 day ago',
			priority: 'Low',
			category: 'Community',
			from: 'stellar.dev',
			read: true,
		},
		{
			id: '4',
			title: 'New Proposal Created',
			message: 'Protocol Upgrade v2.5 proposal has been submitted for voting.',
			time: '1 day ago',
			priority: 'Medium',
			category: 'Governance',
			from: 'tech.lead',
			read: false,
		},
		{
			id: '5',
			title: 'Platform Update',
			message: 'Harmonia DAO platform has been updated to version 1.5.0.',
			time: '2 days ago',
			priority: 'Medium',
			category: 'System',
			from: 'system.admin',
			read: true,
		},
	]
}

function getIconForCategory(category: string) {
	switch (category.toLowerCase()) {
		case 'governance':
			return Building
		case 'treasury':
			return DollarSign
		case 'community':
			return Users
		case 'system':
			return Settings
		default:
			return Settings
	}
}

const PriorityBadge = ({ priority }: { priority: string }) => {
	const getColor = () => {
		switch (priority.toLowerCase()) {
			case 'high':
				return 'bg-red-900 text-red-400'
			case 'medium':
				return 'bg-yellow-900 text-yellow-400'
			case 'low':
				return 'bg-green-900 text-green-400'
			default:
				return 'bg-gray-800 text-gray-400'
		}
	}

	return (
		<span className={`${getColor()} text-xs px-2 py-1 rounded-md font-medium`}>{priority}</span>
	)
}

// Components
const TabNavigation = ({
	activeTab,
	setActiveTab,
}: {
	activeTab: string
	setActiveTab: (tab: string) => void
}) => {
	const tabs = ['All', 'Governance', 'Community', 'Treasury', 'System']

	return (
		<div className="flex bg-gray-800 rounded-lg">
			{tabs.map((tab) => (
				// biome-ignore lint/a11y/useButtonType: <explanation>
				<button
					key={tab}
					className={`py-1 m-1 px-4 text-center flex-1 text-sm ${
						activeTab === tab
							? 'bg-black rounded-lg text-white font-medium'
							: 'text-gray-400 hover:bg-gray-700'
					}`}
					onClick={() => setActiveTab(tab)}
				>
					{tab}
				</button>
			))}
		</div>
	)
}

const SearchBar = ({
	searchQuery,
	setSearchQuery,
}: {
	searchQuery: string
	setSearchQuery: (query: string) => void
}) => {
	return (
		<div className="relative mt-3">
			<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
				<Search className="h-5 w-5 text-gray-400" />
			</div>
			<input
				type="text"
				className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-md bg-black text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2  focus:border-transparent"
				placeholder="Search notifications..."
				value={searchQuery}
				onChange={(e) => setSearchQuery(e.target.value)}
			/>
			{/* biome-ignore lint/a11y/useButtonType: <explanation> */}
			<button className="absolute inset-y-0 right-0 pr-3 flex items-center">
				<Menu className="h-5 w-5 text-gray-400" />
			</button>
		</div>
	)
}

const NotificationItem = ({ notification }: { notification: Notification }) => {
	const Icon = getIconForCategory(notification.category)

	const getPriorityColor = (priority: string): string => {
		switch (priority.toLowerCase()) {
			case 'high':
				return 'text-red-500'
			case 'medium':
				return 'text-yellow-500'
			case 'low':
				return 'text-green-500'
			default:
				return 'text-gray-400'
		}
	}

	return (
		<div className="p-4 bg-gradient-to-r from-purple-900/30 to-purple-950/40 rounded-lg flex gap-3">
			<div className="flex-shrink-0 mt-1">
				<Icon className={`h-5 w-5 ${getPriorityColor(notification.priority)}`} />
			</div>
			<div className="flex-grow min-w-0">
				<div className="flex items-center justify-between gap-3 mb-1">
					<div className="flex items-center gap-3 overflow-hidden">
						<h3 className="font-medium text-white text-sm truncate">{notification.title}</h3>
						<PriorityBadge priority={notification.priority} />
					</div>
					{/* biome-ignore lint/a11y/useButtonType: <explanation> */}
					<button className="text-gray-400 flex-shrink-0">
						<MoreVertical className="h-5 w-5" />
					</button>
				</div>
				<p className="text-gray-300 text-sm mb-2">{notification.message}</p>
				<div className="flex justify-between text-xs text-gray-400">
					<span>{notification.time}</span>
					<span className="flex items-center gap-1">
						From:
						<span
							className={`${notification.from.includes('@') ? 'text-purple-400' : 'text-gray-400'}`}
						>
							{notification.from}
						</span>
						{!notification.from.includes('@') && notification.from === 'stellar.dev' && (
							<span className="inline-flex items-center">
								{/* biome-ignore lint/style/useSelfClosingElements: <explanation> */}
								<span className="w-4 h-4 rounded-full bg-gray-600 inline-block ml-1"></span>
							</span>
						)}
					</span>
				</div>
			</div>
		</div>
	)
}

const NotificationList = ({
	notifications,
}: {
	notifications: Notification[]
}) => {
	if (notifications.length === 0) {
		return (
			<EmptyState
				title="No Notifications Yet"
				description="Create your first notification to get started."
				actionButton={<Button>Create Notification</Button>}
			/>
		)
	}

	return (
		<div className="space-y-3">
			{notifications.map((notification) => (
				<NotificationItem key={notification.id} notification={notification} />
			))}
		</div>
	)
}

const Pagination = ({
	currentPage,
	totalPages,
	onPageChange,
}: {
	currentPage: number
	totalPages: number
	onPageChange: (page: number) => void
}) => {
	return (
		<div className="flex justify-between items-center">
			<button
				type="button"
				onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
				disabled={currentPage === 1}
				className={`px-4 py-2 text-sm ${
					currentPage === 1 ? 'text-gray-600' : 'text-white hover:bg-gray-800'
				}`}
			>
				Previous
			</button>
			<div className="flex gap-2">
				{Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
					<button
						type="button"
						key={page}
						onClick={() => onPageChange(page)}
						className={`w-8 h-8 text-sm flex items-center justify-center rounded-md ${
							currentPage === page ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-800'
						}`}
					>
						{page}
					</button>
				))}
			</div>
			<button
				type="button"
				onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
				disabled={currentPage === totalPages}
				className={`px-4 py-2 text-sm ${
					currentPage === totalPages ? 'text-gray-600' : 'text-white hover:bg-gray-800'
				}`}
			>
				Next
			</button>
		</div>
	)
}

export default function NotificationDashboard() {
	const [activeTab, setActiveTab] = useState<string>('All')
	const [searchQuery, setSearchQuery] = useState<string>('')
	const [notifications, setNotifications] = useState<Notification[]>([])
	const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([])
	const [currentPage, setCurrentPage] = useState<number>(1)
	const itemsPerPage = 5

	useEffect(() => {
		// Initialize with mock data
		const data = fetchNotifications()
		setNotifications(data)
		setFilteredNotifications(data)
	}, [])

	useEffect(() => {
		let filtered = notifications

		// Filter by tab
		if (activeTab !== 'All') {
			filtered = filtered.filter((notification) => notification.category === activeTab)
		}

		// Filter by search query
		if (searchQuery) {
			filtered = filtered.filter(
				(notification) =>
					notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
					notification.message.toLowerCase().includes(searchQuery.toLowerCase()),
			)
		}

		setFilteredNotifications(filtered)
		setCurrentPage(1) // Reset to first page on filter change
	}, [activeTab, searchQuery, notifications])

	// Get current page items
	const indexOfLastItem = currentPage * itemsPerPage
	const indexOfFirstItem = indexOfLastItem - itemsPerPage
	const currentItems = filteredNotifications.slice(indexOfFirstItem, indexOfLastItem)
	const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage)

	return (
		<div className="bg-black  p-4">
			<div className="mx-auto">
				<div className="rounded-lg shadow-lg overflow-hidden">
					<div className="border p-4 m-3 rounded-xl shadow-lg">
						<TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
						<SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
						<div className="mt-4">
							<NotificationList notifications={currentItems} />
						</div>
						{totalPages > 1 && (
							<div className="mt-6">
								<Pagination
									currentPage={currentPage}
									totalPages={totalPages}
									onPageChange={setCurrentPage}
								/>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}
