'use client'

import { cva } from 'class-variance-authority'
import clsx from 'clsx'
import { motion } from 'framer-motion'
import type { ReactElement } from 'react'
import React from 'react'

export interface StatCardProps {
	title: string
	value: number
	description: string
	icon?: React.ReactNode
	percentage?: number
	progressLabel?: string
	variant?: 'default' | 'success' | 'error' | 'info'
}

const iconContainerVariants = cva('rounded-full p-2 flex-shrink-0', {
	variants: {
		variant: {
			default: 'bg-gray-500/20',
			success: 'bg-success/20',
			error: 'bg-danger/20',
			info: 'bg-info/20',
		},
	},
	defaultVariants: {
		variant: 'default',
	},
})

const iconVariants = cva('', {
	variants: {
		variant: {
			default: 'text-gray-400',
			success: 'text-success',
			error: 'text-danger',
			info: 'text-info',
		},
	},
})

const progressVariants = cva('h-1.5 rounded-full', {
	variants: {
		variant: {
			default: 'bg-gray-400',
			success: 'bg-success',
			error: 'bg-danger',
			info: 'bg-info',
		},
	},
})

const cardVariants = cva('rounded-lg p-4 md:p-5 relative', {
	variants: {
		variant: {
			default: 'bg-gradient-to-br from-gray-darker to-gray-dark border border-gray-dark',
			success: 'bg-gradient-to-br from-green-900/40 to-green-950/40 border border-success/20',
			error: 'bg-gradient-to-br from-red-900/40 to-red-950/40 border border-danger/20',
			info: 'bg-gradient-to-br from-blue-900/40 to-blue-950/40 border border-info/20',
		},
	},
})

// Función auxiliar para renderizar el icono con la clase correcta
const renderIcon = (icon: React.ReactNode, variant: 'default' | 'success' | 'error' | 'info') => {
	// Si no es un elemento React válido, no renderizamos nada
	if (!React.isValidElement(icon)) return null

	// Extraer la clase actual si existe
	const element = icon as ReactElement<{ className?: string }>
	const currentClassName = element.props.className || ''

	// Crear un nuevo elemento con la clase combinada
	return (
		<div className={iconContainerVariants({ variant })}>
			<span className={clsx(currentClassName, iconVariants({ variant }), 'w-4 h-4')}>{icon}</span>
		</div>
	)
}

export const ProposalStatCard: React.FC<StatCardProps> = ({
	title,
	value,
	description,
	icon,
	percentage,
	progressLabel = 'Proportion',
	variant = 'default',
}) => {
	return (
		<motion.div
			initial={{ opacity: 0, y: 8 }}
			animate={{ opacity: 1, y: 0 }}
			whileHover={{ scale: 1.02 }}
			className={clsx(
				cardVariants({ variant }),
				'shadow-sm hover:shadow-md transition-all duration-300',
			)}
		>
			<div className="flex justify-between items-start gap-3 mb-3">
				<div className="flex-1 min-w-0">
					<span className="text-gray-400 text-sm font-medium">{title}</span>
				</div>
				{icon && renderIcon(icon, variant)}
			</div>

			<div className="space-y-1">
				<div className="text-white text-2xl font-bold">{value}</div>
				<p className="text-gray-400 text-xs">{description}</p>
			</div>

			{percentage !== undefined && (
				<div className="mt-3">
					<div className="flex justify-between items-center mb-1.5">
						<span className="text-gray-400 text-sm">{progressLabel}</span>
						<span className="text-gray-300 text-sm font-semibold">{percentage}%</span>
					</div>
					<div className="w-full bg-[#2C2C2C] rounded-full h-1.5">
						<div
							className={clsx(
								progressVariants({ variant }),
								'h-1.5 rounded-full transition-all duration-300',
							)}
							style={{ width: `${percentage}%` }}
							role="progressbar"
							tabIndex={0}
							aria-valuenow={percentage}
							aria-valuemin={0}
							aria-valuemax={100}
						/>
					</div>
				</div>
			)}
		</motion.div>
	)
}
