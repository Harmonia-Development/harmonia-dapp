import { cn } from '@/lib/utils'
import type React from 'react'
interface DashboardCardProps {
	title: string
	label: string
	text: string
	value: string | number
	change: {
		value: number
		direction: 'up' | 'down'
	}
	completionPercentage?: number
	icon?: React.ElementType
	gradient?: {
		from: string
		to: string
	}
	iconBackground?: string
	className?: string
}

const DashboardCard: React.FC<DashboardCardProps> = ({
	title,
	label,
	text,
	value,
	change,
	completionPercentage,
	icon: Icon,
	gradient = { from: 'from-[#1E1E1E]', to: 'to-[#1E1E1E]' },
	iconBackground = 'bg-blue-500/20',
	className,
}) => {
	return (
		<div
			className={cn(
				'rounded-lg p-4 md:p-5 lg:p-6 border border-[#2C2C2C] hover:border-[#3A3A3A] transition-all duration-300',
				'w-full max-w-full',
				`bg-gradient-to-br ${gradient.from} ${gradient.to}`,
				'transform hover:scale-[1.02] transition-transform duration-300',
				className,
			)}
		>
			<div className="flex justify-between items-center mb-3">
				<span className="text-gray-400 text-xs sm:text-sm">{title}</span>
				{Icon && (
					<div
						className={cn(
							'flex items-center justify-center rounded-full',
							iconBackground,
							'w-8 h-8 sm:w-10 sm:h-10',
							className,
						)}
					/>
				)}
			</div>

			<div className="flex flex-col space-y-2">
				<span className="text-white text-xl sm:text-2xl font-semibold">{value}</span>

				<div className="flex flex-row items-center space-x-2">
					<span
						className={cn(
							'text-xs sm:text-sm flex items-center',
							change.direction === 'up' ? 'text-green-500' : 'text-red-500',
						)}
					>
						{change.direction === 'up' ? '▲' : '▼'}
					</span>
					<span className="text-green-500 text-xs sm:text-sm">{text}</span>
				</div>
			</div>

			{completionPercentage !== undefined && (
				<div className="mt-3">
					<div className="flex flex-row items-center justify-between mb-2">
						<p className="text-white text-sm sm:text-lg">{label}</p>
						<div className="text-white text-xs sm:text-base">{completionPercentage}%</div>
					</div>
					<div className="w-full bg-[#2C2C2C] rounded-full h-1.5 sm:h-2">
						<div
							className="bg-white h-1.5 sm:h-2 rounded-full"
							style={{ width: `${completionPercentage}%` }}
						/>
					</div>
				</div>
			)}
		</div>
	)
}
export default DashboardCard
