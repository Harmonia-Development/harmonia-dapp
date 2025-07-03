import type { DoaData, PerformData, PerformanceData } from '../types/comparative-types'

export const data: PerformanceData[] = [
	{ name: 'Jan', value: 105 },
	{ name: 'Feb', value: 106 },
	{ name: 'Mar', value: 107 },
	{ name: 'Apr', value: 108 },
	{ name: 'May', value: 110 },
	{ name: 'Jun', value: 112 },
	{ name: 'Jul', value: 115 },
]

export const performance: PerformData[] = [
	{ name: 'Development', current: 35, previous: 32 },
	{ name: 'Marketing', current: 28, previous: 30 },
	{ name: 'Operations', current: 22, previous: 25 },
	{ name: 'Community', current: 10, previous: 5 },
	{ name: 'Reserve', current: 12, previous: 15 },
]

export const doa: DoaData[] = [
	{ month: 'Jan', efficiency: 91 },
	{ month: 'Feb', efficiency: 93 },
	{ month: 'Mar', efficiency: 90 },
	{ month: 'Apr', efficiency: 89 },
	{ month: 'May', efficiency: 92 },
	{ month: 'Jun', efficiency: 91 },
	{ month: 'Jul', efficiency: 90 },
]
