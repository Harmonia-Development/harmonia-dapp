/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import {
	AlbedoModule,
	FreighterModule,
	HanaModule,
	HotWalletModule,
	LobstrModule,
	RabetModule,
	StellarWalletsKit,
	WalletNetwork,
	XBULL_ID,
	xBullModule,
} from '@creit.tech/stellar-wallets-kit'
import {
	WalletConnectAllowedMethods,
	WalletConnectModule,
} from '@creit.tech/stellar-wallets-kit/modules/walletconnect.module'
import { type ReactNode, createContext, useContext, useEffect, useState } from 'react'

export interface WalletContextType {
	kit: StellarWalletsKit
	isConnected: boolean
	address: string | null
	isLoading: boolean
	error: Error | null
	connect: () => Promise<void>
	disconnect: () => Promise<void>
	signTransaction: (xdr: string) => Promise<{ signedTxXdr: string; signerAddress?: string }>
}

interface WalletState {
	isConnected: boolean
	address: string | null
	isLoading: boolean
	error: Error | null
}

// Constants
const SELECTED_WALLET_ID = 'selectedWalletId'

function getSelectedWalletId(): string {
	if (typeof window === 'undefined') return XBULL_ID
	return localStorage.getItem(SELECTED_WALLET_ID) ?? XBULL_ID
}

// Create kit instance
const kit = new StellarWalletsKit({
	network: WalletNetwork.TESTNET,
	selectedWalletId: getSelectedWalletId(),
	modules: [
		new xBullModule(),
		new AlbedoModule(),
		new FreighterModule(),
		new RabetModule(),
		new WalletConnectModule({
			url: typeof window !== 'undefined' ? window.location.origin : '',
			projectId: '',
			method: WalletConnectAllowedMethods.SIGN,
			description: 'Harmonia Dapp',
			name: 'Harmonia',
			icons: [],
			network: WalletNetwork.TESTNET,
		}),
		new LobstrModule(),
		new HanaModule(),
		new HotWalletModule(),
	],
})

// Create context
const WalletContext = createContext<WalletContextType | null>(null)

// Provider component
export function WalletProvider({ children }: { children: ReactNode }) {
	const [state, setState] = useState<WalletState>({
		isConnected: false,
		address: null,
		isLoading: false,
		error: null,
	})

	// Initialize wallet state
	useEffect(() => {
		const initializeWallet = async () => {
			try {
				const { address } = await kit.getAddress()
				setState((prev: WalletState) => ({
					...prev,
					address,
					isConnected: true,
				}))
			} catch (_error) {
				// Not connected, which is fine
				setState((prev: WalletState) => ({
					...prev,
					isConnected: false,
				}))
			}
		}

		initializeWallet()
	}, [])

	const connect = async () => {
		setState((prev: WalletState) => ({
			...prev,
			isLoading: true,
			error: null,
		}))
		try {
			await kit.openModal({
				onWalletSelected: async (option) => {
					await kit.setWallet(option.id)
					localStorage.setItem(SELECTED_WALLET_ID, option.id)
					const { address } = await kit.getAddress()
					setState((prev: WalletState) => ({
						...prev,
						address,
						isConnected: true,
						isLoading: false,
					}))
				},
				onClosed: () => {
					setState((prev: WalletState) => ({ ...prev, isLoading: false }))
				},
			})
		} catch (error) {
			setState((prev: WalletState) => ({
				...prev,
				error: error as Error,
				isLoading: false,
			}))
		}
	}

	const disconnect = async () => {
		setState((prev: WalletState) => ({
			...prev,
			isLoading: true,
			error: null,
		}))

		try {
			await kit.disconnect()
			localStorage.removeItem(SELECTED_WALLET_ID)
			setState({
				address: null,
				isConnected: false,
				isLoading: false,
				error: null,
			})
		} catch (error) {
			setState((prev: WalletState) => ({
				...prev,
				error: error as Error,
				isLoading: false,
			}))
		}
	}

	const signTransaction = async (xdr: string) => {
		setState((prev: WalletState) => ({
			...prev,
			isLoading: true,
			error: null,
		}))

		try {
			const result = await kit.signTransaction(xdr)
			setState((prev: WalletState) => ({ ...prev, isLoading: false }))
			return result
		} catch (error) {
			setState((prev: WalletState) => ({
				...prev,
				error: error as Error,
				isLoading: false,
			}))
			throw error
		}
	}

	const value = {
		kit,
		isConnected: state.isConnected,
		address: state.address,
		isLoading: state.isLoading,
		error: state.error,
		connect,
		disconnect,
		signTransaction,
	}

	return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}

// Hook to use wallet context
export function useWallet() {
	const context = useContext(WalletContext)
	if (!context) {
		throw new Error('useWallet must be used within a WalletProvider')
	}
	return context
}
