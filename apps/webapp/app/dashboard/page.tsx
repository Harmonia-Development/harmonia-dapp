import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import DashBoardMain from '@/components/dashboard/DashBoardMain'
import { DashboardMetrics } from '@/components/dashboard/DashboardMetrics'
import { LayoutWrapper } from '@/components/ui/layout-wrapper'
import { ThemeWrapper } from '@/components/ui/theme-wrapper'
import React from 'react'

export default function Page() {
	return (
		<ErrorBoundary>
			<ThemeWrapper>
				<LayoutWrapper>
					<div className=" sm:px-6 lg:px-8">
						<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
							<div>
								<h2 className="text-xl sm:text-2xl font-semibold">Notifications</h2>
								<p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
									Stay updated on important DAO activities
								</p>
							</div>
							<div className="flex items-center gap-2">
								<span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">2 new</span>
								<button
									type="button"
									className="text-gray-400 hover:text-gray-600 dark:hover:text-white text-xs"
								>
									Mark all read
								</button>
							</div>
						</div>

						<ErrorBoundary>
							<DashboardMetrics />
						</ErrorBoundary>
						<ErrorBoundary>
							<DashBoardMain />
						</ErrorBoundary>
					</div>
				</LayoutWrapper>
			</ThemeWrapper>
		</ErrorBoundary>
	)
}
