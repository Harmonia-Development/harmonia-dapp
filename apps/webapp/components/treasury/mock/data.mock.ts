import type { Asset } from '../@types/asset.type'
import type { Transaction } from '../@types/transaction.types'

export const assets = [
	{ value: 'xlm', label: 'Stellar Lumens (XLM)' },
	{ value: 'usdc', label: 'USD Coin (USDC)' },
	{ value: 'eth', label: 'Ethereum (ETH)' },
	{ value: 'btc', label: 'Bitcoin (BTC)' },
]

export const mockTransactions: Transaction[] = [
	{
		id: '0x47C...8Fe3',
		description: 'Community contribution',
		amount: 1200,
		currency: 'XLM',
		date: 'May 15, 2023',
		status: 'Completed',
	},
	{
		id: '0x82D...9Fa4',
		description: 'Developer grants',
		amount: -450,
		currency: 'XLM',
		date: 'May 12, 2023',
		status: 'Completed',
	},
	{
		id: '0x93E...7Cb2',
		description: 'Protocol revenue',
		amount: 850,
		currency: 'XLM',
		date: 'May 10, 2023',
		status: 'Completed',
	},
	{
		id: '0x45F...2Ad1',
		description: 'Marketing expenses',
		amount: -320,
		currency: 'XLM',
		date: 'May 8, 2023',
		status: 'Completed',
	},
	{
		id: '0x67B...3Ee5',
		description: 'Investment return',
		amount: 1500,
		currency: 'XLM',
		date: 'May 5, 2023',
		status: 'Completed',
	},
	{
		id: '0x39C...5Fb8',
		description: 'Community event sponsorship',
		amount: -280,
		currency: 'XLM',
		date: 'May 3, 2023',
		status: 'Pending',
	},
	{
		id: '0x21A...4Dc7',
		description: 'Validator rewards',
		amount: 420,
		currency: 'XLM',
		date: 'April 28, 2023',
		status: 'Completed',
	},
	{
		id: '0x56E...1Bb2',
		description: 'Infrastructure costs',
		amount: -180,
		currency: 'XLM',
		date: 'April 25, 2023',
		status: 'Completed',
	},
	{
		id: '0x78F...9Aa3',
		description: 'Token sale proceeds',
		amount: 3000,
		currency: 'XLM',
		date: 'April 20, 2023',
		status: 'Completed',
	},
	{
		id: '0x12D...6Ee4',
		description: 'Legal consultation',
		amount: -500,
		currency: 'XLM',
		date: 'April 15, 2023',
		status: 'Completed',
	},
]

export const mockAssets: Asset[] = [
	{
		id: 'xlm',
		name: 'Stellar Lumens',
		symbol: 'XLM',
		balance: 25000,
		value: 8500,
		allocation: 40,
	},
	{
		id: 'usdc',
		name: 'USD Coin',
		symbol: 'USDC',
		balance: 6375,
		value: 6375,
		allocation: 30,
	},
	{
		id: 'eth',
		name: 'Ethereum',
		symbol: 'ETH',
		balance: 2.25,
		value: 4250,
		allocation: 20,
	},
	{
		id: 'btc',
		name: 'Bitcoin',
		symbol: 'BTC',
		balance: 0.075,
		value: 2125,
		allocation: 10,
	},
]
