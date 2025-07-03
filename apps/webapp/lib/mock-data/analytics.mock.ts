import type { CategoryData, MemberData, TreasuryData, VoteData } from '../types/analytics.types'

export const treasuryData: TreasuryData[] = [
	{ date: 'Jan', balance: 34000 },
	{ date: 'Feb', balance: 42000 },
	{ date: 'Mar', balance: 52000 },
	{ date: 'Apr', balance: 63000 },
	{ date: 'May', balance: 74000 },
	{ date: 'Jun', balance: 86000 },
	{ date: 'Jul', balance: 98000 },
]

export const votingData: VoteData[] = [
	{ label: 'For', value: 65, color: '#9333ea' },
	{ label: 'Against', value: 25, color: '#3b82f6' },
	{ label: 'Abstain', value: 10, color: '#ec4899' },
]

export const memberData: MemberData[] = [
	{ day: 'Mon', activeMembers: 312, newMembers: 42 },
	{ day: 'Tue', activeMembers: 368, newMembers: 54 },
	{ day: 'Wed', activeMembers: 446, newMembers: 78 },
	{ day: 'Thu', activeMembers: 398, newMembers: 64 },
	{ day: 'Fri', activeMembers: 386, newMembers: 49 },
	{ day: 'Sat', activeMembers: 304, newMembers: 38 },
	{ day: 'Sun', activeMembers: 278, newMembers: 32 },
]

export const categoryData: CategoryData[] = [
	{ category: 'Treasury', value: 42, color: '#9333ea' },
	{ category: 'Governance', value: 28, color: '#3b82f6' },
	{ category: 'Community', value: 18, color: '#ec4899' },
	{ category: 'Technical', value: 12, color: '#f59e0b' },
]
