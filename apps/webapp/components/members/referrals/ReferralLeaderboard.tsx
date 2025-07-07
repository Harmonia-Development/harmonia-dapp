'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import { ArrowUpDown, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'

// Interface for leaderboard member data
interface LeaderboardMember {
	id: string
	name: string
	avatar?: string
	referralCode: string
	referrals: number
	conversions: number
	conversionRate: number
}

// Mock data for leaderboard
const leaderboardData: LeaderboardMember[] = [
	{
		id: '1',
		name: 'stellar.dev',
		avatar: '/placeholder.svg?height=32&width=32',
		referralCode: 'STE-47B3C902',
		referrals: 42,
		conversions: 28,
		conversionRate: 67,
	},
	{
		id: '2',
		name: 'crypto.guru',
		avatar: '/placeholder.svg?height=32&width=32',
		referralCode: 'CRY-F8C7M635',
		referrals: 38,
		conversions: 22,
		conversionRate: 58,
	},
	{
		id: '3',
		name: 'blockchain.wizard',
		avatar: '/placeholder.svg?height=32&width=32',
		referralCode: 'BLO-K4L3PQN1',
		referrals: 35,
		conversions: 19,
		conversionRate: 54,
	},
	{
		id: '4',
		name: 'dao.advocate',
		avatar: '/placeholder.svg?height=32&width=32',
		referralCode: 'DAO-P9Q8R756',
		referrals: 29,
		conversions: 15,
		conversionRate: 52,
	},
	{
		id: '5',
		name: 'harmony.stellar',
		avatar: '/placeholder.svg?height=32&width=32',
		referralCode: 'HAR-T5U4V3N2',
		referrals: 24,
		conversions: 18,
		conversionRate: 75,
	},
]

type SortField = 'name' | 'referrals' | 'conversions' | 'conversionRate'
type SortDirection = 'asc' | 'desc'

/**
 * Leaderboard tab component showing top referrers with sorting functionality
 */
export function ReferralLeaderboard() {
	const [sortField, setSortField] = useState<SortField>('conversionRate')
	const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
	const [showAll, setShowAll] = useState(false)

	// Handle sorting
	const handleSort = (field: SortField) => {
		if (sortField === field) {
			setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
		} else {
			setSortField(field)
			setSortDirection('desc')
		}
	}

	// Sort data based on current sort settings
	const sortedData = [...leaderboardData].sort((a, b) => {
		const aValue = a[sortField]
		const bValue = b[sortField]

		if (typeof aValue === 'string' && typeof bValue === 'string') {
			return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
		}

		return sortDirection === 'asc'
			? (aValue as number) - (bValue as number)
			: (bValue as number) - (aValue as number)
	})

	// Get conversion rate color based on percentage
	const getConversionRateColor = (rate: number) => {
		if (rate >= 70) return 'text-green-500'
		if (rate >= 60) return 'text-yellow-500'
		return 'text-red-500'
	}

	// Render sort icon
	const SortIcon = ({ field }: { field: SortField }) => {
		if (sortField !== field) return <ArrowUpDown className="w-4 h-4" />
		return sortDirection === 'asc' ? (
			<ChevronUp className="w-4 h-4" />
		) : (
			<ChevronDown className="w-4 h-4" />
		)
	}

	const displayData = showAll ? sortedData : sortedData.slice(0, 5)

	return (
		<Card className="bg-[#070709] border-[#1a1a1d]">
			<CardHeader>
				<CardTitle className="text-white">Top Referrers</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="rounded-md border border-[#1a1a1d]">
					<Table>
						<TableHeader>
							<TableRow className="border-[#1a1a1d] hover:bg-[#2d2d32] bg-[#171719]">
								<TableHead
									className="text-gray-300 cursor-pointer hover:text-white"
									onClick={() => handleSort('name')}
								>
									<div className="flex items-center space-x-2">
										<span>Member</span>
										<SortIcon field="name" />
									</div>
								</TableHead>
								<TableHead className="text-gray-300">Referral Code</TableHead>
								<TableHead
									className="text-gray-300 cursor-pointer hover:text-white text-right"
									onClick={() => handleSort('referrals')}
								>
									<div className="flex items-center justify-end space-x-2">
										<span>Referrals</span>
										<SortIcon field="referrals" />
									</div>
								</TableHead>
								<TableHead
									className="text-gray-300 cursor-pointer hover:text-white text-right"
									onClick={() => handleSort('conversions')}
								>
									<div className="flex items-center justify-end space-x-2">
										<span>Conversions</span>
										<SortIcon field="conversions" />
									</div>
								</TableHead>
								<TableHead
									className="text-gray-300 cursor-pointer hover:text-white text-right"
									onClick={() => handleSort('conversionRate')}
								>
									<div className="flex items-center justify-end space-x-2">
										<span>Rate</span>
										<SortIcon field="conversionRate" />
									</div>
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{displayData.map((member) => (
								<TableRow key={member.id} className="border-[#1a1a1d] hover:bg-[#2d2d32]">
									<TableCell className="font-medium">
										<div className="flex items-center space-x-3">
											<Avatar className="h-8 w-8">
												<AvatarImage src={member.avatar || '/placeholder.svg'} alt={member.name} />
												<AvatarFallback className="bg-[#2d2d32] text-gray-300">
													{member.name.charAt(0).toUpperCase()}
												</AvatarFallback>
											</Avatar>
											<span className="text-white">{member.name}</span>
										</div>
									</TableCell>
									<TableCell className="text-gray-300 font-mono text-sm">
										{member.referralCode}
									</TableCell>
									<TableCell className="text-white text-right font-medium">
										{member.referrals}
									</TableCell>
									<TableCell className="text-white text-right font-medium">
										{member.conversions}
									</TableCell>
									<TableCell className="text-right">
										<span
											className={`font-medium ${getConversionRateColor(member.conversionRate)}`}
										>
											{member.conversionRate}%
										</span>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>

				{/* View All Button */}
				<div className="flex justify-center mt-6">
					<Button
						variant="outline"
						onClick={() => setShowAll(!showAll)}
						className="bg-transparent border-[#1a1a1d] text-gray-300 hover:bg-[#2d2d32] "
					>
						{showAll ? 'Show Less' : 'View All Referrers'}
					</Button>
				</div>
			</CardContent>
		</Card>
	)
}
