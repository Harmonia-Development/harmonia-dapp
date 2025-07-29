'use client'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LayoutWrapper } from '@/components/ui/layout-wrapper'
import { ThemeWrapper } from '@/components/ui/theme-wrapper'
import { logError } from '@/lib/utils/logger'
import { useState } from 'react'

export default function TestPage() {
	const [error, setError] = useState<string | null>(null)

	const triggerError = () => {
		try {
			throw new Error('Test error for error boundary')
		} catch (err) {
			logError('Test error triggered', err)
			setError(err instanceof Error ? err.message : 'Unknown error')
		}
	}

	const triggerAsyncError = async () => {
		try {
			await new Promise((_, reject) => {
				setTimeout(() => reject(new Error('Async test error')), 100)
			})
		} catch (err) {
			logError('Async test error triggered', err)
			setError(err instanceof Error ? err.message : 'Unknown async error')
		}
	}

	return (
		<ErrorBoundary>
			<ThemeWrapper>
				<LayoutWrapper>
					<div className="space-y-6">
						<div>
							<h1 className="text-3xl font-bold tracking-tight">Test Page</h1>
							<p className="text-gray-600 dark:text-gray-400 text-lg">
								Test error boundaries and error handling
							</p>
						</div>
						<Card>
							<CardHeader>
								<CardTitle>Error Boundary Testing</CardTitle>
								<CardDescription>
									Test the error boundary functionality and error logging
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="flex gap-4">
									<Button onClick={triggerError} variant="destructive">
										Trigger Sync Error
									</Button>
									<Button onClick={triggerAsyncError} variant="destructive">
										Trigger Async Error
									</Button>
								</div>
								{error && (
									<div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
										<p className="text-red-800 dark:text-red-200 font-medium">Error:</p>
										<p className="text-red-700 dark:text-red-300">{error}</p>
									</div>
								)}
							</CardContent>
						</Card>
					</div>
				</LayoutWrapper>
			</ThemeWrapper>
		</ErrorBoundary>
	)
}
