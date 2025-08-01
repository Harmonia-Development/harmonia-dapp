import clsx from 'clsx'
import type React from 'react'

interface ThemeWrapperProps {
	children: React.ReactNode
	className?: string
}

export function ThemeWrapper({ children, className }: ThemeWrapperProps) {
	return (
		<div
			className={clsx(
				'bg-white text-black dark:bg-[#070B1D] dark:text-white min-h-screen',
				className,
			)}
		>
			{children}
		</div>
	)
}
