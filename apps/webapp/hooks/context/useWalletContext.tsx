'use client'

import { WalletNetwork } from '@creit.tech/stellar-wallets-kit'
import {
	type ReactNode,
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from 'react'

export interface WalletState {
	address: string | null
	name: string | null
	connected: boolean
	network: WalletNetwork
	isLoading: boolean
	error: string | null
	selectedWalletId: string | null
}

export interface WalletContextType extends WalletState {
	connect: (address: string, name: string, walletId: string) => void
	disconnect: () => void
	setNetwork: (network: WalletNetwork) => void
	setError: (error: string | null) => void
	setLoading: (loading: boolean) => void
	setSelectedWallet: (walletId: string | null) => void
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: ReactNode }) {
	const [state, setState] = useState<WalletState>({
		address: null,
		name: null,
		connected: false,
		network: WalletNetwork.TESTNET,
		isLoading: false,
		error: null,
		selectedWalletId: null,
	})

	useEffect(() => {
		try {
			const savedAddress = localStorage.getItem('stellarWalletAddress')
			const savedName = localStorage.getItem('stellarWalletName')
			const savedWalletId = localStorage.getItem('stellarWalletId')
			const savedNetwork = localStorage.getItem('stellarWalletNetwork')

			if (savedAddress && savedName) {
				setState((prev) => ({
					...prev,
					address: savedAddress,
					name: savedName,
					connected: true,
					selectedWalletId: savedWalletId,
					network: savedNetwork === 'mainnet' ? WalletNetwork.PUBLIC : WalletNetwork.TESTNET,
				}))
			}
		} catch (error) {
			console.error('Error loading persisted wallet state:', error)
		}
	}, [])

	const connect = useCallback((address: string, name: string, walletId: string) => {
		try {
			setState((prev) => {
				const newState = {
					...prev,
					address,
					name,
					connected: true,
					selectedWalletId: walletId,
					error: null,
				}

				localStorage.setItem('stellarWalletAddress', address)
				localStorage.setItem('stellarWalletName', name)
				localStorage.setItem('stellarWalletId', walletId)
				localStorage.setItem(
					'stellarWalletNetwork',
					newState.network === WalletNetwork.PUBLIC ? 'mainnet' : 'testnet',
				)

				return newState
			})
		} catch (error) {
			console.error('Error persisting wallet connection:', error)
		}
	}, [])

	const disconnect = useCallback(() => {
		setState((prev) => ({
			...prev,
			address: null,
			name: null,
			connected: false,
			selectedWalletId: null,
			error: null,
		}))

		localStorage.removeItem('stellarWalletAddress')
		localStorage.removeItem('stellarWalletName')
		localStorage.removeItem('stellarWalletId')
		localStorage.removeItem('stellarWalletNetwork')
	}, [])

	const setNetwork = useCallback((network: WalletNetwork) => {
		setState((prev) => ({
			...prev,
			network,
		}))

		localStorage.setItem(
			'stellarWalletNetwork',
			network === WalletNetwork.PUBLIC ? 'mainnet' : 'testnet',
		)
	}, [])

	const setError = useCallback((error: string | null) => {
		setState((prev) => ({
			...prev,
			error,
		}))
	}, [])

	const setLoading = useCallback((isLoading: boolean) => {
		setState((prev) => ({
			...prev,
			isLoading,
		}))
	}, [])

	const setSelectedWallet = useCallback((selectedWalletId: string | null) => {
		setState((prev) => ({
			...prev,
			selectedWalletId,
		}))
	}, [])

	const value: WalletContextType = useMemo(
		() => ({
			...state,
			connect,
			disconnect,
			setNetwork,
			setError,
			setLoading,
			setSelectedWallet,
		}),
		[state, connect, disconnect, setNetwork, setError, setLoading, setSelectedWallet],
	)

	return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}

export function useWalletContext() {
	const context = useContext(WalletContext)
	if (context === undefined) {
		throw new Error('useWalletContext must be used within a WalletProvider')
	}
	return context
}
