'use client'

import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Download } from 'lucide-react'
import { useState } from 'react'
import { ReferralLeaderboard } from './ReferralLeaderboard'
import { ReferralOverviewChart } from './ReferralOverviewChart'
import { ReferralPerformanceChart } from './ReferralPerformanceChart'

/**
 * Main component for the Referral Statistics section
 * Handles tab navigation and export functionality
 */
export function ReferralStatsTabs() {
	const [activeTab, setActiveTab] = useState('overview')

	// Handle export functionality (placeholder for now)
	const handleExport = () => {
		console.log(`Exporting ${activeTab} data...`)
		// TODO: Implement actual export functionality
	}

	return (
		<div className="w-full space-y-6">
			{/* Header Section */}
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-2xl font-bold text-white">Referral Statistics</h2>
					<p className="text-sm text-gray-400 mt-1">Track your member referral performance</p>
				</div>
				<Button
					variant="outline"
					size="sm"
					onClick={handleExport}
					className="bg-[#070709] border-[#1a1a1d] text-gray-300 hover:bg-[#1a1a1d]"
				>
					<Download className="w-4 h-4 mr-2" />
					Export
				</Button>
			</div>

			{/* Tabs Container */}
			<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
				<TabsList className="grid w-full grid-cols-3 bg-[#262629] border border-[#1a1a1d] h-12 ">
					<TabsTrigger
						value="overview"
						className="data-[state=active]:bg-[#070709] data-[state=active]:text-white text-gray-400 h-9"
					>
						Overview
					</TabsTrigger>
					<TabsTrigger
						value="performance"
						className="data-[state=active]:bg-[#070709] data-[state=active]:text-white text-gray-400 h-9"
					>
						Performance
					</TabsTrigger>
					<TabsTrigger
						value="leaderboard"
						className="data-[state=active]:bg-[#070709] data-[state=active]:text-white text-gray-400 h-9"
					>
						Leaderboard
					</TabsTrigger>
				</TabsList>

				{/* Tab Content */}
				<TabsContent value="overview" className="mt-6">
					<ReferralOverviewChart />
				</TabsContent>

				<TabsContent value="performance" className="mt-6">
					<ReferralPerformanceChart />
				</TabsContent>

				<TabsContent value="leaderboard" className="mt-6">
					<ReferralLeaderboard />
				</TabsContent>
			</Tabs>
		</div>
	)
}
