import js from '@eslint/js'
import ts from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import prettier from 'eslint-plugin-prettier'

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
				process: 'readonly',
				console: 'readonly',
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
			quotes: ['error', 'single'],
			// Enforce semicolons at the end of statements
			semi: ['error', 'never'],
			// Enforce consistent line breaks (LF for Unix)
			'linebreak-style': ['error', 'unix'],
			// Require the use of === and !== (no implicit type conversions)
			eqeqeq: ['error', 'always'],
			// Enforce a maximum line length (usually 80 or 100 characters)
			'max-len': ['error', { code: 100 }],
			// Allow unused function arguments if their name starts with an underscore
			'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
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
