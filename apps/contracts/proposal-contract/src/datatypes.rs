use soroban_sdk::{contracttype, Address, String};

#[derive(Clone)]
#[contracttype]
pub enum ProposalType {
    Treasury,
    Governance,
    Community,
    Technical
}

#[derive(Clone, PartialEq)]
#[contracttype]
pub enum ProposalStatus {
    Open,
    Closed,
    Accepted,
    Rejected,
}

#[derive(Clone)]
#[contracttype]
pub struct Proposal {
    pub id: u32,
    pub title: String,
    pub description: String,
    pub created_at: u64,
    pub deadline: u64,
    pub proposal_type: ProposalType,
    pub status: ProposalStatus,
    pub for_votes: u32,
    pub against_votes: u32,
    pub abstain_votes: u32,
    pub created_by: Address,
    pub quorum: Option<u32>,
}
