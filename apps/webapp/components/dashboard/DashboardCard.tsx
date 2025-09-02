import { cn } from '@/lib/utils'
import clsx from 'clsx'
import type { LucideIcon } from 'lucide-react'
import { TrendingDown, TrendingUp } from 'lucide-react'

type ColorVariant = 'blue' | 'green' | 'purple' | 'orange' | 'neutral'

interface DashboardCardProps {
	title: string
	label: string
	text: string
	value: string | number
	valueSuffix?: string
	change: { value: number; direction: 'up' | 'down' }
	completionPercentage?: number
	icon?: LucideIcon
	color?: ColorVariant
	className?: string
}

export function DashboardCard({
	title,
	label,
	text,
	value,
	valueSuffix,
	change,
	completionPercentage,
	icon: Icon,
	color = 'neutral',
	className,
}: DashboardCardProps) {
	const isUp = change.direction === 'up'

	const cardGradient = clsx('bg-gradient-to-br', {
		'from-blue-900/40 to-blue-950/40': color === 'blue',
		'from-green-900/40 to-green-950/40': color === 'green',
		'from-purple-900/40 to-purple-950/40': color === 'purple',
		'from-orange-900/40 to-orange-950/40': color === 'orange',
		'from-gray-800/40 to-gray-900/40': color === 'neutral',
	})

	const iconWrap = clsx({
		'bg-blue-500/20': color === 'blue',
		'bg-green-500/20': color === 'green',
		'bg-purple-500/20': color === 'purple',
		'bg-amber-500/20': color === 'orange',
		'bg-gray-500/20': color === 'neutral',
	})

	return (
		<div
			className={cn(
				'rounded-2xl p-4 md:p-5 lg:p-6 border border-gray-800/60 transition-all duration-300',
				'w-full max-w-full hover:border-gray-700/70 transform hover:scale-[1.02]',
				cardGradient,
				className,
			)}
		>
			{/* Header */}
			<div className="flex items-center justify-between mb-3">
				<span className="text-gray-300/90 text-[13px]">{title}</span>
				{Icon ? (
					<div
						className={cn(
							'w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ring-1 ring-white/5',
							iconWrap,
						)}
					>
						<Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white/90" />
					</div>
				) : null}
			</div>

			{/* Value + delta */}
			<div className="flex flex-col gap-2">
				<div className="flex items-end gap-2">
					<span className="text-white text-2xl sm:text-3xl font-semibold leading-none">
						{typeof value === 'number' ? value.toLocaleString() : value}
					</span>
					{valueSuffix ? (
						<span className="text-white/70 text-sm sm:text-base pb-[2px]">{valueSuffix}</span>
					) : null}
				</div>

				<div className="flex items-center gap-2">
					<span
						className={cn(
							'text-xs sm:text-sm inline-flex items-center gap-1',
							isUp ? 'text-emerald-400' : 'text-red-400',
						)}
					>
						{isUp ? (
							<TrendingUp className="w-3.5 h-3.5" />
						) : (
							<TrendingDown className="w-3.5 h-3.5" />
						)}
					</span>
					<span className={cn('text-xs sm:text-sm', isUp ? 'text-emerald-400' : 'text-red-400')}>
						{text}
					</span>
				</div>
			</div>

			{/* Progress */}
			{typeof completionPercentage === 'number' && (
				<div className="mt-4">
					<div className="flex items-center justify-between mb-2">
						<p className="text-white/90 text-[13px]">{label}</p>
						<div className="text-white text-xs sm:text-sm">{completionPercentage}%</div>
					</div>
					<div className="w-full h-1.5 sm:h-2 rounded-full bg-white/10 overflow-hidden">
						<div
							className="h-full rounded-full bg-white"
							style={{
								width: `${Math.max(0, Math.min(100, completionPercentage))}%`,
							}}
						/>
					</div>
				</div>
			)}
		</div>
	)
}
