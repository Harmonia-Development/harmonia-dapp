use crate::{
    access::AccessControl,
    types::{Category, DataKey, VotingNFT, VotingNFTError},
    VotingNFTContract,
};
use soroban_sdk::{contractimpl, symbol_short, Address, Env, Symbol, Vec};

pub trait MintingOperations {
    /// Mints an NFT for a specific governance action.
    ///
    /// # Parameters
    /// - `env`: The environment context.
    /// - `to`: The address of the NFT recipient.
    /// - `category`: The category of the NFT (e.g., Participation, Referral).
    /// - `metadata`: The metadata for the NFT (e.g., "multiplier:2").
    ///
    /// # Returns
    /// Returns the token ID of the minted NFT or an error if minting fails.
    fn mint_nft(
        env: Env,
        to: Address,
        category: Category,
        metadata: Symbol,
    ) -> Result<Symbol, VotingNFTError>;
}

#[contractimpl]
impl MintingOperations for VotingNFTContract {
    fn mint_nft(
        env: Env,
        to: Address,
        category: Category,
        metadata: Symbol,
    ) -> Result<Symbol, VotingNFTError> {
        // Require auth from the caller (DAO contract)
        let caller = env.invoker();
        caller.require_auth();

        // Verify caller is an allowed minter
        Self::require_minter(env.clone())?;

        // Generate unique token_id based on owner and category
        let token_id = Self::generate_token_id(&env, &to, &category);

        // Prevent duplicate mints for the same category
        if env
            .storage()
            .persistent()
            .has(&DataKey::NFT(token_id.clone()))
        {
            return Err(VotingNFTError::DuplicateNFT);
        }

        // Validate metadata (e.g., ensure valid multiplier format if provided)
        if metadata.to_string().starts_with("multiplier:") {
            let multiplier_str = metadata.to_string()[11..].to_string();
            if multiplier_str.parse::<u32>().is_err() || multiplier_str.parse::<u32>().unwrap() == 0
            {
                return Err(VotingNFTError::InvalidMetadata);
            }
        }

        // Create NFT
        let issued_at = env.ledger().timestamp();
        let nft = VotingNFT {
            token_id: token_id.clone(),
            category,
            metadata,
            owner: to.clone(),
            issued_at,
            expires_at: None,
        };

        // Store NFT
        env.storage()
            .persistent()
            .set(&DataKey::NFT(token_id.clone()), &nft);

        // Update owner's NFT list
        let mut owned_nfts: Vec<Symbol> = env
            .storage()
            .persistent()
            .get(&DataKey::OwnedBy(to.clone()))
            .unwrap_or_else(|| Vec::new(&env));
        owned_nfts.push_back(token_id.clone());
        env.storage()
            .persistent()
            .set(&DataKey::OwnedBy(to.clone()), &owned_nfts);

        // Emit nft_minted event
        env.events().publish(
            (symbol_short!("nft_minted"), to, token_id.clone()),
            nft.clone(),
        );

        Ok(token_id)
    }
}

#[contractimpl]
impl VotingNFTContract {
    /// Generates a unique token ID based on owner and category.
    ///
    /// # Parameters
    /// - `env`: The environment context.
    /// - `owner`: The address of the NFT owner.
    /// - `category`: The category of the NFT.
    ///
    /// # Returns
    /// Returns a unique Symbol representing the token ID.
    pub fn generate_token_id(env: &Env, owner: &Address, category: &Category) -> Symbol {
        let category_str = match category {
            Category::Participation => "participation",
            Category::Referral => "referral",
            Category::Governance => "governance",
        };
        let input = format!("{}_{}", owner.to_string(), category_str);
        let hash = env.crypto().sha256(&input);
        Symbol::new(env, &hash.to_string())
    }
}
