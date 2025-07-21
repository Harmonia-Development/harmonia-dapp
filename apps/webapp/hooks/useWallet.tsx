'use client'

import { kit } from '@/lib/constants/wallet.constants'
import { type ISupportedWallet, WalletNetwork } from '@creit.tech/stellar-wallets-kit'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useWalletContext } from './context/useWalletContext'

export const useWallet = () => {
	const walletState = useWalletContext()
	const [isConnecting, setIsConnecting] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [freighterAvailable, setFreighterAvailable] = useState(false)

	// Check for Freighter availability on mount and periodically
	useEffect(() => {
		const checkFreighter = () => {
			if (typeof window !== 'undefined') {
				const hasFreighter = !!(
					window.freighterApi ||
					window.freighter ||
					window.stellar?.freighter
				)
				setFreighterAvailable(hasFreighter)
				return hasFreighter
			}
			return false
		}

		// Initial check
		checkFreighter()

		// Check again after a short delay (Freighter might load after page)
		const timeout = setTimeout(checkFreighter, 1000)

		// Set up interval to check periodically
		const interval = setInterval(checkFreighter, 2000)

		return () => {
			clearTimeout(timeout)
			clearInterval(interval)
		}
	}, [])

	const connectWallet = async () => {
		try {
			setIsConnecting(true)
			setError(null)

			return new Promise<{
				success: boolean
				address?: string
				error?: string
			}>((resolve) => {
				kit.openModal({
					modalTitle: 'Connect Stellar Wallet',
					notAvailableText: 'Wallet not available',
					onWalletSelected: async (option: ISupportedWallet) => {
						try {
							kit.setWallet(option.id)
							const { address } = await kit.getAddress()
							const walletName = option.name || 'Unknown Wallet'
							walletState.connect(address, walletName)
							setIsConnecting(false)
							resolve({ success: true, address })
						} catch (error) {
							const errorMessage = (error as Error)?.message || 'Error connecting wallet'
							setError(errorMessage)
							console.error('Error connecting wallet:', error)
							setIsConnecting(false)
							resolve({ success: false, error: errorMessage })
						}
					},
					onClosed: (err) => {
						setIsConnecting(false)
						if (err) {
							if (err.message === 'Modal closed') {
								resolve({
									success: false,
									error: 'User cancelled wallet connection',
								})
							} else {
								setError(err.message)
								console.error('Modal closed with error:', err)
								toast.error(`Error connecting wallet: ${err.message}`)
								resolve({ success: false, error: err.message })
							}
						} else {
							// User closed modal without error
							resolve({
								success: false,
								error: 'User cancelled wallet connection',
							})
						}
					},
				})
			})
		} catch (error: unknown) {
			const errorMessage = (error as Error)?.message || 'Error connecting wallet'
			setError(errorMessage)
			console.error('Error opening wallet modal:', error)
			setIsConnecting(false)
			return { success: false, error: errorMessage }
		}
	}

	const disconnectWallet = async () => {
		try {
			setError(null)
			await kit.disconnect()
			walletState.disconnect()
			return { success: true }
		} catch (error: unknown) {
			const errorMessage = (error as Error)?.message || 'Error disconnecting wallet'
			setError(errorMessage)
			console.error('Error disconnecting wallet:', error)
			return { success: false, error: errorMessage }
		}
	}

	const getFreighterApi = () => {
		if (typeof window === 'undefined') return null

		// Try different possible locations for Freighter API
		return window.freighterApi || window.freighter || window.stellar?.freighter || null
	}

	const signTransaction = async (xdr: string) => {
		try {
			setError(null)

			if (!walletState.address) {
				throw new Error('No wallet connected')
			}

			// Try to get Freighter API
			const freighterApi = getFreighterApi()

			if (freighterApi) {
				try {
					// Use Freighter directly - try different method signatures
					let signedTxXdr: string

					if (freighterApi.signTransaction) {
						// Standard Freighter API
						signedTxXdr = await freighterApi.signTransaction(
							xdr,
							'Test SDF Network ; September 2015',
						)
					} else if (freighterApi.signTx) {
						// Alternative method name
						signedTxXdr = await freighterApi.signTx(xdr, 'Test SDF Network ; September 2015')
					} else {
						throw new Error('Freighter signing method not found')
					}

					return { success: true, signedTxXdr }
				} catch (freighterError) {
					console.error('Freighter signing error:', freighterError)
					// Don't throw here, fall back to kit signing
				}
			}

			// Fallback to kit signing
			try {
				const { signedTxXdr } = await kit.signTransaction(xdr, {
					address: walletState.address,
					networkPassphrase: WalletNetwork.TESTNET,
				})
				return { success: true, signedTxXdr }
			} catch (kitError) {
				console.error('Kit signing error:', kitError)
				throw new Error(
					'Failed to sign transaction. Please ensure your wallet is connected and try again.',
				)
			}
		} catch (error: unknown) {
			const errorMessage = (error as Error)?.message || 'Error signing transaction'
			setError(errorMessage)
			console.error('Error signing transaction:', error)
			return { success: false, error: errorMessage }
		}
	}

	return {
		connectWallet,
		disconnectWallet,
		signTransaction,
		isConnecting,
		error,
		isConnected: walletState.connected,
		walletAddress: walletState.address,
		walletName: walletState.name,
		freighterAvailable, // Expose this for debugging
	}
}

// Declare global types for Freighter (multiple possible locations)
declare global {
	interface Window {
		freighterApi?: {
			isConnected: () => Promise<boolean>
			getPublicKey: () => Promise<string>
			signTransaction: (xdr: string, network?: string) => Promise<string>
			signTx?: (xdr: string, network?: string) => Promise<string>
		}
		freighter?: {
			isConnected: () => Promise<boolean>
			getPublicKey: () => Promise<string>
			signTransaction: (xdr: string, network?: string) => Promise<string>
			signTx?: (xdr: string, network?: string) => Promise<string>
		}
		stellar?: {
			freighter?: {
				isConnected: () => Promise<boolean>
				getPublicKey: () => Promise<string>
				signTransaction: (xdr: string, network?: string) => Promise<string>
				signTx?: (xdr: string, network?: string) => Promise<string>
			}
		}
	}
}
