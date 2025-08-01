import path from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
	plugins: [react()],
	test: {
		environment: 'jsdom',
		setupFiles: ['./__tests__/setup.ts'],
		globals: true,
	},
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './'),
		},
	},
})
