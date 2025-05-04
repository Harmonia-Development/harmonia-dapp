use crate::{
    types::{DataKey, VotingNFT, VotingNFTError},
    VotingNFTContract,
};
use soroban_sdk::{contractimpl, Address, Env, Symbol, Vec};

pub trait QueryOperations {
    /// Retrieves an NFT by its token ID.
    ///
    /// # Parameters
    /// - `env`: The environment context.
    /// - `token_id`: The ID of the NFT to retrieve.
    ///
    /// # Returns
    /// Returns the VotingNFT or an error if the NFT is not found or expired.
    fn get_nft(env: Env, token_id: Symbol) -> Result<VotingNFT, VotingNFTError>;

    /// Retrieves all NFTs owned by an address.
    ///
    /// # Parameters
    /// - `env`: The environment context.
    /// - `owner`: The address of the NFT owner.
    ///
    /// # Returns
    /// Returns a vector of VotingNFTs owned by the address.
    fn get_nfts_by_owner(env: Env, owner: Address) -> Vec<VotingNFT>;

    /// Retrieves the voting power multiplier for an NFT.
    ///
    /// # Parameters
    /// - `env`: The environment context.
    /// - `token_id`: The ID of the NFT.
    ///
    /// # Returns
    /// Returns the voting power multiplier (u32) or an error if the NFT is not found.
    fn get_voting_power(env: Env, token_id: Symbol) -> Result<u32, VotingNFTError>;
}

#[contractimpl]
impl QueryOperations for VotingNFTContract {
    fn get_nft(env: Env, token_id: Symbol) -> Result<VotingNFT, VotingNFTError> {
        let nft: VotingNFT = env.storage().persistent()
            .get(&DataKey::NFT(token_id.clone()))
            .ok_or(VotingNFTError::NFTNotFound)?;

        // Check if NFT is expired
        if let Some(expires_at) = nft.expires_at {
            if env.ledger().timestamp() >= expires_at {
                return Err(VotingNFTError::NFTExpired);
            }
        }
        Ok(nft)
    }

    fn get_nfts_by_owner(env: Env, owner: Address) -> Vec<VotingNFT> {
        let token_ids: Vec<Symbol> = env.storage().persistent()
            .get(&DataKey::OwnedBy(owner.clone()))
            .unwrap_or_else(|| Vec::new(&env));

        let mut nfts = Vec::new(&env);
        for token_id in token_ids.iter() {
            if let Ok(nft) = Self::get_nft(env.clone(), token_id.clone()) {
                nfts.push_back(nft);
            }
        }
        nfts
    }

    fn get_voting_power(env: Env, token_id: Symbol) -> Result<u32, VotingNFTError> {
        let nft = Self::get_nft(env, token_id)?;
        let metadata_str = nft.metadata.to_string();
        if metadata_str.starts_with("multiplier:") {
            metadata_str[11..]
                .parse::<u32>()
                .map_err(|_| VotingNFTError::InvalidMetadata)
        } else {
            Ok(1)
        }
    }
}