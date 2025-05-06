use crate::datatypes::{Config, DataKey, VotingNFTError};
use soroban_sdk::{Address, Env, Symbol, Vec};

pub struct AccessControl;

pub trait AccessOperations {
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

    /// Checks if the provided address is an allowed minter.
    ///
    /// # Parameters
    /// - `env`: The environment context.
    /// - `minter`: The address to check.
    ///
    /// # Returns
    /// Returns Ok(()) if the minter is allowed, or an error if unauthorized.
    fn require_minter(env: Env, minter: Address) -> Result<(), VotingNFTError>;

    /// Adds a new minter to the allowed list.
    ///
    /// # Parameters
    /// - `env`: The environment context.
    /// - `admin`: The admin address authorizing the addition.
    /// - `minter`: The address to add as an allowed minter.
    ///
    /// # Returns
    /// Returns Ok(()) if successful or an error if unauthorized or already added.
    fn add_minter(env: Env, admin: Address, minter: Address) -> Result<(), VotingNFTError>;

    /// Removes a minter from the allowed list.
    ///
    /// # Parameters
    /// - `env`: The environment context.
    /// - `admin`: The admin address authorizing the removal.
    /// - `minter`: The address to remove from the allowed minters.
    ///
    /// # Returns
    /// Returns Ok(()) if successful or an error if unauthorized or not found.
    fn remove_minter(env: Env, admin: Address, minter: Address) -> Result<(), VotingNFTError>;
}

impl AccessOperations for AccessControl {
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
            admin: admin.clone(),
            allowed_minters,
        };
        env.storage().persistent().set(&DataKey::Config, &config);

        // Emit initialization event
        env.events().publish(
            (Symbol::new(&env, "initialized"), admin),
            config.allowed_minters.len(),
        );

        Ok(())
    }

    fn require_minter(env: Env, minter: Address) -> Result<(), VotingNFTError> {
        minter.require_auth();
        let config: Config = env
            .storage()
            .persistent()
            .get(&DataKey::Config)
            .ok_or(VotingNFTError::NotInitialized)?;

        if !config.allowed_minters.contains(&minter) {
            return Err(VotingNFTError::NotAllowedMinter);
        }
        Ok(())
    }

    fn add_minter(env: Env, admin: Address, minter: Address) -> Result<(), VotingNFTError> {
        admin.require_auth();
        let mut config: Config = env
            .storage()
            .persistent()
            .get(&DataKey::Config)
            .ok_or(VotingNFTError::NotInitialized)?;

        // Only admin can add minters
        if admin != config.admin {
            return Err(VotingNFTError::Unauthorized);
        }

        // Prevent adding duplicates
        if config.allowed_minters.contains(&minter) {
            return Err(VotingNFTError::DuplicateMinter);
        }

        config.allowed_minters.push_back(minter.clone());
        env.storage().persistent().set(&DataKey::Config, &config);

        // Emit event
        env.events()
            .publish((Symbol::new(&env, "minter_added"), admin, minter), ());

        Ok(())
    }

    fn remove_minter(env: Env, admin: Address, minter: Address) -> Result<(), VotingNFTError> {
        admin.require_auth();
        let mut config: Config = env
            .storage()
            .persistent()
            .get(&DataKey::Config)
            .ok_or(VotingNFTError::NotInitialized)?;

        // Only admin can remove minters
        if admin != config.admin {
            return Err(VotingNFTError::Unauthorized);
        }

        // Find and remove minter
        let index = config.allowed_minters.iter().position(|x| x == minter);
        if let Some(i) = index {
            config.allowed_minters.remove(i as u32);
            env.storage().persistent().set(&DataKey::Config, &config);

            // Emit event
            env.events()
                .publish((Symbol::new(&env, "minter_removed"), admin, minter), ());

            Ok(())
        } else {
            Err(VotingNFTError::MinterNotFound)
        }
    }
}
