'use client'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import MembersDashboard from '@/components/members/MembersDashboard'
import { LayoutWrapper } from '@/components/ui/layout-wrapper'
import { ThemeWrapper } from '@/components/ui/theme-wrapper'

export default function Page() {
	return (
		<ErrorBoundary>
			<ThemeWrapper>
				<LayoutWrapper>
					<div className="min-w-screen flex justify-between items-center">
						<MembersDashboard />
					</div>
				</LayoutWrapper>
			</ThemeWrapper>
		</ErrorBoundary>
	)
}
