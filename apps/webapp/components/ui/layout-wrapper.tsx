import clsx from 'clsx'
import type React from 'react'

interface LayoutWrapperProps {
	children: React.ReactNode
	className?: string
}

export function LayoutWrapper({ children, className }: LayoutWrapperProps) {
	return (
		<div className={clsx('max-w-[1440px] mx-auto px-6 py-4 sm:px-8 sm:py-6', className)}>
			{children}
		</div>
	)
}
