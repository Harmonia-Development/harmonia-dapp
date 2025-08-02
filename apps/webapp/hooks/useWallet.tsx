'use client'

import { useWalletActions, useWalletConnection } from '@/lib/wallet/hooks'

/**
 * Enhanced wallet hook that combines connection and action functionality
 * Maintains backward compatibility with existing code
 */
export const useWallet = () => {
	const connection = useWalletConnection()
	const actions = useWalletActions()

	return {
		// Connection methods (backward compatible)
		connectWallet: connection.connect,
		disconnectWallet: connection.disconnect,
		isConnecting: connection.isConnecting,
		isConnected: connection.isConnected,
		walletAddress: connection.walletAddress,
		walletName: connection.walletName,
		error: connection.error,

		// Action methods
		signTransaction: actions.signTransaction,
		getAddress: actions.getAddress,
		isSigning: actions.isSigning,
		formattedAddress: actions.formattedAddress,

		// Enhanced features
		network: connection.network,
		selectedWalletId: connection.selectedWalletId,
		switchNetwork: connection.switchNetwork,

		// Legacy compatibility
		freighterAvailable: true, // Assume Freighter is available since we're using the kit
	}
}
