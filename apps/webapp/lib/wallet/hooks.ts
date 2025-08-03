import { useWalletContext } from '@/hooks/context/useWalletContext'
import { kit } from '@/lib/constants/wallet.constants'
import { WalletNetwork } from '@creit.tech/stellar-wallets-kit'
import { useCallback, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { formatAddress, validateAddress } from './utils'

/**
 * Hook for wallet connection and disconnection
 */
export function useWalletConnection() {
	const walletContext = useWalletContext()
	const [isConnecting, setIsConnecting] = useState(false)

	// Direct wallet connection without using kit's modal
	const connectWallet = useCallback(
		async (walletId: string) => {
			try {
				setIsConnecting(true)
				walletContext.setError(null)

				await kit.setWallet(walletId)

				const { address } = await kit.getAddress()

				if (!validateAddress(address)) {
					throw new Error('Invalid wallet address received')
				}

				const walletName = getWalletDisplayName(walletId)
				walletContext.connect(address, walletName, walletId)
				setIsConnecting(false)
				toast.success(`Connected to ${walletName}`)
				return { success: true, address }
			} catch (error: unknown) {
				const errorMessage = (error as Error)?.message || 'Error connecting wallet'
				walletContext.setError(errorMessage)
				console.error('Error connecting wallet:', error)
				setIsConnecting(false)
				toast.error(errorMessage)
				return { success: false, error: errorMessage }
			}
		},
		[walletContext],
	)

	const connect = useCallback(async () => {
		try {
			setIsConnecting(true)
			walletContext.setError(null)

			return new Promise<{
				success: boolean
				address?: string
				error?: string
			}>((resolve) => {
				kit.openModal({
					modalTitle: 'Connect Stellar Wallet',
					notAvailableText: 'Wallet not available',
					onWalletSelected: async (option) => {
						try {
							await kit.setWallet(option.id)

							const { address } = await kit.getAddress()

							if (!validateAddress(address)) {
								throw new Error('Invalid wallet address received')
							}

							const walletName = option.name || 'Unknown Wallet'
							walletContext.connect(address, walletName, option.id)
							setIsConnecting(false)
							toast.success(`Connected to ${walletName}`)
							resolve({ success: true, address })
						} catch (error) {
							const errorMessage = (error as Error)?.message || 'Error connecting wallet'
							walletContext.setError(errorMessage)
							console.error('Error connecting wallet:', error)
							setIsConnecting(false)
							toast.error(errorMessage)
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
								walletContext.setError(err.message)
								console.error('Modal closed with error:', err)
								toast.error(`Error connecting wallet: ${err.message}`)
								resolve({ success: false, error: err.message })
							}
						} else {
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
			walletContext.setError(errorMessage)
			console.error('Error opening wallet modal:', error)
			setIsConnecting(false)
			toast.error(errorMessage)
			return { success: false, error: errorMessage }
		}
	}, [walletContext])

	const disconnect = useCallback(async () => {
		try {
			walletContext.setError(null)
			await kit.disconnect()
			walletContext.disconnect()
			toast.success('Wallet disconnected')
			return { success: true }
		} catch (error: unknown) {
			const errorMessage = (error as Error)?.message || 'Error disconnecting wallet'
			walletContext.setError(errorMessage)
			console.error('Error disconnecting wallet:', error)
			toast.error(errorMessage)
			return { success: false, error: errorMessage }
		}
	}, [walletContext])

	const switchNetwork = useCallback(
		async (network: WalletNetwork) => {
			try {
				walletContext.setError(null)
				walletContext.setNetwork(network)

				// Update the kit network setting
				// Note: The kit doesn't have a setNetwork method, so we handle this through context
				// The kit will use the network from its initialization

				toast.success(`Switched to ${network === WalletNetwork.PUBLIC ? 'Mainnet' : 'Testnet'}`)
				return { success: true }
			} catch (error: unknown) {
				const errorMessage = (error as Error)?.message || 'Error switching network'
				walletContext.setError(errorMessage)
				console.error('Error switching network:', error)
				toast.error(errorMessage)
				return { success: false, error: errorMessage }
			}
		},
		[walletContext],
	)

	const returnValue = useMemo(
		() => ({
			connect,
			connectWallet,
			disconnect,
			switchNetwork,
			isConnecting,
			isConnected: walletContext.connected,
			walletAddress: walletContext.address,
			walletName: walletContext.name,
			selectedWalletId: walletContext.selectedWalletId,
			network: walletContext.network,
			error: walletContext.error,
		}),
		[
			connect,
			connectWallet,
			disconnect,
			switchNetwork,
			isConnecting,
			walletContext.connected,
			walletContext.address,
			walletContext.name,
			walletContext.selectedWalletId,
			walletContext.network,
			walletContext.error,
		],
	)

	return returnValue
}

/**
 * Hook for wallet actions (signing transactions)
 */
export function useWalletActions() {
	const walletContext = useWalletContext()
	const [isSigning, setIsSigning] = useState(false)

	const signTransaction = useCallback(
		async (xdr: string) => {
			try {
				setIsSigning(true)
				walletContext.setError(null)

				if (!walletContext.address) {
					throw new Error('No wallet connected')
				}

				if (!validateAddress(walletContext.address)) {
					throw new Error('Invalid wallet address')
				}

				// Use the proper kit API for signing transactions
				const { signedTxXdr } = await kit.signTransaction(xdr, {
					address: walletContext.address,
					networkPassphrase: walletContext.network,
				})

				setIsSigning(false)
				toast.success('Transaction signed successfully')
				return { success: true, signedTxXdr }
			} catch (error: unknown) {
				const errorMessage = (error as Error)?.message || 'Error signing transaction'
				walletContext.setError(errorMessage)
				console.error('Error signing transaction:', error)
				setIsSigning(false)
				toast.error(errorMessage)
				return { success: false, error: errorMessage }
			}
		},
		[walletContext],
	)

	const getAddress = useCallback(async () => {
		try {
			walletContext.setError(null)

			if (!walletContext.address) {
				throw new Error('No wallet connected')
			}

			// Use the proper kit API to get fresh address
			const { address } = await kit.getAddress()

			if (!validateAddress(address)) {
				throw new Error('Invalid address received from wallet')
			}

			return { success: true, address }
		} catch (error: unknown) {
			const errorMessage = (error as Error)?.message || 'Error getting address'
			walletContext.setError(errorMessage)
			console.error('Error getting address:', error)
			toast.error(errorMessage)
			return { success: false, error: errorMessage }
		}
	}, [walletContext])

	// Memoize the return object to prevent unnecessary re-renders
	const returnValue = useMemo(
		() => ({
			signTransaction,
			getAddress,
			isSigning,
			formattedAddress: walletContext.address ? formatAddress(walletContext.address) : null,
		}),
		[signTransaction, getAddress, isSigning, walletContext.address],
	)

	return returnValue
}

// Helper function to get wallet display name
function getWalletDisplayName(walletId: string): string {
	const walletNames: Record<string, string> = {
		freighter: 'Freighter',
		xbull: 'xBull',
		lobstr: 'Lobstr',
		hot: 'Hot Wallet',
		albedo: 'Albedo',
		rabet: 'Rabet',
		walletconnect: 'WalletConnect',
	}

	return walletNames[walletId.toLowerCase()] || 'Unknown Wallet'
}
