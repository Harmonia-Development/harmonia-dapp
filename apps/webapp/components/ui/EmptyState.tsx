import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface EmptyStateProps {
	title: string
	description?: string
	icon?: ReactNode
	actionButton?: ReactNode
	className?: string
}

export function EmptyState({ title, description, icon, actionButton, className }: EmptyStateProps) {
	return (
		<div
			className={cn(
				'flex flex-col items-center justify-center py-8 px-4 text-center',
				'sm:py-12 sm:px-6',
				'md:py-16 md:px-8',
				className,
			)}
		>
			{icon && <div className="mb-4 text-muted-foreground">{icon}</div>}
			<h3 className="text-lg font-semibold mb-2 sm:text-xl">{title}</h3>
			{description && (
				<p className="text-muted-foreground mb-6 max-w-md text-sm sm:text-base">{description}</p>
			)}
			{actionButton && <div className="mt-2">{actionButton}</div>}
		</div>
	)
}
