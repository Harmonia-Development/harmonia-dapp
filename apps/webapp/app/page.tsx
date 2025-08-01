import DAODashboard from '@/components/dashboard/DAODashboard'
import DashBoardMain from '@/components/dashboard/DashBoardMain'
import { LayoutWrapper } from '@/components/ui/layout-wrapper'
import { ThemeWrapper } from '@/components/ui/theme-wrapper'
import React from 'react'

export default function Page() {
	return (
		<ThemeWrapper>
			<LayoutWrapper>
				<div className="flex justify-between items-center">
					<div className="flex items-center space-x-2">
						<h2 className="text-xl font-semibold">Notifications</h2>
						<span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">2 new</span>
					</div>
					<button
						type="button"
						className="text-gray-400 hover:text-gray-600 dark:hover:text-white text-xs"
					>
						Mark all read
					</button>
				</div>

				<p className="text-base text-gray-600 dark:text-gray-400">
					Stay update on important DAO activites
				</p>
				<DAODashboard />
				<DashBoardMain />
			</LayoutWrapper>
		</ThemeWrapper>
	)
}
