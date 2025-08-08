'use client'

import { type Proposal, createProposalContract } from '@/lib/contracts/proposal-contract'
import { useCallback } from 'react'
import { toast } from 'sonner'
import { useSorobanContract } from './useSorobanContract'

export interface UseProposalReturn {
	state: ReturnType<typeof useSorobanContract>['state']

	// Contract actions
	createProposal: (
		title: string,
		description: string,
		deadline: bigint,
		type: string,
		quorum?: number | null,
	) => Promise<boolean>

	castVote: (proposalId: number, choice: 'For' | 'Against' | 'Abstain') => Promise<boolean>
	finalizeProposal: (proposalId: number) => Promise<boolean>
	getProposal: (proposalId: number) => Promise<Proposal | null>
	getVotes: (proposalId: number) => Promise<[number, number, number]>
	getAllProposals: () => Promise<Proposal[]>

	// Util
	isConnected: boolean
	walletAddress: string | null
}

export function useProposal(): UseProposalReturn {
	const { state, contract, isConnected, walletAddress, executeContract, readContract } =
		useSorobanContract(createProposalContract)

	// Log a helpful message when contract is not available in development
	if (!contract && process.env.NODE_ENV === 'development') {
		console.log('Proposal contract not available. Using mock data for development.')
	}

	const createProposal = useCallback(
		async (
			title: string,
			description: string,
			deadline: bigint,
			type: string,
			quorum: number | null = null,
		): Promise<boolean> => {
			if (!title.trim() || !description.trim() || !contract) {
				return false
			}

			if (!walletAddress) {
				toast.error('Wallet not connected')
				return false
			}

			const result = await executeContract(
				() =>
					contract.createProposal(
						walletAddress,
						title.trim(),
						description.trim(),
						deadline,
						type,
						quorum,
					),
				{
					successMessage: 'Proposal created successfully!',
					errorMessage: 'Failed to create proposal',
				},
			)

			return result !== null
		},
		[contract, walletAddress, executeContract],
	)

	const castVote = useCallback(
		async (proposalId: number, choice: 'For' | 'Against' | 'Abstain'): Promise<boolean> => {
			if (!contract) return false

			if (!walletAddress) {
				toast.error('Wallet not connected')
				return false
			}

			const result = await executeContract(() => contract.vote(walletAddress, proposalId, choice), {
				successMessage: 'Vote cast successfully!',
				errorMessage: 'Failed to cast vote',
			})

			return result !== null
		},
		[contract, walletAddress, executeContract],
	)

	const finalizeProposal = useCallback(
		async (proposalId: number): Promise<boolean> => {
			if (!contract) return false

			const result = await executeContract(() => contract.finalize(proposalId), {
				successMessage: 'Proposal finalized!',
				errorMessage: 'Failed to finalize proposal',
			})

			return result !== null
		},
		[contract, executeContract],
	)

	const getVotes = useCallback(
		async (proposalId: number): Promise<[number, number, number]> => {
			if (!contract) return [0, 0, 0]
			return await readContract(() => contract.getVotes(proposalId), [0, 0, 0])
		},
		[contract, readContract],
	)

	const getProposal = useCallback(
		async (proposalId: number): Promise<Proposal | null> => {
			if (!contract) return null
			return await readContract(() => contract.getProposal(proposalId), null)
		},
		[contract, readContract],
	)

	const getAllProposals = useCallback(async (): Promise<Proposal[]> => {
		if (!contract) return []
		return await readContract(() => contract.getAllProposals(), [])
	}, [contract, readContract])

	return {
		state,
		createProposal,
		castVote,
		finalizeProposal,
		getProposal,
		getVotes,
		getAllProposals,
		isConnected,
		walletAddress,
	}
}
