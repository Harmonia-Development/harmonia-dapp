import { DashboardMetrics } from '@/components/dashboard/DashboardMetrics'
import { NotificationPanel } from '@/components/dashboard/NotificationPanel'
import { LayoutWrapper } from '@/components/ui/layout-wrapper'
import { ThemeWrapper } from '@/components/ui/theme-wrapper'

export default function Page() {
	return (
		<ThemeWrapper>
			<LayoutWrapper>
				<div className="grid grid-cols-1 gap-2 lg:gap-4 lg:grid-cols-3">
					<section className="lg:col-span-2">
						<DashboardMetrics />
					</section>
					<aside className="lg:col-span-1 lg:sticky lg:top-4 self-start">
						<NotificationPanel />
					</aside>
				</div>
			</LayoutWrapper>
		</ThemeWrapper>
	)
}
