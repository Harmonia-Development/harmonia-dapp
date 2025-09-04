'use client'

import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { DashboardMetrics } from '@/components/dashboard/DashboardMetrics'
import { NotificationPanel } from '@/components/notifications/NotificationPanel'
import { ActiveProposals } from '@/components/proposals/ActiveProposals'
import { LayoutWrapper } from '@/components/ui/layout-wrapper'
import { ThemeWrapper } from '@/components/ui/theme-wrapper'
import { activityData } from '@/lib/mock-data/activity.mock'
import { useState } from 'react'
import { NetworkVisualization } from '../activity/NetworkVisualization'
import { RecentActivity } from '../activity/RecentActivity'

// Demo data generation function
const generateNetworkData = (nodeCount = 30, connectionDensity = 0.15) => {
	// Ensure nodeCount is positive
	const safeNodeCount = Math.max(1, nodeCount)

	const nodes: {
		id: string
		x: number
		y: number
		z: number
		connections: string[]
	}[] = []

	// Generate nodes
	for (let i = 0; i < safeNodeCount; i++) {
		// Create positions on a sphere
		const phi = Math.acos(-1 + (2 * i) / safeNodeCount)
		const theta = Math.sqrt(safeNodeCount * Math.PI) * phi

		const radius = 4.5
		const x = radius * Math.cos(theta) * Math.sin(phi)
		const y = radius * Math.sin(theta) * Math.sin(phi)
		const z = radius * Math.cos(phi)

		// Add some random variation but keep inside sphere
		const jitter = 0.3
		nodes.push({
			id: `node-${i + 1}`,
			x: x + (Math.random() - 0.5) * jitter,
			y: y + (Math.random() - 0.5) * jitter,
			z: z + (Math.random() - 0.5) * jitter,
			connections: [],
		})
	}

	// Add connections between nodes - limit the number of connections
	nodes.forEach((node, i) => {
		const connections = []
		const maxConnections = 3
		let connectionCount = 0

		// Shuffle array of potential targets
		const potentialTargets = nodes
			.map((_, j) => j)
			.filter((j) => j !== i)
			.sort(() => Math.random() - 0.5)

		// Add connections up to the max or until we run out of targets
		for (let j = 0; j < potentialTargets.length && connectionCount < maxConnections; j++) {
			const targetIndex = potentialTargets[j]
			if (Math.random() < connectionDensity) {
				connections.push(nodes[targetIndex].id)
				connectionCount++
			}
		}
		;(
			node as {
				id: string
				x: number
				y: number
				z: number
				connections: string[]
			}
		).connections = connections
	})

	return nodes
}

export function LandingPage() {
	const [networkData] = useState(() => {
		try {
			return generateNetworkData(20, 0.15)
		} catch (error) {
			console.error('Error generating network data:', error)
			return [] // Return empty array as fallback
		}
	})

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
							<ErrorBoundary>
								<RecentActivity
									data={activityData}
									onClick={(item) => console.log('Clicked:', item)}
								/>
							</ErrorBoundary>
							<ErrorBoundary>
								<NetworkVisualization data={networkData} color="#a855f7" nodeSize={0.15} />
							</ErrorBoundary>
						</aside>
					</div>
				</LayoutWrapper>
			</ThemeWrapper>
		</ErrorBoundary>
	)
}
