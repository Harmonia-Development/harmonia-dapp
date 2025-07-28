'use client'

import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { useEffect, useState } from 'react'
import { NetworkVisualization } from './Network-Visualiztion'

export default function NetworkDashboard() {
	const [mounted, setMounted] = useState(false)

	useEffect(() => {
		setMounted(true)
	}, [])

	if (!mounted) return null

	return (
		<div className="w-full max-w-4xl mx-auto flex flex-col justify-center items-center py-6">
			<div className="w-full aspect-square max-h-[500px] mb-4">
				<NetworkVisualization />
			</div>

			<div className="grid grid-cols-2 gap-4 w-full mb-4">
				<StatCard value="2,345" label="Active Connections" />
				<StatCard value="87%" label="Network Health" />
				<StatCard value="12.5s" label="Avg Response Time" />
				<StatCard value="99.8%" label="Uptime" />
			</div>

			<div className="flex flex-wrap gap-4 justify-center">
				<Badge
					variant="outline"
					className="bg-green-950/50 text-green-400 border-green-700 hover:bg-green-900/50"
				>
					Healthy
				</Badge>
				<Badge
					variant="outline"
					className="bg-purple-950/50 text-purple-400 border-purple-700 hover:bg-purple-900/50"
				>
					Optimized
				</Badge>
				<Badge
					variant="outline"
					className="bg-blue-950/50 text-blue-400 border-blue-700 hover:bg-blue-900/50"
				>
					Secure
				</Badge>
			</div>
		</div>
	)
}

function StatCard({ value, label }: { value: string; label: string }) {
	return (
		<Card className="bg-zinc-900/80 border-zinc-800 p-4 flex flex-col items-center justify-center text-center">
			<p className="text-2xl font-bold text-white">{value}</p>
			<p className="text-xs text-zinc-400">{label}</p>
		</Card>
	)
}
