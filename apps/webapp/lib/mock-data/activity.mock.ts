import type { ActivityItem } from '@/components/activity/RecentActivity'

// Sample activity data
export const activityData: ActivityItem[] = [
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
