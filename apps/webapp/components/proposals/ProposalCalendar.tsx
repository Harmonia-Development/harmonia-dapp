'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

export type ProposalEvent = {
	date: string // ISO format: '2025-04-22'
	label: string
	type?: 'start' | 'end' | 'live' | 'voting' // Optional event type for different styling
}

interface ProposalCalendarProps {
	events: ProposalEvent[]
	className?: string
}

export function ProposalCalendar({ events = [], className }: ProposalCalendarProps) {
	const [currentDate, setCurrentDate] = useState(new Date())

	// Get the first day of the month
	const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)

	// Get the last day of the month
	const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

	// Get the day of the week for the first day (0 = Sunday, 1 = Monday, etc.)
	const firstDayOfWeek = firstDayOfMonth.getDay()

	// Calculate the number of days in the month
	const daysInMonth = lastDayOfMonth.getDate()

	// Create an array of day numbers for the current month
	const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

	// Create an array for the empty cells before the first day of the month
	const emptyCellsBefore = Array.from({ length: firstDayOfWeek }, (_, i) => null)

	// Function to check if a day has events
	const getEventsForDay = (day: number) => {
		const dateString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
		return events.filter((event) => event.date.startsWith(dateString))
	}

	// Function to navigate to previous month
	const goToPreviousMonth = () => {
		setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
	}

	// Function to navigate to next month
	const goToNextMonth = () => {
		setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
	}

	// Function to go to current month
	const goToCurrentMonth = () => {
		setCurrentDate(new Date())
	}

	// Format the month and year
	const monthYearString = currentDate.toLocaleDateString('en-US', {
		month: 'long',
		year: 'numeric',
	})

	// Check if we're viewing the current month
	const isCurrentMonth =
		new Date().getMonth() === currentDate.getMonth() &&
		new Date().getFullYear() === currentDate.getFullYear()

	// Get today's date if we're in the current month
	const today = isCurrentMonth ? new Date().getDate() : null

	// Check if there are any events this month
	const hasEventsThisMonth = events.some((event) => {
		const eventDate = new Date(event.date)
		return (
			eventDate.getMonth() === currentDate.getMonth() &&
			eventDate.getFullYear() === currentDate.getFullYear()
		)
	})

	// Get event type color
	const getEventTypeColor = (type?: string) => {
		switch (type) {
			case 'start':
				return 'bg-blue-500'
			case 'end':
				return 'bg-red-500'
			case 'live':
				return 'bg-green-500'
			case 'voting':
				return 'bg-purple-500'
			default:
				return 'bg-gray-500'
		}
	}

	return (
		<Card className={className}>
			<CardHeader className="pb-3">
				<div className="flex items-center justify-between">
					<CardTitle>Proposal Calendar</CardTitle>
					<div className="flex gap-1">
						<Button
							variant="outline"
							size="icon"
							onClick={goToPreviousMonth}
							aria-label="Previous month"
						>
							<ChevronLeft className="h-4 w-4" />
						</Button>
						{!isCurrentMonth && (
							<Button
								variant="outline"
								size="sm"
								onClick={goToCurrentMonth}
								aria-label="Go to current month"
							>
								Today
							</Button>
						)}
						<Button variant="outline" size="icon" onClick={goToNextMonth} aria-label="Next month">
							<ChevronRight className="h-4 w-4" />
						</Button>
					</div>
				</div>
				<div className="text-sm text-muted-foreground">{monthYearString}</div>
			</CardHeader>
			<CardContent>
				{/* Calendar grid */}
				<div className="grid grid-cols-7 gap-1 text-center text-xs">
					{/* Day headers */}
					{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
						<div key={day} className="font-medium py-1">
							{day}
						</div>
					))}

					{/* Empty cells before the first day */}
					{emptyCellsBefore.map((_, index) => (
						<div key={`empty-cell-${currentDate.getMonth()}-${index}`} className="h-8 rounded-md" />
					))}

					{/* Days of the month */}
					<TooltipProvider>
						{days.map((day) => {
							const dayEvents = getEventsForDay(day)
							const isToday = day === today

							return (
								<Tooltip key={day} delayDuration={300}>
									<TooltipTrigger asChild>
										<div
											className={`
                        relative h-8 rounded-md flex items-center justify-center
                        ${isToday ? 'bg-muted font-bold' : dayEvents.length > 0 ? 'hover:bg-muted/50' : ''}
                      `}
											aria-label={`${day} ${monthYearString}${dayEvents.length > 0 ? `, ${dayEvents.length} events` : ''}`}
										>
											<span>{day}</span>

											{/* Event indicators */}
											{dayEvents.length > 0 && (
												<div className="absolute bottom-1 left-0 right-0 flex justify-center gap-0.5">
													{dayEvents.map((event) => (
														<div
															key={`event-indicator-${day}-${event.date}-${event.label}`}
															className={`h-1.5 w-1.5 rounded-full ${getEventTypeColor(event.type)}`}
															aria-hidden="true"
														/>
													))}
												</div>
											)}
										</div>
									</TooltipTrigger>

									{dayEvents.length > 0 && (
										<TooltipContent side="bottom" align="center" className="max-w-[200px]">
											<div className="space-y-1">
												<p className="font-medium">
													{day} {monthYearString}
												</p>
												<ul className="text-xs space-y-1">
													{dayEvents.map((event) => (
														<li
															key={`event-tooltip-${event.date}-${event.label}`}
															className="flex items-center gap-1.5"
														>
															<span
																className={`h-2 w-2 rounded-full ${getEventTypeColor(event.type)}`}
															/>
															<span>{event.label}</span>
														</li>
													))}
												</ul>
											</div>
										</TooltipContent>
									)}
								</Tooltip>
							)
						})}
					</TooltipProvider>
				</div>

				{/* Empty state */}
				{!hasEventsThisMonth && (
					<div className="mt-4 text-center text-sm text-muted-foreground">
						No proposal events scheduled for this month
					</div>
				)}

				{/* Legend */}
				<div className="mt-4 flex flex-wrap gap-3 text-xs">
					<div className="flex items-center gap-1.5">
						<span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
						<span>Start</span>
					</div>
					<div className="flex items-center gap-1.5">
						<span className="h-2.5 w-2.5 rounded-full bg-green-500" />
						<span>Live</span>
					</div>
					<div className="flex items-center gap-1.5">
						<span className="h-2.5 w-2.5 rounded-full bg-purple-500" />
						<span>Voting</span>
					</div>
					<div className="flex items-center gap-1.5">
						<span className="h-2.5 w-2.5 rounded-full bg-red-500" />
						<span>End</span>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}
