'use client'

import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { ProposalCalendar } from '@/components/proposals/ProposalCalendar'
import { ProposalCategoryChart } from '@/components/proposals/ProposalCategoryChart'
import { ProposalList } from '@/components/proposals/ProposalList'
import { ProposalStats } from '@/components/proposals/ProposalStats'
import { LayoutWrapper } from '@/components/ui/layout-wrapper'
import { ThemeWrapper } from '@/components/ui/theme-wrapper'
import { useProposal } from '@/hooks/useProposal'
import { useEffect, useState } from 'react'

export default function ProposalsPage() {
	const { getAllProposals } = useProposal()
	const [isLoading, setIsLoading] = useState(true)

	// Load proposals from contract
	useEffect(() => {
		const fetchProposals = async () => {
			try {
				setIsLoading(true)
				await getAllProposals()
			} catch (err) {
				console.error('Failed to load proposals:', err)
			} finally {
				setIsLoading(false)
			}
		}

		fetchProposals()
	}, [getAllProposals])

	return (
		<ErrorBoundary>
			<ThemeWrapper>
				<LayoutWrapper>
					<div className="px-4 sm:px-6 lg:px-8">
						<div className="mb-6 sm:mb-8">
							<h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Proposals</h1>
							<p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg mt-2">
								Create, vote, and track governance proposals
							</p>
						</div>

						<div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
							<div className="lg:col-span-2 space-y-4 sm:space-y-6">
								<ErrorBoundary>
									<ProposalStats />
								</ErrorBoundary>
								<ErrorBoundary>
									<ProposalList isLoading={isLoading} />
								</ErrorBoundary>
							</div>
							<div className="space-y-4 sm:space-y-6">
								<ErrorBoundary>
									<ProposalCategoryChart data={[]} isLoading={isLoading} />
								</ErrorBoundary>
								<ErrorBoundary>
									<ProposalCalendar events={[]} />
								</ErrorBoundary>
							</div>
						</div>
					</div>
				</LayoutWrapper>
			</ThemeWrapper>
		</ErrorBoundary>
	)
}
