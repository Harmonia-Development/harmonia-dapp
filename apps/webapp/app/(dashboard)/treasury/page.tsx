import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import AssetManagementPanel from '@/components/treasury/ui/pages/AssetManagementPanel'
import BudgetAllocation from '@/components/treasury/ui/pages/BudgetAllocation'
import TransactionHistory from '@/components/treasury/ui/pages/TransactionHistory'
import { LayoutWrapper } from '@/components/ui/layout-wrapper'
import { ThemeWrapper } from '@/components/ui/theme-wrapper'
import type { Metadata } from 'next'

export const metadata: Metadata = {
	title: 'Treasury | Harmonia',
	description: 'Manage your DAO treasury assets and transactions',
}

export default function TreasuryPage() {
	return (
		<ErrorBoundary>
			<ThemeWrapper>
				<LayoutWrapper>
					<div className="flex flex-col md:flex-row justify-between">
						<div className="w-full grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
							<div className="order-1 md:order-1 md:col-span-1 lg:col-span-2">
								<ErrorBoundary>
									<TransactionHistory />
								</ErrorBoundary>
							</div>
							<div className="order-2 md:order-1 md:col-span-1">
								<ErrorBoundary>
									<BudgetAllocation />
								</ErrorBoundary>
								<div className="mt-6">
									<ErrorBoundary>
										<AssetManagementPanel />
									</ErrorBoundary>
								</div>
							</div>
						</div>
					</div>
				</LayoutWrapper>
			</ThemeWrapper>
		</ErrorBoundary>
	)
}
