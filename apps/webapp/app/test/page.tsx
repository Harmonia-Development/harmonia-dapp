'use client'
import NetworkVisualization from '@/components/activity/NetworkVisualization'
import RecentActivity, { type ActivityItem } from '@/components/activity/RecentActivity'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { Card, CardContent } from '@/components/ui/card'
import { logDev } from '@/lib/utils/logger'
import { useState } from 'react'

// Sample activity data
const activityData: ActivityItem[] = [
	{
		id: '1',
		type: 'treasury-transfer',
		title: 'Treasury Transfer',
		description: '500 XLM sent to project fund',
		timestamp: '2h ago',
		initials: 'TA',
	},
	{
		id: '2',
		type: 'proposal-approved',
		title: 'Proposal Approved',
		description: 'Community garden initiative passed with 78% approval',
		timestamp: '5h ago',
		avatar: '/placeholder.svg?height=40&width=40',
	},
	{
		id: '3',
		type: 'new-member',
		title: 'New Member Joined',
		description: 'Alex.stellar joined the DAO',
		timestamp: '1d ago',
		initials: 'AS',
	},
	{
		id: '4',
		type: 'new-proposal',
		title: 'New Proposal Created',
		description: 'Ecosystem fund allocation proposal submitted',
		timestamp: '1d ago',
		initials: 'DM',
	},
	{
		id: '5',
		type: 'funds-received',
		title: 'Funds Received',
		description: '1,200 XLM received from stellar.foundation',
		timestamp: '3d ago',
		initials: 'TA',
	},
]

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

export default function Test() {
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
			<main className="min-h-screen relative overflow-hidden bg-[#070B1D]">
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Recent Activity Component */}
					<div className="lg:col-span-1">
						<ErrorBoundary>
							<RecentActivity data={activityData} onClick={(item) => logDev('Clicked:', item)} />
						</ErrorBoundary>
					</div>

					{/* Network Visualization */}
					<div className="lg:col-span-2">
						<Card className="m-3">
							<CardContent className="p-0">
								<ErrorBoundary>
									<NetworkVisualization data={networkData} color="#a855f7" nodeSize={0.15} />
								</ErrorBoundary>
							</CardContent>
						</Card>
					</div>
				</div>
			</main>
		</ErrorBoundary>
	)
}
