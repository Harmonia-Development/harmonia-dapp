import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { DashboardMetrics } from '@/components/dashboard/DashboardMetrics'
import { NotificationPanel } from '@/components/notifications/NotificationPanel'
import { LayoutWrapper } from '@/components/ui/layout-wrapper'
import { ThemeWrapper } from '@/components/ui/theme-wrapper'
import { ActiveProposals } from '../proposals/ActiveProposals'

export function LandingPage() {
	return (
		<ErrorBoundary>
			<ThemeWrapper>
				<LayoutWrapper>
					<div className="grid grid-cols-1 gap-2 lg:gap-4 lg:grid-cols-3">
						<section className="lg:col-span-2">
							<ErrorBoundary>
								<DashboardMetrics />
							</ErrorBoundary>
							<ErrorBoundary>
								<AnalyticsDashboard />
							</ErrorBoundary>
							<ErrorBoundary>
								<ActiveProposals />
							</ErrorBoundary>
						</section>

						<aside className="lg:col-span-1 lg:sticky lg:top-4 self-start">
							<ErrorBoundary>
								<NotificationPanel />
							</ErrorBoundary>
						</aside>
					</div>
				</LayoutWrapper>
			</ThemeWrapper>
		</ErrorBoundary>
	)
}
