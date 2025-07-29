import type { ReactNode } from 'react'

interface EmptyStateProps {
	title: string
	description?: string
	icon?: ReactNode
	actionButton?: ReactNode
}

export function EmptyState({ title, description, icon, actionButton }: EmptyStateProps) {
	return (
		<div className="flex flex-col items-center justify-center py-12 px-4 text-center">
			{icon && <div className="mb-4">{icon}</div>}
			<h2 className="text-xl font-semibold mb-2">{title}</h2>
			{description && <p className="text-muted-foreground mb-4">{description}</p>}
			{actionButton && <div className="mt-2">{actionButton}</div>}
		</div>
	)
}
