import type { Config } from 'tailwindcss'

export default {
	darkMode: ['class'],
	content: [
		'./pages/**/*.{js,ts,jsx,tsx,mdx}',
		'./components/**/*.{js,ts,jsx,tsx,mdx}',
		'./app/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/**/*.{ts,tsx}',
		'*.{js,ts,jsx,tsx,mdx}',
	],
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px',
			},
		},
		extend: {
			colors: {
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))',
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))',
				},
				primary: '#723DCA',
				'primary-hover': '#5b2f9e',
				'gray-dark': '#2C2C2C',
				'gray-darker': '#1E1E1E',
				'gray-border': '#3A3A3A',
				accent: '#262629',
				'accent-dark': '#070709',
				'background-dark': '#010102',
				'background-light': '#fff',
				success: '#22c55e',
				danger: '#ef4444',
				info: '#3B82F6',
				warning: '#F59E0B',
				// Charts
				'chart-green': '#10B981',
				'chart-purple': '#8B5CF6',
				'chart-blue': '#3B82F6',
				'chart-yellow': '#FFBB28',
				'chart-cyan': '#00C49F',
				'chart-indigo': '#8884d8',
				// Otros colores usados
				'purple-brand': '#a855f7',
				'purple-dark': '#9333ea',
				'blue-brand': '#3b82f6',
				'green-brand': '#00FF99',
				'gray-verydark': '#171719',
				'neutral-900': '#1F2937',
				'neutral-800': '#2A2A2A',
				'neutral-700': '#333',
				'neutral-600': '#ccc',
				'neutral-500': '#999',
				'neutral-400': '#888',
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
			},
		},
	},
	// eslint-disable-next-line @typescript-eslint/no-require-imports
	plugins: [require('tailwindcss-animate')],
} satisfies Config
