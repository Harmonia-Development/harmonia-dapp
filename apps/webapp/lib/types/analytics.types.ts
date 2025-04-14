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
