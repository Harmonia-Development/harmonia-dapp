use soroban_sdk::{contracterror, contracttype, Address, Symbol, Vec};

#[derive(Clone, Debug)]
#[contracttype]
pub struct VotingNFT {
    pub token_id: Symbol,
    pub category: Category,
    pub metadata: Symbol, // Stores additional info, e.g., "multiplier:2"
    pub owner: Address,
    pub issued_at: u64,
}

#[derive(Copy, Clone, Eq, PartialEq, Debug)]
#[repr(u32)]
#[contracttype]
pub enum Category {
    Participation = 1, // For voting in proposals
    Referral = 2,      // For referring members
    Governance = 3,    // For other governance milestones
}

#[contracttype]
pub enum DataKey {
    NFT(Symbol),      // Stores VotingNFT by token_id
    OwnedBy(Address), // Stores Vec<Symbol> of token_ids for an owner
    Config,           // Stores contract configuration
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum VotingNFTError {
    Unauthorized = 1,       // Caller not allowed to mint or modify
    NFTNotFound = 2,        // Requested NFT does not exist
    DuplicateNFT = 3,       // NFT for category already exists for owner
    NFTExpired = 4,         // NFT has expired
    AlreadyInitialized = 5, // Contract already initialized
    InvalidMetadata = 6,    // Invalid metadata format
}

#[derive(Clone, Debug)]
#[contracttype]
pub struct Config {
    pub admin: Address,                // Admin for managing allowed minters
    pub allowed_minters: Vec<Address>, // DAO contracts allowed to mint NFTs
}
