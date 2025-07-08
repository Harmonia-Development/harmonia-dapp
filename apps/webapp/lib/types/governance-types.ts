export interface DataPoint {
	name: string
	rate1: number
	rate2: number
}

export interface VoteData {
	label: string
	value: number
	color: string
}

export interface MemberData {
	month: string
	active: number
	passed: number
	rejected: number
	newMembers: number
}
