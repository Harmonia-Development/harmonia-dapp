'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Coins, type LucideIcon, Users, Vote } from 'lucide-react'
import type React from 'react'
import { useEffect, useState } from 'react'

type ActivityType =
	| 'treasury-transfer'
	| 'proposal-approved'
	| 'new-member'
	| 'new-proposal'
	| 'funds-received'

export interface ActivityItem {
	id: string
	type: ActivityType
	title: string
	description: string
	timestamp: string
	icon?: React.ReactNode
	avatar?: string
	initials?: string
}

interface RecentActivityProps {
	data: ActivityItem[]
	onClick?: (item: ActivityItem) => void
	className?: string
	title?: string
	subtitle?: string
}

// Map activity types to their respective icons
const activityIcons: Record<ActivityType, LucideIcon> = {
	'treasury-transfer': Coins,
	'proposal-approved': Vote,
	'new-member': Users,
	'new-proposal': Vote,
	'funds-received': Coins,
}

// Map activity types to their respective colors
const activityColors: Record<ActivityType, string> = {
	'treasury-transfer': 'bg-background-dark text-chart-blue',
	'proposal-approved': 'bg-background-dark text-white',
	'new-member': 'bg-background-dark text-chart-purple',
	'new-proposal': 'bg-background-dark text-white',
	'funds-received': 'bg-background-dark text-chart-blue',
}

export default function RecentActivity({
	data,
	onClick,
	className,
	title = 'Recent Activity',
	subtitle = 'Latest actions in your DAO',
}: RecentActivityProps) {
	const [activities, setActivities] = useState<ActivityItem[]>(data || [])

	// Update activities when data changes
	useEffect(() => {
		if (data) {
			setActivities(data)
		}
	}, [data])

	// Format relative time (e.g., "2h ago")
	const formatRelativeTime = (timestamp: string) => {
		return timestamp
	}
	const handleKeyDown = (e: React.KeyboardEvent, item: ActivityItem) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault()
			onClick?.(item)
		}
	}

	return (
		<Card className={cn('bg-background-dark border-gray-800 m-3', className)}>
			<CardHeader className="pb-3">
				<CardTitle className="text-2xl font-bold text-white">{title}</CardTitle>
				<CardDescription className="text-gray-400 text-base">{subtitle}</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				{activities.map((activity) => {
					const IconComponent = activityIcons[activity.type]
					const colorClass = activityColors[activity.type]

					return (
						<button
							type="button"
							key={activity.id}
							className="w-full flex items-start space-x-4 cursor-pointer hover:bg-gray-900 rounded-md p-1 transition-colors text-left"
							onClick={() => onClick?.(activity)}
							onKeyDown={(e) => handleKeyDown(e, activity)}
							tabIndex={0}
						>
							<div className={cn('p-2 rounded-full flex items-center justify-center', colorClass)}>
								<IconComponent className="h-5 w-5" />
							</div>

							<div className="flex-1 space-y-1">
								{activity.initials && (
									<div className="flex gap-2">
										<p className="text-white font-medium">{activity.title}</p>
										<div className="h-5 w-5 rounded-full bg-gray-verydark flex items-center justify-center text-xs font-medium text-white">
											{activity.initials}
										</div>
									</div>
								)}
								<p className="text-gray-400 text-sm">{activity.description}</p>
								<p className="text-gray-400 text-sm">{formatRelativeTime(activity.timestamp)}</p>
							</div>
						</button>
					)
				})}
			</CardContent>
		</Card>
	)
}
