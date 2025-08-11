import js from '@eslint/js'
import ts from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import prettier from 'eslint-plugin-prettier'
import globals from 'globals'

export default [
	js.configs.recommended,
	{
		files: ['**/*.ts'],
		languageOptions: {
			parser: tsParser,
			parserOptions: {
				ecmaVersion: 'latest',
				sourceType: 'module',
				project: './tsconfig.eslint.json',
			},
			globals: {
				...globals.node,
				...globals.es2021,
			},
		},
		plugins: {
			'@typescript-eslint': ts,
			prettier: prettier,
		},
		rules: {
			// Enforce consistent indentation (2 spaces in this case)
			indent: ['error', 'tab'],
			// Enforce the use of single quotes for strings
			quotes: ['error', 'single', { avoidEscape: true, allowTemplateLiterals: true }],
			// Enforce semicolons at the end of statements
			semi: ['error', 'never'],
			// Enforce consistent line breaks (LF for Unix)
			'linebreak-style': ['error', 'unix'],
			// Require the use of === and !== (no implicit type conversions)
			eqeqeq: ['error', 'always'],
			// Disable max-len in ESLint to avoid conflicts with Biome's lineWidth setting
			'max-len': 'off',
			// Disable the base no-unused-vars (doesn't handle TypeScript properly)
			'no-unused-vars': 'off',
			// Use TypeScript's no-unused-vars rule, allow args/vars starting with "_"
			'@typescript-eslint/no-unused-vars': [
				'error',
				{ argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
			],
			// Enable Prettier as a lint rule
			'prettier/prettier': [
				'error',
				{
					singleQuote: true,
					semi: false,
				},
			],
		},
	},

	// Allow Jest globals like describe, it, expect, etc. in test files
	{
		files: ['**/*.test.ts', '**/__tests__/**/*.ts'],
		languageOptions: {
			globals: {
				jest: 'readonly',
				describe: 'readonly',
				it: 'readonly',
				test: 'readonly',
				expect: 'readonly',
				beforeEach: 'readonly',
				afterEach: 'readonly',
				beforeAll: 'readonly',
				afterAll: 'readonly',
				fetch: 'readonly',
				global: 'readonly',
				globalThis: 'readonly',
			},
		},
	},

	{
		ignores: [
			'**/*.config.ts',
			'node_modules/**',
			'config/db.sqlite',
			'dist/**',
			'.env',
			'coverage/**',
			'package-lock.json',
			'jest.config.js',
		],
	},
]
