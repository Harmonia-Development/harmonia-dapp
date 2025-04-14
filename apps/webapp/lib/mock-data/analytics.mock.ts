import type { TreasuryData, VoteData } from '../types/analytics.types'

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
