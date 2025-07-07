'use client'
import { logDev } from '@/lib/utils/logger'
import {
	BarChart3,
	Bell,
	CircleDollarSign,
	FileText,
	LayoutDashboard,
	Moon,
	Search,
	Sun,
	Users,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type React from 'react'
import { useState } from 'react'
import { WalletConnectButton } from '../wallet/connect-button'
// Navigation items
const navItems = [
	{
		name: 'Dashboard',
		path: '/dashboard',
		icon: <LayoutDashboard size={20} />,
	},
	{ name: 'Proposals', path: '/proposals', icon: <FileText size={20} /> },
	{ name: 'Treasury', path: '/treasury', icon: <CircleDollarSign size={20} /> },
	{ name: 'Analytics', path: '/analytics', icon: <BarChart3 size={20} /> },
	{ name: 'Members', path: '/members', icon: <Users size={20} /> },
]

const Header: React.FC = () => {
	const pathname = usePathname() // Get the current path
	const [isSearchExpanded, setIsSearchExpanded] = useState(false)
	const [searchQuery, setSearchQuery] = useState('')
	const [isDarkMode, setIsDarkMode] = useState(true)

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault()
		logDev('Searching for:', searchQuery)
		// Implement your search logic here
		setSearchQuery('')
		setIsSearchExpanded(false)
	}

	const toggleTheme = () => {
		setIsDarkMode(!isDarkMode)
	}

	return (
		<header className="bg-black text-white px-6 py-5 shadow-xl  flex items-center justify-between border-b border-gray-500">
			<div className="flex items-center space-x-6">
				<Link href="/">
					<span className="text-2xl font-bold">
						<span className="text-white">H</span>
						<span className="text-purple-500">armonia</span>
					</span>
				</Link>

				{/* Navigation */}
				<nav className="hidden md:flex items-center space-x-2">
					{navItems.map((item) => (
						<Link
							href={item.path}
							key={item.name}
							className={`px-3 py-2 rounded-md flex items-center space-x-2 ${
								pathname === item.path
									? 'bg-gray-800 text-white'
									: 'text-gray-300 hover:bg-gray-700 hover:text-white'
							}`}
						>
							<span className="text-gray-400">{item.icon}</span>
							<span>{item.name}</span>
							{item.name === 'Analytics' && (
								<span className="absolute w-2 h-2 bg-white rounded-full -mt-5 animate-pulse" />
							)}
						</Link>
					))}
				</nav>
			</div>

			{/* Right side - Search, Notifications, Theme Toggle, Profile */}
			<div className="flex items-center space-x-2">
				{/* Search */}
				<WalletConnectButton />
				<div className="relative">
					<form onSubmit={handleSearch} className="flex items-center">
						{isSearchExpanded ? (
							<input
								type="text"
								placeholder="Search"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="bg-gray-800 text-white px-4 py-1 rounded-md pr-8 focus:outline-none focus:ring-1 focus:ring-purple-500"
							/>
						) : (
							<button
								type="button"
								onClick={() => setIsSearchExpanded(true)}
								className="p-2 rounded-md text-gray-300 hover:bg-gray-700 hover:text-white flex items-center"
							>
								<Search size={20} />
								<span className="ml-2">Search</span>
								<span className="ml-1 text-gray-500">⌘K</span>
							</button>
						)}
					</form>
				</div>

				{/* Notifications */}
				<button
					type="button"
					className="p-2 rounded-md text-gray-300 hover:bg-gray-700 hover:text-white relative"
				>
					<Bell size={20} />
					<span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
				</button>

				{/* Theme Toggle */}
				<button
					type="button"
					className="p-2 rounded-md text-gray-300 hover:bg-gray-700 hover:text-white"
					onClick={toggleTheme}
				>
					{isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
				</button>

				{/* Profile */}
				<div className="ml-2">
					<button
						type="button"
						className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center"
					>
						{/* This would be an avatar image in a real app */}
						<span className="text-gray-800 font-medium">JS</span>
					</button>
				</div>
			</div>
		</header>
	)
}

export default Header
