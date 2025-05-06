use crate::{
    access::{AccessControl, AccessOperations},
    datatypes::{Category, DataKey, VotingNFT, VotingNFTError},
};
use soroban_sdk::{Address, Env, Symbol, Vec};

pub struct Mint;

pub trait MintingOperations {
    /// Mints an NFT for a specific governance action.
    ///
    /// # Parameters
    /// - `env`: The environment context.
    /// - `minter`: The address of the DAO contract minting the NFT.
    /// - `to`: The address of the NFT recipient.
    /// - `category`: The category of the NFT (e.g., Participation, Referral).
    /// - `metadata`: The metadata for the NFT (e.g., "multiplier:2").
    ///
    /// # Returns
    /// Returns the token ID of the minted NFT or an error if minting fails.
    fn mint_nft(
        env: Env,
        minter: Address,
        to: Address,
        category: Category,
        metadata: Symbol,
    ) -> Result<VotingNFT, VotingNFTError>;
}

impl MintingOperations for Mint {
    fn mint_nft(
        env: Env,
        minter: Address,
        to: Address,
        category: Category,
        metadata: Symbol,
    ) -> Result<VotingNFT, VotingNFTError> {
        // Require auth from the minter (DAO contract)
        minter.require_auth();

        // Verify minter is allowed
        AccessControl::require_minter(env.clone(), minter)?;

        // Generate token_id by incrementing counter
        let token_id = Self::increment_token_count(&env);

        // Prevent duplicate mints for the same owner and category
        let mut owned_nfts: Vec<u128> = env
            .storage()
            .persistent()
            .get(&DataKey::OwnedBy(to.clone()))
            .unwrap_or_else(|| Vec::new(&env));
        for owned_id in owned_nfts.iter() {
            let nft: VotingNFT = env
                .storage()
                .persistent()
                .get(&DataKey::NFT(owned_id))
                .ok_or(VotingNFTError::NFTNotFound)?;
            if nft.category == category && nft.owner == to {
                return Err(VotingNFTError::DuplicateNFT);
            }
        }

        let recipient = to.clone();

        // Create NFT
        let issued_at = env.ledger().timestamp();
        let nft: VotingNFT = VotingNFT {
            token_id: token_id.clone(),
            category,
            metadata,
            owner: recipient,
            issued_at,
        };

        // Save NFT to storage
        Self::save_nft(&env, &nft);

        // Update owner's NFT list
        owned_nfts.push_back(token_id.clone());
        env.storage()
            .persistent()
            .set(&DataKey::OwnedBy(to.clone()), &owned_nfts);

        // Emit nft_minted event
        env.events().publish(
            (
                Symbol::new(&env, "nft_minted"),
                to.clone(),
                token_id.clone(),
            ),
            nft.clone(),
        );

        Ok(nft)
    }
}

impl Mint {
    /// Increments the token counter and returns the new token ID.
    fn increment_token_count(env: &Env) -> u128 {
        let mut token_count: u128 = env
            .storage()
            .persistent()
            .get(&DataKey::TokenCounter)
            .unwrap_or(0);
        token_count += 1;
        env.storage()
            .persistent()
            .set(&DataKey::TokenCounter, &token_count);
        token_count
    }

    /// Saves an NFT to persistent storage.
    fn save_nft(env: &Env, nft: &VotingNFT) {
        env.storage()
            .persistent()
            .set(&DataKey::NFT(nft.token_id.clone()), nft);
    }
}
