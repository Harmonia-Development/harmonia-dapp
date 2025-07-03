import type { DataPoint, MemberData, VoteData } from '../types/governance-types'

export const data: DataPoint[] = [
	{ name: 'P1', rate1: 78, rate2: 80 },
	{ name: 'P2', rate1: 65, rate2: 80 },
	{ name: 'P3', rate1: 93, rate2: 80 },
	{ name: 'P4', rate1: 75, rate2: 80 },
	{ name: 'P5', rate1: 82, rate2: 80 },
	{ name: 'P6', rate1: 74, rate2: 80 },
	{ name: 'P7', rate1: 85, rate2: 80 },
]

export const votingData: VoteData[] = [
	{ label: 'For', value: 65, color: '#1ec45f' },
	{ label: 'Against', value: 25, color: '#ed4545' },
	{ label: 'Abstain', value: 10, color: '#6a6f8b' },
]

export const memberData: MemberData[] = [
	{
		month: 'January',
		active: 50,
		newMembers: 30,
		passed: 20,
		rejected: 10,
	},
	{
		month: 'February',
		active: 60,
		newMembers: 35,
		passed: 25,
		rejected: 15,
	},
	{
		month: 'mar',
		active: 50,
		newMembers: 30,
		passed: 20,
		rejected: 10,
	},
	{
		month: 'Apr',
		active: 60,
		newMembers: 35,
		passed: 25,
		rejected: 15,
	},
	{
		month: 'May',
		active: 50,
		newMembers: 30,
		passed: 20,
		rejected: 10,
	},
	{
		month: 'June',
		active: 60,
		newMembers: 35,
		passed: 25,
		rejected: 15,
	},
	{
		month: 'July',
		active: 50,
		newMembers: 30,
		passed: 20,
		rejected: 10,
	},
]
