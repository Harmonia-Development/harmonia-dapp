#![no_std]
use soroban_sdk::{contract, contractimpl, Address, Env, Symbol, Vec};

use access::{AccessControl, AccessOperations};
use datatypes::{Category, VotingNFT, VotingNFTError};
use mint::{Mint, MintingOperations};
use query::{Query, QueryOperations};

mod access;
mod datatypes;
mod mint;
mod query;

#[contract]
pub struct VotingNFTContract;

#[contractimpl]
impl VotingNFTContract {
    /// Initializes the contract with an admin and allowed minters.
    ///
    /// # Arguments
    /// * `env` - The environment context.
    /// * `admin` - The address of the contract administrator.
    /// * `allowed_minters` - A vector of addresses allowed to mint NFTs.
    ///
    /// # Returns
    /// Returns Ok(()) if successful or an error if already initialized.
    pub fn initialize(
        env: Env,
        admin: Address,
        allowed_minters: Vec<Address>,
    ) -> Result<(), VotingNFTError> {
        AccessControl::initialize(env, admin, allowed_minters)
    }

    /// Mints an NFT for a specific governance action.
    ///
    /// # Arguments
    /// * `env` - The environment context.
    /// * `minter` - The address of the DAO contract minting the NFT.
    /// * `to` - The address of the NFT recipient.
    /// * `category` - The category of the NFT (e.g., Participation, Referral).
    /// * `metadata` - The metadata for the NFT (e.g., "multiplier:2").
    ///
    /// # Returns
    /// Returns the token ID of the minted NFT or an error if minting fails.
    pub fn mint_nft(
        env: Env,
        minter: Address,
        to: Address,
        category: Category,
        metadata: Symbol,
    ) -> Result<VotingNFT, VotingNFTError> {
        Mint::mint_nft(env, minter, to, category, metadata)
    }

    /// Retrieves an NFT by its token ID.
    ///
    /// # Arguments
    /// * `env` - The environment context.
    /// * `token_id` - The ID of the NFT to retrieve.
    ///
    /// # Returns
    /// Returns the VotingNFT or an error if the NFT is not found.
    pub fn get_nft(env: Env, token_id: u128) -> Result<VotingNFT, VotingNFTError> {
        Query::get_nft(env, token_id)
    }

    /// Retrieves all NFTs owned by an address.
    ///
    /// # Arguments
    /// * `env` - The environment context.
    /// * `owner` - The address of the NFT owner.
    ///
    /// # Returns
    /// Returns a vector of VotingNFTs owned by the address.
    pub fn get_nfts_by_owner(env: Env, owner: Address) -> Result<Vec<VotingNFT>, VotingNFTError> {
        Ok(Query::get_nfts_by_owner(env, owner))
    }

    /// Adds a new minter to the allowed list.
    ///
    /// # Arguments
    /// * `env` - The environment context.
    /// * `admin` - The admin address authorizing the addition.
    /// * `minter` - The address to add as an allowed minter.
    ///
    /// # Returns
    /// Returns Ok(()) if successful or an error if unauthorized or already added.
    pub fn add_minter(env: Env, admin: Address, minter: Address) -> Result<(), VotingNFTError> {
        AccessControl::add_minter(env, admin, minter)
    }

    /// Removes a minter from the allowed list.
    ///
    /// # Arguments
    /// * `env` - The environment context.
    /// * `admin` - The admin address authorizing the removal.
    /// * `minter` - The address to remove from the allowed minters.
    ///
    /// # Returns
    /// Returns Ok(()) if successful or an error if unauthorized or not found.
    pub fn remove_minter(env: Env, admin: Address, minter: Address) -> Result<(), VotingNFTError> {
        AccessControl::remove_minter(env, admin, minter)
    }
}

#[cfg(test)]
mod test;
