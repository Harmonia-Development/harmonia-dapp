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
					<div className="w-full  lg:px-8">
						<MembersDashboard />
					</div>
				</LayoutWrapper>
			</ThemeWrapper>
		</ErrorBoundary>
	)
}
