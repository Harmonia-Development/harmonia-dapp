import { Client, type Proposal } from './src'

export interface ProposalContractConfig {
	contractId: string
	rpcUrl: string
	networkPassphrase: string
}

export class ProposalContract {
	public client: Client

	constructor(config: ProposalContractConfig) {
		this.client = new Client({
			contractId: config.contractId,
			networkPassphrase: config.networkPassphrase,
			rpcUrl: config.rpcUrl,
		})
	}

	async createProposal(
		user: string,
		title: string,
		description: string,
		deadline: bigint,
		proposalType: string,
		quorum: number | null,
	) {
		return await this.client.create_proposal({
			user,
			title,
			description,
			deadline,
			proposal_type_symbol: proposalType,
			quorum: quorum !== null ? quorum : undefined,
		})
	}

	async vote(user: string, proposalId: number, voteChoice: string) {
		return await this.client.vote({
			user,
			proposal_id: proposalId,
			vote_choice: voteChoice,
		})
	}

	async finalize(proposalId: number) {
		return await this.client.finalize({
			proposal_id: proposalId,
		})
	}

	async getVotes(proposalId: number): Promise<[number, number, number]> {
		const tx = await this.client.get_votes({ proposal_id: proposalId })
		const result = await tx.simulate()
		return result.result as [number, number, number]
	}

	async getProposal(proposalId: number) {
		const tx = await this.client.get_proposal({ proposal_id: proposalId })
		const result = await tx.simulate()
		return result.result
	}

	async getAllProposals(): Promise<Proposal[]> {
		const tx = await this.client.get_all_proposals()
		const result = await tx.simulate()
		return result.result
	}
}

export function createProposalContract(): ProposalContract | null {
	const contractId = process.env.NEXT_PUBLIC_CONTRACT_ID_PROPOSAL
	const network = process.env.NEXT_PUBLIC_STELLAR_NETWORK || 'testnet'
	const rpcUrl = process.env.NEXT_PUBLIC_SOROBAN_RPC_URL || 'https://soroban-testnet.stellar.org'

	if (!contractId) {
		// In development, return null instead of throwing an error
		// This allows the app to work with mock data
		if (process.env.NODE_ENV === 'development') {
			console.warn(
				'NEXT_PUBLIC_CONTRACT_ID_PROPOSAL is not configured. Using mock data for development.',
			)
			return null
		}
		throw new Error('NEXT_PUBLIC_CONTRACT_ID_PROPOSAL is not configured')
	}

	const networkPassphrase =
		network === 'mainnet'
			? 'Public Global Stellar Network ; September 2015'
			: 'Test SDF Network ; September 2015'

	return new ProposalContract({
		contractId,
		rpcUrl,
		networkPassphrase,
	})
}
