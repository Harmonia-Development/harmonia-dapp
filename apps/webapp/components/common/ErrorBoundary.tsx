'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import type React from 'react'
import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
	children: ReactNode
	fallback?: ReactNode
	onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
	hasError: boolean
	error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
	public state: State = {
		hasError: false,
	}

	public static getDerivedStateFromError(error: Error): State {
		// Update state so the next render will show the fallback UI
		return { hasError: true, error }
	}

	public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		// Log error for diagnostics
		console.error('ErrorBoundary caught an error:', error, errorInfo)

		// Call custom error handler if provided
		this.props.onError?.(error, errorInfo)

		// TODO: Send to error reporting service like Sentry
		// Sentry.captureException(error, { contexts: { react: errorInfo } })
	}

	private handleRetry = () => {
		this.setState({ hasError: false, error: undefined })
	}

	public render() {
		if (this.state.hasError) {
			// Custom fallback UI
			if (this.props.fallback) {
				return this.props.fallback
			}

			// Default fallback UI
			return (
				<Card className="w-full max-w-md mx-auto mt-8">
					<CardHeader className="text-center">
						<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
							<AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
						</div>
						<CardTitle className="text-xl font-semibold text-red-900 dark:text-red-100">
							Something went wrong
						</CardTitle>
						<CardDescription className="text-red-700 dark:text-red-300">
							An unexpected error occurred. Please try again or contact support if the problem
							persists.
						</CardDescription>
					</CardHeader>
					<CardContent className="text-center space-y-4">
						{process.env.NODE_ENV === 'development' && this.state.error && (
							<details className="text-left">
								<summary className="cursor-pointer text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
									Error Details (Development Only)
								</summary>
								<pre className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-auto max-h-32">
									{this.state.error.stack}
								</pre>
							</details>
						)}
						<Button onClick={this.handleRetry} className="w-full">
							<RefreshCw className="mr-2 h-4 w-4" />
							Try Again
						</Button>
					</CardContent>
				</Card>
			)
		}

		return this.props.children
	}
}

// Higher-order component for easier usage
export function withErrorBoundary<P extends object>(
	Component: React.ComponentType<P>,
	fallback?: ReactNode,
	onError?: (error: Error, errorInfo: ErrorInfo) => void,
) {
	const WrappedComponent = (props: P) => (
		<ErrorBoundary fallback={fallback} onError={onError}>
			<Component {...props} />
		</ErrorBoundary>
	)

	WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`

	return WrappedComponent
}
