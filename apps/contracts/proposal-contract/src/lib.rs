#![no_std]

use soroban_sdk::{contract, contractimpl, symbol_short, Address, Env, String, Symbol, Vec};

mod datatypes;
use datatypes::{Proposal, ProposalStatus, ProposalType};

mod errors;
use errors::ProposalError;

mod test;

#[contract]
pub struct ProposalContract;

#[contractimpl]
impl ProposalContract {
    /// Creates a new proposal and stores it in persistent storage.
    /// Requires authentication of the user creating the proposal.
    /// Validates the deadline, title length, and proposal type.
    /// Emits a `proposal_created` event with the generated proposal ID.
    pub fn create_proposal(
        env: Env,
        user: Address,
        title: String,
        description: String,
        deadline: u64,
        proposal_type_symbol: Symbol,
        quorum: Option<u32>,
    ) -> Result<(), ProposalError> {
        user.require_auth();

        let now = env.ledger().timestamp();

        if deadline <= now {
            return Err(ProposalError::InvalidDeadline);
        }

        if title.is_empty() || title.len() > 100 {
            return Err(ProposalError::InvalidTitleLength);
        }

        let proposal_type = match proposal_type_symbol {
            s if s == Symbol::new(&env, "treasury") => ProposalType::Treasury,
            s if s == Symbol::new(&env, "governance") => ProposalType::Governance,
            s if s == Symbol::new(&env, "community") => ProposalType::Community,
            s if s == Symbol::new(&env, "technical") => ProposalType::Technical,
            _ => return Err(ProposalError::InvalidProposalType),
        };

        let id = Self::next_id(&env);

        let proposal = Proposal {
            id,
            title,
            description,
            created_at: now,
            deadline,
            proposal_type,
            status: ProposalStatus::Open,
            for_votes: 0,
            against_votes: 0,
            abstain_votes: 0,
            created_by: user.clone(),
            quorum,
        };

        env.storage().persistent().set(&Self::proposal_key(id), &proposal);
        Self::increment_id(&env);
        env.events().publish((Symbol::new(&env, "proposal_created"),), id);

        Ok(())
    }

    /// Allows a user to vote on a given proposal.
    /// Prevents double voting and ensures the proposal is open and not expired.
    /// Increments the appropriate vote count and stores the vote.
    /// Emits a `vote_cast` event with the proposal ID, user, and vote type.
    pub fn vote(
        env: Env,
        user: Address,
        proposal_id: u32,
        vote_choice: Symbol,
    ) -> Result<(), ProposalError> {
        user.require_auth();

        let vote_key = (symbol_short!("vote"), proposal_id, user.clone());
        if env.storage().persistent().has(&vote_key) {
            return Err(ProposalError::AlreadyVoted);
        }

        let mut proposal: Proposal = env
            .storage()
            .persistent()
            .get(&Self::proposal_key(proposal_id))
            .ok_or(ProposalError::ProposalNotFound)?;

        if proposal.status != ProposalStatus::Open {
            return Err(ProposalError::ProposalNotOpen);
        }

        if env.ledger().timestamp() > proposal.deadline {
            return Err(ProposalError::VotingClosed);
        }

        let vote_choice_clone = vote_choice.clone();

        match vote_choice {
            s if s == symbol_short!("For") => proposal.for_votes += 1,
            s if s == symbol_short!("Against") => proposal.against_votes += 1,
            s if s == symbol_short!("Abstain") => proposal.abstain_votes += 1,
            _ => return Err(ProposalError::InvalidVoteChoice),
        }

        env.storage().persistent().set(&Self::proposal_key(proposal_id), &proposal);
        env.storage().persistent().set(&vote_key, &vote_choice_clone);
        env.events().publish((Symbol::new(&env, "vote_cast"),), (proposal_id, user, vote_choice_clone));

        Ok(())
    }

    /// Finalizes a proposal by setting its status based on vote results and quorum (if defined).
    /// Can only be called after the proposal deadline.
    /// Emits a `proposal_finalized` event with the resulting status.
    pub fn finalize(env: Env, proposal_id: u32) -> Result<(), ProposalError> {
        let mut proposal: Proposal = env
            .storage()
            .persistent()
            .get(&Self::proposal_key(proposal_id))
            .ok_or(ProposalError::ProposalNotFound)?;

        if proposal.status != ProposalStatus::Open {
            return Err(ProposalError::AlreadyFinalized);
        }

        if env.ledger().timestamp() < proposal.deadline {
            return Err(ProposalError::DeadlineNotReached);
        }

        let total_votes = proposal.for_votes + proposal.against_votes + proposal.abstain_votes;
        let effective_votes = proposal.for_votes + proposal.against_votes;

        proposal.status = if let Some(q) = proposal.quorum {
            if total_votes < q {
                ProposalStatus::Closed
            } else if proposal.for_votes > proposal.against_votes && proposal.for_votes > 0 {
                ProposalStatus::Accepted
            } else {
                ProposalStatus::Rejected
            }
        } else if effective_votes == 0 {
            ProposalStatus::Rejected
        } else if proposal.for_votes > proposal.against_votes && proposal.for_votes > 0 {
            ProposalStatus::Accepted
        } else {
            ProposalStatus::Rejected
        };

        env.storage().persistent().set(&Self::proposal_key(proposal_id), &proposal);
        env.events().publish((Symbol::new(&env, "proposal_finalized"),), (proposal_id, Self::status_to_symbol(&proposal.status)));

        Ok(())
    }

    /// Retrieves the vote counts for a given proposal.
    /// Returns a tuple of (for_votes, against_votes, abstain_votes).
    pub fn get_votes(env: Env, proposal_id: u32) -> (u32, u32, u32) {
        let proposal: Proposal = env
            .storage()
            .persistent()
            .get(&Self::proposal_key(proposal_id))
            .unwrap_or_else(|| panic!("Proposal not found"));
        (proposal.for_votes, proposal.against_votes, proposal.abstain_votes)
    }

    /// Retrieves the full proposal object for the given ID.
    pub fn get_proposal(env: Env, proposal_id: u32) -> Proposal {
        env.storage()
            .persistent()
            .get(&Self::proposal_key(proposal_id))
            .unwrap_or_else(|| panic!("Proposal not found"))
    }

    /// Returns all proposals stored in persistent storage.
    /// Iterates from 1 to the current next_id (exclusive) and collects all existing proposals.
    pub fn get_all_proposals(env: Env) -> Vec<Proposal> {
        let mut proposals = Vec::new(&env);
        let next_id = Self::next_id(&env);

        for id in 1..next_id {
            if let Some(proposal) = env.storage().persistent().get::<_, Proposal>(&Self::proposal_key(id)) {
                proposals.push_back(proposal);
            }
        }

        proposals
    }

    /// Returns the next available proposal ID from storage, starting at 1.
    fn next_id(env: &Env) -> u32 {
        env.storage()
            .persistent()
            .get(&symbol_short!("next_id"))
            .unwrap_or(Some(1))
            .unwrap()
    }

    /// Increments the proposal ID counter in persistent storage.
    fn increment_id(env: &Env) {
        let id = Self::next_id(env) + 1;
        env.storage().persistent().set(&symbol_short!("next_id"), &id);
    }

    /// Internal helper to create the key used to store/retrieve a proposal.
    fn proposal_key(id: u32) -> (Symbol, u32) {
        (symbol_short!("proposal"), id)
    }

    /// Converts a ProposalStatus enum to its corresponding Symbol for event emission.
    fn status_to_symbol(status: &ProposalStatus) -> Symbol {
        match status {
            ProposalStatus::Open => symbol_short!("open"),
            ProposalStatus::Closed => symbol_short!("closed"),
            ProposalStatus::Accepted => symbol_short!("accepted"),
            ProposalStatus::Rejected => symbol_short!("rejected"),
        }
    }
}
