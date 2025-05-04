use crate::{
    access::AccessControl,
    mint::MintingOperations,
    query::QueryOperations,
    types::{DataKey, VotingNFT, VotingNFTError},
};
use soroban_sdk::{contract, contractimpl, Address, Env, Symbol, Vec};

#[contract]
pub struct VotingNFTContract;

#[contractimpl]
impl VotingNFTContract {
    /// Burns an NFT, removing it from circulation.
    ///
    /// # Parameters
    /// - `env`: The environment context.
    /// - `token_id`: The ID of the NFT to burn.
    ///
    /// # Returns
    /// Returns Ok(()) if successful or an error if unauthorized or not found.
    pub fn burn_nft(env: Env, token_id: Symbol) -> Result<(), VotingNFTError> {
        let nft: VotingNFT = env.storage().persistent()
            .get(&DataKey::NFT(token_id.clone()))
            .ok_or(VotingNFTError::NFTNotFound)?;

        // Only owner or allowed minter can burn
        let caller = env.invoker();
        caller.require_auth();
        let is_minter = Self::require_minter(env.clone()).is_ok();
        if caller != nft.owner && !is_minter {
            return Err(VotingNFTError::Unauthorized);
        }

        // Remove from storage
        env.storage().persistent().remove(&DataKey::NFT(token_id.clone()));

        // Update owner's NFT list
        let mut owned_nfts: Vec<Symbol> = env.storage().persistent()
            .get(&DataKey::OwnedBy(nft.owner.clone()))
            .unwrap_or_else(|| Vec::new(&env));
        owned_nfts.retain(|id| id != &token_id);
        env.storage().persistent().set(&DataKey::OwnedBy(nft.owner.clone()), &owned_nfts);

        Ok(())
    }

    /// Sets an expiration timestamp for an NFT.
    ///
    /// # Parameters
    /// - `env`: The environment context.
    /// - `token_id`: The ID of the NFT.
    /// - `expires_at`: The timestamp when the NFT expires.
    ///
    /// # Returns
    /// Returns Ok(()) if successful or an error if unauthorized or not found.
    pub fn set_expiration(env: Env, token_id: Symbol, expires_at: u64) -> Result<(), VotingNFTError> {
        // Only allowed minters can set expiration
        Self::require_minter(env.clone())?;

        let mut nft: VotingNFT = env.storage().persistent()
            .get(&DataKey::NFT(token_id.clone()))
            .ok_or(VotingNFTError::NFTNotFound)?;

        // Validate expiration timestamp
        if expires_at <= env.ledger().timestamp() {
            return Err(VotingNFTError::InvalidMetadata);
        }

        nft.expires_at = Some(expires_at);
        env.storage().persistent().set(&DataKey::NFT(token_id), &nft);

        Ok(())
    }
}

// Import traits from other modules
impl AccessControl for VotingNFTContract {}
impl MintingOperations for VotingNFTContract {}
impl QueryOperations for VotingNFTContract {}