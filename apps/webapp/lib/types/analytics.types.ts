export interface TreasuryData {
	date: string
	balance: number
}

export interface VoteData {
	label: string
	value: number
	color: string
}

export interface PieLabelRenderProps {
	cx: number
	cy: number
	midAngle: number
	innerRadius: number
	outerRadius: number
	percent: number
	index: number
}

export interface MemberData {
	day: string
	activeMembers: number
	newMembers: number
}

export interface CategoryData {
	category: string
	value: number
	color: string
}
