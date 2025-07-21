/* eslint-disable */
// biome-ignore lint/style/useNodejsImportProtocol: Buffer needs to work in both Node.js and browser environments
import { Buffer } from 'buffer'
import {
	type AssembledTransaction,
	Client as ContractClient,
	type ClientOptions as ContractClientOptions,
	Spec as ContractSpec,
	type MethodOptions,
	type Result,
} from '@stellar/stellar-sdk/contract'
import type { Option, u32, u64 } from '@stellar/stellar-sdk/contract'
export * from '@stellar/stellar-sdk'
export * as contract from '@stellar/stellar-sdk/contract'
export * as rpc from '@stellar/stellar-sdk/rpc'

if (typeof window !== 'undefined') {
	//@ts-ignore Buffer exists
	window.Buffer = window.Buffer || Buffer
}

export const networks = {
	testnet: {
		networkPassphrase: 'Test SDF Network ; September 2015',
		contractId: 'CDMXLZ5626PNGNCIYWK5OQ6YSU3FYSIOET6TIZULVDCFVKR7GLHJBRXA',
	},
} as const

export type ProposalType =
	| { tag: 'Treasury'; values: null }
	| { tag: 'Governance'; values: null }
	| { tag: 'Community'; values: null }
	| { tag: 'Technical'; values: null }

export type ProposalStatus =
	| { tag: 'Open'; values: null }
	| { tag: 'Closed'; values: null }
	| { tag: 'Accepted'; values: null }
	| { tag: 'Rejected'; values: null }

export interface Proposal {
	abstain_votes: u32
	against_votes: u32
	created_at: u64
	created_by: string
	deadline: u64
	description: string
	for_votes: u32
	id: u32
	proposal_type: ProposalType
	quorum: Option<u32>
	status: ProposalStatus
	title: string
}

export const ProposalError = {
	1: { message: 'InvalidDeadline' },
	2: { message: 'InvalidTitleLength' },
	3: { message: 'InvalidProposalType' },
	4: { message: 'AlreadyVoted' },
	5: { message: 'ProposalNotFound' },
	6: { message: 'ProposalNotOpen' },
	7: { message: 'VotingClosed' },
	8: { message: 'InvalidVoteChoice' },
	9: { message: 'AlreadyFinalized' },
	10: { message: 'DeadlineNotReached' },
}

export interface Client {
	/**
	 * Construct and simulate a create_proposal transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
	 * Creates a new proposal and stores it in persistent storage.
	 * Requires authentication of the user creating the proposal.
	 * Validates the deadline, title length, and proposal type.
	 * Emits a `proposal_created` event with the generated proposal ID.
	 */
	create_proposal: (
		{
			user,
			title,
			description,
			deadline,
			proposal_type_symbol,
			quorum,
		}: {
			user: string
			title: string
			description: string
			deadline: u64
			proposal_type_symbol: string
			quorum: Option<u32>
		},
		options?: {
			/**
			 * The fee to pay for the transaction. Default: BASE_FEE
			 */
			fee?: number

			/**
			 * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
			 */
			timeoutInSeconds?: number

			/**
			 * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
			 */
			simulate?: boolean
		},
	) => Promise<AssembledTransaction<Result<void>>>

	/**
	 * Construct and simulate a vote transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
	 * Allows a user to vote on a given proposal.
	 * Prevents double voting and ensures the proposal is open and not expired.
	 * Increments the appropriate vote count and stores the vote.
	 * Emits a `vote_cast` event with the proposal ID, user, and vote type.
	 */
	vote: (
		{ user, proposal_id, vote_choice }: { user: string; proposal_id: u32; vote_choice: string },
		options?: {
			/**
			 * The fee to pay for the transaction. Default: BASE_FEE
			 */
			fee?: number

			/**
			 * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
			 */
			timeoutInSeconds?: number

			/**
			 * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
			 */
			simulate?: boolean
		},
	) => Promise<AssembledTransaction<Result<void>>>

	/**
	 * Construct and simulate a finalize transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
	 * Finalizes a proposal by setting its status based on vote results and quorum (if defined).
	 * Can only be called after the proposal deadline.
	 * Emits a `proposal_finalized` event with the resulting status.
	 */
	finalize: (
		{ proposal_id }: { proposal_id: u32 },
		options?: {
			/**
			 * The fee to pay for the transaction. Default: BASE_FEE
			 */
			fee?: number

			/**
			 * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
			 */
			timeoutInSeconds?: number

			/**
			 * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
			 */
			simulate?: boolean
		},
	) => Promise<AssembledTransaction<Result<void>>>

	/**
	 * Construct and simulate a get_votes transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
	 * Retrieves the vote counts for a given proposal.
	 * Returns a tuple of (for_votes, against_votes, abstain_votes).
	 */
	get_votes: (
		{ proposal_id }: { proposal_id: u32 },
		options?: {
			/**
			 * The fee to pay for the transaction. Default: BASE_FEE
			 */
			fee?: number

			/**
			 * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
			 */
			timeoutInSeconds?: number

			/**
			 * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
			 */
			simulate?: boolean
		},
	) => Promise<AssembledTransaction<readonly [u32, u32, u32]>>

	/**
	 * Construct and simulate a get_proposal transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
	 * Retrieves the full proposal object for the given ID.
	 */
	get_proposal: (
		{ proposal_id }: { proposal_id: u32 },
		options?: {
			/**
			 * The fee to pay for the transaction. Default: BASE_FEE
			 */
			fee?: number

			/**
			 * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
			 */
			timeoutInSeconds?: number

			/**
			 * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
			 */
			simulate?: boolean
		},
	) => Promise<AssembledTransaction<Proposal>>

	/**
	 * Construct and simulate a get_all_proposals transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
	 * Returns all proposals stored in persistent storage.
	 * Iterates from 1 to the current next_id (exclusive) and collects all existing proposals.
	 */
	get_all_proposals: (options?: {
		/**
		 * The fee to pay for the transaction. Default: BASE_FEE
		 */
		fee?: number

		/**
		 * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
		 */
		timeoutInSeconds?: number

		/**
		 * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
		 */
		simulate?: boolean
	}) => Promise<AssembledTransaction<Array<Proposal>>>
}
// biome-ignore lint/suspicious/noUnsafeDeclarationMerging: intentional merging of interface and class Client for typing purposes
export class Client extends ContractClient {
	static async deploy<T = Client>(
		/** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
		options: MethodOptions &
			Omit<ContractClientOptions, 'contractId'> & {
				/** The hash of the Wasm blob, which must already be installed on-chain. */
				wasmHash: Buffer | string
				/** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
				salt?: Buffer | Uint8Array
				/** The format used to decode `wasmHash`, if it's provided as a string. */
				format?: 'hex' | 'base64'
			},
	): Promise<AssembledTransaction<T>> {
		return ContractClient.deploy(null, options)
	}
	constructor(public readonly options: ContractClientOptions) {
		super(
			new ContractSpec([
				'AAAAAgAAAAAAAAAAAAAADFByb3Bvc2FsVHlwZQAAAAQAAAAAAAAAAAAAAAhUcmVhc3VyeQAAAAAAAAAAAAAACkdvdmVybmFuY2UAAAAAAAAAAAAAAAAACUNvbW11bml0eQAAAAAAAAAAAAAAAAAACVRlY2huaWNhbAAAAA==',
				'AAAAAgAAAAAAAAAAAAAADlByb3Bvc2FsU3RhdHVzAAAAAAAEAAAAAAAAAAAAAAAET3BlbgAAAAAAAAAAAAAABkNsb3NlZAAAAAAAAAAAAAAAAAAIQWNjZXB0ZWQAAAAAAAAAAAAAAAhSZWplY3RlZA==',
				'AAAAAQAAAAAAAAAAAAAACFByb3Bvc2FsAAAADAAAAAAAAAANYWJzdGFpbl92b3RlcwAAAAAAAAQAAAAAAAAADWFnYWluc3Rfdm90ZXMAAAAAAAAEAAAAAAAAAApjcmVhdGVkX2F0AAAAAAAGAAAAAAAAAApjcmVhdGVkX2J5AAAAAAATAAAAAAAAAAhkZWFkbGluZQAAAAYAAAAAAAAAC2Rlc2NyaXB0aW9uAAAAABAAAAAAAAAACWZvcl92b3RlcwAAAAAAAAQAAAAAAAAAAmlkAAAAAAAEAAAAAAAAAA1wcm9wb3NhbF90eXBlAAAAAAAH0AAAAAxQcm9wb3NhbFR5cGUAAAAAAAAABnF1b3J1bQAAAAAD6AAAAAQAAAAAAAAABnN0YXR1cwAAAAAH0AAAAA5Qcm9wb3NhbFN0YXR1cwAAAAAAAAAAAAV0aXRsZQAAAAAAABA=',
				'AAAABAAAAAAAAAAAAAAADVByb3Bvc2FsRXJyb3IAAAAAAAAKAAAAAAAAAA9JbnZhbGlkRGVhZGxpbmUAAAAAAQAAAAAAAAASSW52YWxpZFRpdGxlTGVuZ3RoAAAAAAACAAAAAAAAABNJbnZhbGlkUHJvcG9zYWxUeXBlAAAAAAMAAAAAAAAADEFscmVhZHlWb3RlZAAAAAQAAAAAAAAAEFByb3Bvc2FsTm90Rm91bmQAAAAFAAAAAAAAAA9Qcm9wb3NhbE5vdE9wZW4AAAAABgAAAAAAAAAMVm90aW5nQ2xvc2VkAAAABwAAAAAAAAARSW52YWxpZFZvdGVDaG9pY2UAAAAAAAAIAAAAAAAAABBBbHJlYWR5RmluYWxpemVkAAAACQAAAAAAAAASRGVhZGxpbmVOb3RSZWFjaGVkAAAAAAAK',
				'AAAAAAAAAPBDcmVhdGVzIGEgbmV3IHByb3Bvc2FsIGFuZCBzdG9yZXMgaXQgaW4gcGVyc2lzdGVudCBzdG9yYWdlLgpSZXF1aXJlcyBhdXRoZW50aWNhdGlvbiBvZiB0aGUgdXNlciBjcmVhdGluZyB0aGUgcHJvcG9zYWwuClZhbGlkYXRlcyB0aGUgZGVhZGxpbmUsIHRpdGxlIGxlbmd0aCwgYW5kIHByb3Bvc2FsIHR5cGUuCkVtaXRzIGEgYHByb3Bvc2FsX2NyZWF0ZWRgIGV2ZW50IHdpdGggdGhlIGdlbmVyYXRlZCBwcm9wb3NhbCBJRC4AAAAPY3JlYXRlX3Byb3Bvc2FsAAAAAAYAAAAAAAAABHVzZXIAAAATAAAAAAAAAAV0aXRsZQAAAAAAABAAAAAAAAAAC2Rlc2NyaXB0aW9uAAAAABAAAAAAAAAACGRlYWRsaW5lAAAABgAAAAAAAAAUcHJvcG9zYWxfdHlwZV9zeW1ib2wAAAARAAAAAAAAAAZxdW9ydW0AAAAAA+gAAAAEAAAAAQAAA+kAAAPtAAAAAAAAB9AAAAANUHJvcG9zYWxFcnJvcgAAAA==',
				'AAAAAAAAAPNBbGxvd3MgYSB1c2VyIHRvIHZvdGUgb24gYSBnaXZlbiBwcm9wb3NhbC4KUHJldmVudHMgZG91YmxlIHZvdGluZyBhbmQgZW5zdXJlcyB0aGUgcHJvcG9zYWwgaXMgb3BlbiBhbmQgbm90IGV4cGlyZWQuCkluY3JlbWVudHMgdGhlIGFwcHJvcHJpYXRlIHZvdGUgY291bnQgYW5kIHN0b3JlcyB0aGUgdm90ZS4KRW1pdHMgYSBgdm90ZV9jYXN0YCBldmVudCB3aXRoIHRoZSBwcm9wb3NhbCBJRCwgdXNlciwgYW5kIHZvdGUgdHlwZS4AAAAABHZvdGUAAAADAAAAAAAAAAR1c2VyAAAAEwAAAAAAAAALcHJvcG9zYWxfaWQAAAAABAAAAAAAAAALdm90ZV9jaG9pY2UAAAAAEQAAAAEAAAPpAAAD7QAAAAAAAAfQAAAADVByb3Bvc2FsRXJyb3IAAAA=',
				'AAAAAAAAAMdGaW5hbGl6ZXMgYSBwcm9wb3NhbCBieSBzZXR0aW5nIGl0cyBzdGF0dXMgYmFzZWQgb24gdm90ZSByZXN1bHRzIGFuZCBxdW9ydW0gKGlmIGRlZmluZWQpLgpDYW4gb25seSBiZSBjYWxsZWQgYWZ0ZXIgdGhlIHByb3Bvc2FsIGRlYWRsaW5lLgpFbWl0cyBhIGBwcm9wb3NhbF9maW5hbGl6ZWRgIGV2ZW50IHdpdGggdGhlIHJlc3VsdGluZyBzdGF0dXMuAAAAAAhmaW5hbGl6ZQAAAAEAAAAAAAAAC3Byb3Bvc2FsX2lkAAAAAAQAAAABAAAD6QAAA+0AAAAAAAAH0AAAAA1Qcm9wb3NhbEVycm9yAAAA',
				'AAAAAAAAAG1SZXRyaWV2ZXMgdGhlIHZvdGUgY291bnRzIGZvciBhIGdpdmVuIHByb3Bvc2FsLgpSZXR1cm5zIGEgdHVwbGUgb2YgKGZvcl92b3RlcywgYWdhaW5zdF92b3RlcywgYWJzdGFpbl92b3RlcykuAAAAAAAACWdldF92b3RlcwAAAAAAAAEAAAAAAAAAC3Byb3Bvc2FsX2lkAAAAAAQAAAABAAAD7QAAAAMAAAAEAAAABAAAAAQ=',
				'AAAAAAAAADRSZXRyaWV2ZXMgdGhlIGZ1bGwgcHJvcG9zYWwgb2JqZWN0IGZvciB0aGUgZ2l2ZW4gSUQuAAAADGdldF9wcm9wb3NhbAAAAAEAAAAAAAAAC3Byb3Bvc2FsX2lkAAAAAAQAAAABAAAH0AAAAAhQcm9wb3NhbA==',
				'AAAAAAAAAItSZXR1cm5zIGFsbCBwcm9wb3NhbHMgc3RvcmVkIGluIHBlcnNpc3RlbnQgc3RvcmFnZS4KSXRlcmF0ZXMgZnJvbSAxIHRvIHRoZSBjdXJyZW50IG5leHRfaWQgKGV4Y2x1c2l2ZSkgYW5kIGNvbGxlY3RzIGFsbCBleGlzdGluZyBwcm9wb3NhbHMuAAAAABFnZXRfYWxsX3Byb3Bvc2FscwAAAAAAAAAAAAABAAAD6gAAB9AAAAAIUHJvcG9zYWw=',
			]),
			options,
		)
	}
	public readonly fromJSON = {
		create_proposal: this.txFromJSON<Result<void>>,
		vote: this.txFromJSON<Result<void>>,
		finalize: this.txFromJSON<Result<void>>,
		get_votes: this.txFromJSON<readonly [u32, u32, u32]>,
		get_proposal: this.txFromJSON<Proposal>,
		get_all_proposals: this.txFromJSON<Array<Proposal>>,
	}
}
