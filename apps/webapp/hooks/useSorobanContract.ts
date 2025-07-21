'use client'

import { useCallback, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useWallet } from './useWallet'

/**
 * Represents the current state of the contract execution.
 */
export interface SorobanContractState {
	loading: boolean
	error: string | null
	success: boolean
}

/**
 * Options to control toast visibility and custom messages during execution.
 */
export interface SorobanContractOptions {
	showSuccessToast?: boolean
	showErrorToast?: boolean
	successMessage?: string
	errorMessage?: string
}

/**
 * Return type of the useSorobanContract hook.
 */
export interface UseSorobanContractReturn<T> {
	state: SorobanContractState
	contract: T | null
	isConnected: boolean
	walletAddress: string | null

	/**
	 * Executes a contract method that sends a transaction.
	 * @param contractMethod - A function that returns a `signAndSend` method for the contract.
	 * @param options - Optional configuration for toast notifications and messages.
	 * @returns The result of the contract execution or null if it failed.
	 */
	executeContract: <R>(
		contractMethod: () => Promise<{
			signAndSend: () => Promise<{ result: R }>
		}>,
		options?: SorobanContractOptions,
	) => Promise<R | null>

	/**
	 * Executes a read-only contract method.
	 * @param contractMethod - A function that returns a read-only contract result.
	 * @param defaultValue - A fallback value if the read fails.
	 * @returns The result of the contract read or the default value if it fails.
	 */
	readContract: <R>(contractMethod: () => Promise<R>, defaultValue: R) => Promise<R>

	/**
	 * Updates the internal contract state.
	 * @param updates - Partial state to be merged.
	 */
	updateState: (updates: Partial<SorobanContractState>) => void

	/**
	 * Resets the contract state to its initial values.
	 */
	resetState: () => void
}

/**
 * Hook to manage Soroban contract interaction with signing support and wallet integration.
 *
 * @template T The type of the contract instance.
 * @param contractFactory A factory function that returns a contract instance or null.
 * @returns An object containing state, contract instance, and utility methods.
 */
export function useSorobanContract<T>(
	contractFactory: () => T | null,
): UseSorobanContractReturn<T> {
	const [state, setState] = useState<SorobanContractState>({
		loading: false,
		error: null,
		success: false,
	})

	const { isConnected, walletAddress, signTransaction } = useWallet()

	/**
	 * Lazily instantiate the contract once using the provided factory.
	 */
	const contract = useMemo(() => {
		try {
			return contractFactory()
		} catch (error) {
			console.error('Failed to create contract instance:', error)
			return null
		}
	}, [contractFactory])

	const updateState = useCallback((updates: Partial<SorobanContractState>) => {
		setState((prev) => ({ ...prev, ...updates }))
	}, [])

	const resetState = useCallback(() => {
		setState({
			loading: false,
			error: null,
			success: false,
		})
	}, [])

	/**
	 * Handles an error and updates the state.
	 * @param error - The error thrown.
	 * @param customMessage - Optional fallback message.
	 * @returns Always returns null.
	 */
	const handleError = useCallback(
		(error: unknown, customMessage?: string) => {
			const errorMessage =
				error instanceof Error ? error.message : customMessage || 'An error occurred'
			updateState({ error: errorMessage, loading: false, success: false })
			return null
		},
		[updateState],
	)

	/**
	 * Injects wallet data and signing logic into the contract instance.
	 * @param contractInstance - The contract to configure.
	 * @returns True if configuration was successful, false otherwise.
	 */
	const configureContractSigning = useCallback(
		// biome-ignore lint/suspicious/noExplicitAny: using `any` here to support dynamically generated contract instances
		(contractInstance: any): boolean => {
			if (!contractInstance?.client || !walletAddress) return false

			contractInstance.client.options.publicKey = walletAddress
			contractInstance.client.options.signTransaction = async (xdr: string) => {
				console.log('Contract client calling signTransaction with XDR:', xdr)

				try {
					const signResult = await signTransaction(xdr)
					console.log('Wallet sign result:', signResult)

					if (!signResult.success) {
						throw new Error(signResult.error || 'Failed to sign transaction')
					}

					return {
						signedTxXdr: signResult.signedTxXdr,
						signerAddress: walletAddress,
					}
				} catch (error) {
					console.error('Error in signTransaction:', error)
					throw error
				}
			}

			return true
		},
		[walletAddress, signTransaction],
	)

	const executeContract = useCallback(
		async <R>(
			contractMethod: () => Promise<{
				signAndSend: () => Promise<{ result: R }>
			}>,
			options: SorobanContractOptions = {},
		): Promise<R | null> => {
			const {
				showSuccessToast = true,
				showErrorToast = true,
				successMessage = 'Transaction completed successfully!',
				errorMessage = 'Transaction failed',
			} = options

			if (!isConnected || !walletAddress || !contract) {
				const error = 'Wallet not connected or contract not available'
				if (showErrorToast) toast.error(error)
				return handleError(new Error(error))
			}

			if (!configureContractSigning(contract)) {
				const error = 'Failed to configure contract signing'
				if (showErrorToast) toast.error(error)
				return handleError(new Error(error))
			}

			updateState({ loading: true, error: null, success: false })

			try {
				console.log('Executing contract method...')
				const tx = await contractMethod()
				console.log('Transaction created:', tx)

				console.log('Signing and sending transaction...')
				const { result } = await tx.signAndSend()
				console.log('Transaction result:', result)

				if (result !== undefined) {
					updateState({ loading: false, success: true })
					if (showSuccessToast) toast.success(successMessage)
					return result
				}

				throw new Error('Transaction failed - no result returned')
			} catch (error) {
				console.error('Error in executeContract:', error)
				if (showErrorToast) toast.error(errorMessage)
				return handleError(error, errorMessage)
			}
		},
		[isConnected, walletAddress, contract, configureContractSigning, updateState, handleError],
	)

	const readContract = useCallback(
		async <R>(contractMethod: () => Promise<R>, defaultValue: R): Promise<R> => {
			if (!contract) return defaultValue

			try {
				return await contractMethod()
			} catch (error) {
				console.error('Error in readContract:', error)
				return defaultValue
			}
		},
		[contract],
	)

	return {
		state,
		contract,
		isConnected,
		walletAddress,
		executeContract,
		readContract,
		updateState,
		resetState,
	}
}
