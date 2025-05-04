use crate::{
    types::{Config, DataKey, VotingNFTError},
    VotingNFTContract,
};
use soroban_sdk::{contractimpl, symbol_short, Address, Env, Vec};

pub trait AccessControl {
    /// Initializes the contract with a list of allowed minters.
    ///
    /// # Parameters
    /// - `env`: The environment context.
    /// - `admin`: The admin address for managing minters.
    /// - `allowed_minters`: A vector of addresses allowed to mint NFTs.
    ///
    /// # Returns
    /// Returns Ok(()) if successful or an error if already initialized.
    fn initialize(
        env: Env,
        admin: Address,
        allowed_minters: Vec<Address>,
    ) -> Result<(), VotingNFTError>;

    /// Checks if the caller is an allowed minter.
    ///
    /// # Parameters
    /// - `env`: The environment context.
    ///
    /// # Returns
    /// Returns Ok(()) if the caller is allowed, or an error if unauthorized.
    fn require_minter(env: Env) -> Result<(), VotingNFTError>;

    /// Adds a new minter to the allowed list.
    ///
    /// # Parameters
    /// - `env`: The environment context.
    /// - `minter`: The address to add as an allowed minter.
    ///
    /// # Returns
    /// Returns Ok(()) if successful or an error if unauthorized or already added.
    fn add_minter(env: Env, minter: Address) -> Result<(), VotingNFTError>;

    /// Removes a minter from the allowed list.
    ///
    /// # Parameters
    /// - `env`: The environment context.
    /// - `minter`: The address to remove from the allowed minters.
    ///
    /// # Returns
    /// Returns Ok(()) if successful or an error if unauthorized or not found.
    fn remove_minter(env: Env, minter: Address) -> Result<(), VotingNFTError>;
}

#[contractimpl]
impl AccessControl for VotingNFTContract {
    fn initialize(
        env: Env,
        admin: Address,
        allowed_minters: Vec<Address>,
    ) -> Result<(), VotingNFTError> {
        // Prevent re-initialization
        if env.storage().persistent().has(&DataKey::Config) {
            return Err(VotingNFTError::AlreadyInitialized);
        }

        // Store config with admin and allowed minters
        let config = Config {
            admin,
            allowed_minters,
        };
        env.storage().persistent().set(&DataKey::Config, &config);

        // Emit initialization event
        env.events()
            .publish((symbol_short!("initialized"), admin), allowed_minters.len());

        Ok(())
    }

    fn require_minter(env: Env) -> Result<(), VotingNFTError> {
        let caller = env.invoker();
        let config: Config = env
            .storage()
            .persistent()
            .get(&DataKey::Config)
            .ok_or(VotingNFTError::Unauthorized)?;

        if !config.allowed_minters.contains(&caller) {
            return Err(VotingNFTError::Unauthorized);
        }
        Ok(())
    }

    fn add_minter(env: Env, minter: Address) -> Result<(), VotingNFTError> {
        let caller = env.invoker();
        let mut config: Config = env
            .storage()
            .persistent()
            .get(&DataKey::Config)
            .ok_or(VotingNFTError::Unauthorized)?;

        // Only admin can add minters
        if caller != config.admin {
            return Err(VotingNFTError::Unauthorized);
        }

        // Prevent adding duplicates
        if config.allowed_minters.contains(&minter) {
            return Err(VotingNFTError::DuplicateNFT);
        }

        config.allowed_minters.push_back(minter.clone());
        env.storage().persistent().set(&DataKey::Config, &config);

        // Emit event
        env.events()
            .publish((symbol_short!("minter_added"), minter), ());

        Ok(())
    }

    fn remove_minter(env: Env, minter: Address) -> Result<(), VotingNFTError> {
        let caller = env.invoker();
        let mut config: Config = env
            .storage()
            .persistent()
            .get(&DataKey::Config)
            .ok_or(VotingNFTError::Unauthorized)?;

        // Only admin can remove minters
        if caller != config.admin {
            return Err(VotingNFTError::Unauthorized);
        }

        // Find and remove minter
        let index = config.allowed_minters.iter().position(|x| x == minter);
        if let Some(i) = index {
            config.allowed_minters.remove(i as u32);
            env.storage().persistent().set(&DataKey::Config, &config);

            // Emit event
            env.events()
                .publish((symbol_short!("minter_removed"), minter), ());

            Ok(())
        } else {
            Err(VotingNFTError::Unauthorized)
        }
    }
}
