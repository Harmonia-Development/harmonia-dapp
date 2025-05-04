use crate::datatypes::{DataKey, VotingNFT, VotingNFTError};
use soroban_sdk::{Address, Env,  Vec};

pub struct Query;

pub trait QueryOperations {
    /// Retrieves an NFT by its token ID.
    ///
    /// # Parameters
    /// - `env`: The environment context.
    /// - `token_id`: The ID of the NFT to retrieve.
    ///
    /// # Returns
    /// Returns the VotingNFT or an error if the NFT is not found or expired.
    fn get_nft(env: Env, token_id: u128) -> Result<VotingNFT, VotingNFTError>;

    /// Retrieves all NFTs owned by an address.
    ///
    /// # Parameters
    /// - `env`: The environment context.
    /// - `owner`: The address of the NFT owner.
    ///
    /// # Returns
    /// Returns a vector of VotingNFTs owned by the address.
    fn get_nfts_by_owner(env: Env, owner: Address) -> Vec<VotingNFT>;
}

impl QueryOperations for Query {
    fn get_nft(env: Env, token_id: u128) -> Result<VotingNFT, VotingNFTError> {
        let nft: VotingNFT = env
            .storage()
            .persistent()
            .get(&DataKey::NFT(token_id.clone()))
            .ok_or(VotingNFTError::NFTNotFound)?;

        Ok(nft)
    }

    fn get_nfts_by_owner(env: Env, owner: Address) -> Vec<VotingNFT> {
        let token_ids: Vec<u128> = env
            .storage()
            .persistent()
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
}
