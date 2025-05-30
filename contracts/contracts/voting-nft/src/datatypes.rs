#![no_std]
use soroban_sdk::{contracterror, contracttype, Address, Symbol};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct VotingNFT {
    pub token_id: u32,
    pub category: Symbol,
    pub metadata: Symbol,
    pub owner: Address,
    pub issued_at: u64,
}

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Admin,
    Nft(u32),
    OwnedBy(Address),
    MintedCategory(Address, Symbol),
}

#[contracterror]
#[derive(Debug, Clone, PartialEq)]
pub enum ContractError {
    CategoryAlreadyMinted = 1,
    NftNotFound = 2,
}

// #[derive(Clone, Debug, Eq, PartialEq)]
// pub enum Event {
//     NftMinted {
//         token_id: u32,
//         category: Symbol,
//         metadata: Symbol,
//         owner: Address,
//         issued_at: u64,
//     },
// }
