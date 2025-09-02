import DashBoardMain from '@/components/dashboard/DashBoardMain'
import { DashboardMetrics } from '@/components/dashboard/DashboardMetrics'
import { LayoutWrapper } from '@/components/ui/layout-wrapper'
import { ThemeWrapper } from '@/components/ui/theme-wrapper'
import React from 'react'

export default function Page() {
	return (
		<ThemeWrapper>
			<LayoutWrapper>
				<DashboardMetrics />
				<DashBoardMain />
			</LayoutWrapper>
		</ThemeWrapper>
	)
}
