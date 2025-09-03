'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Check } from 'lucide-react'
import { useState } from 'react'
import { NotificationItem, type NotificationItemProps } from './NotificationItem'

// Mock data
export const MOCK_NOTIFICATIONS: NotificationItemProps[] = [
	{
		id: '1',
		type: 'proposal',
		message: 'Community Garden Initiative voting ends in 24 hours',
		timestamp: '1 hour ago',
		unread: true,
	},
	{
		id: '2',
		type: 'treasury',
		message: 'Monthly treasury report is now available',
		timestamp: '3 hours ago',
		unread: true,
	},
	{
		id: '3',
		type: 'member',
		message: 'stellar.dev has joined the DAO',
		timestamp: '1 day ago',
		unread: false,
	},
]

export function NotificationPanel() {
	const [items, setItems] = useState<NotificationItemProps[]>(MOCK_NOTIFICATIONS)
	const unreadCount = items.filter((i) => i.unread).length

	const markAllRead = () => setItems((prev) => prev.map((i) => ({ ...i, unread: false })))
	const toggleOne = (id: string) =>
		setItems((prev) => prev.map((i) => (i.id === id ? { ...i, unread: !i.unread } : i)))

	return (
		<Card className="w-full">
			<CardHeader className="pb-3">
				<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
					<div className="min-w-0 flex items-center gap-2">
						<CardTitle className="text-white truncate">Notifications</CardTitle>
						<Badge className="rounded-full px-2 py-0.5 text-xs shrink-0">{unreadCount} new</Badge>
					</div>

					<Button
						variant="ghost"
						size="sm"
						onClick={markAllRead}
						disabled={unreadCount === 0}
						className="self-start sm:self-auto"
					>
						<Check className="mr-1 h-4 w-4" />
						Mark all read
					</Button>
				</div>

				<CardDescription className="text-white/60 text-sm">
					Stay updated on important DAO activities
				</CardDescription>
			</CardHeader>

			<CardContent className="pt-0">
				<ScrollArea className="max-h-[60vh] sm:max-h-[420px]">
					<ul className="space-y-3 pr-2">
						{items.map((n) => (
							<li key={n.id}>
								<NotificationItem {...n} onToggleRead={toggleOne} />
							</li>
						))}
					</ul>
				</ScrollArea>
			</CardContent>
		</Card>
	)
}
