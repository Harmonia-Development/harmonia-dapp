import { cva } from 'class-variance-authority'
import { AlertTriangle, Check, Clock, X } from 'lucide-react'

export function renderStatus(status: string) {
	switch (status) {
		case 'Accepted':
			return {
				icon: <Check className="h-4 w-4 text-green-500" />,
				label: 'Accepted',
			}
		case 'Rejected':
			return {
				icon: <X className="h-4 w-4 text-red-500" />,
				label: 'Rejected',
			}
		case 'Open':
			return {
				icon: <Clock className="h-4 w-4 text-amber-500" />,
				label: 'Open',
			}
		case 'Closed':
			return {
				icon: <AlertTriangle className="h-4 w-4 text-gray-400" />,
				label: 'Closed',
			}
		default:
			return { icon: null, label: status }
	}
}

export function formatWalletAddress(address: string): string {
	if (address.length <= 12) return address
	return `${address.slice(0, 6)}...${address.slice(-6)}`
}

export function formatTimestamp(timestamp: bigint): string {
	const date = new Date(Number(timestamp) * 1000)
	return date.toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	})
}

export function getTimeRemaining(deadline: bigint): {
	text: string
	isExpired: boolean
} {
	const now = Math.floor(Date.now() / 1000)
	const deadlineSeconds = Number(deadline)
	const diff = deadlineSeconds - now

	if (diff <= 0) {
		return { text: 'Expired', isExpired: true }
	}

	const days = Math.floor(diff / 86400)
	const hours = Math.floor((diff % 86400) / 3600)
	const minutes = Math.floor((diff % 3600) / 60)

	if (days > 0) {
		return { text: `${days}d ${hours}h remaining`, isExpired: false }
	}

	if (hours > 0) {
		return { text: `${hours}h ${minutes}m remaining`, isExpired: false }
	}

	return { text: `${minutes}m remaining`, isExpired: false }
}

export const categoryVariants = cva('rounded-full text-xs px-2 py-0.5 border', {
	variants: {
		category: {
			Community: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
			Technical: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
			Treasury: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
			Governance: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
		},
	},
	defaultVariants: {
		category: 'Community',
	},
})
