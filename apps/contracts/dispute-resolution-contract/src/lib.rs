#![no_std]
#![forbid(unsafe_code)]
//! Documentation is provided for all public interfaces

//! # Dispute Resolution Contract
//!
//! A smart contract for managing disputes within Decentralized Autonomous Organizations (DAOs).
//! This contract enables community-driven dispute resolution through voluntary arbitration.
//!
//! ## Features
//!
//! - **Community-driven arbitration**: Any DAO member can volunteer as an arbitrator
//! - **Transparent dispute tracking**: All disputes and resolutions are stored on-chain
//! - **Flexible penalty system**: Arbitrators can assign fines, compensation, or no penalty
//! - **Emergency controls**: Admin can pause operations if needed
//! - **Role-based access**: Integration with member registry for permission control

use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env, String, Vec};

mod dispute;
mod arbitrator;
mod resolution;

pub use dispute::*;
pub use arbitrator::*;
pub use resolution::*;

/// Constants for the contract
pub mod constants {
    /// Maximum description length for disputes
    pub const MAX_DESCRIPTION_LENGTH: u32 = 1000;
    
    /// Maximum resolution text length
    pub const MAX_RESOLUTION_LENGTH: u32 = 2000;
    
    /// Maximum penalty amount (positive for fines, negative for compensation)
    pub const MAX_PENALTY_AMOUNT: i128 = 10_000;
    
    /// Minimum penalty amount (negative for compensation, positive for fines)
    pub const MIN_PENALTY_AMOUNT: i128 = -10_000;
    
    /// Maximum number of disputes returned in a single query
    pub const MAX_DISPUTES_PER_QUERY: u32 = 50;
}

/// Contract storage keys for persistent and instance storage
#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    /// Admin address storage key
    Admin,
    /// Counter for dispute IDs
    DisputeCounter,
    /// Individual dispute storage key
    Dispute(u32),
    /// Individual resolution storage key
    Resolution(u32),
    /// Arbitrator data storage key
    Arbitrators(u32),
    /// Member registry contract address
    MemberRegistry,
    /// Treasury contract address
    Treasury,
    /// Emergency mode flag
    Emergency,
}

/// Contract events emitted during operations
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum EventType {
    /// Emitted when a new dispute is created
    DisputeRaised,
    /// Emitted when an arbitrator volunteers for a dispute
    ArbitratorVolunteered,
    /// Emitted when a dispute is resolved
    DisputeResolved,
    /// Emitted when an arbitrator is registered
    ArbitratorRegistered,
    /// Emitted when emergency mode is toggled
    EmergencyStateChanged,
}

/// Main contract struct for dispute resolution functionality
#[contract]
pub struct DisputeResolutionContract;

#[contractimpl]
impl DisputeResolutionContract {
    /// Initialize the contract with admin and dependencies
    /// 
    /// This function must be called once after contract deployment to set up
    /// the initial configuration.
    /// 
    /// # Arguments
    /// * `env` - The contract environment
    /// * `admin` - The admin address with emergency control privileges
    /// * `member_registry` - Address of the member registry contract
    /// * `treasury` - Address of the treasury contract for future penalty enforcement
    /// 
    /// # Returns
    /// * `Ok(())` if initialization succeeds
    /// * `Err(DisputeError::AlreadyInitialized)` if already initialized
    /// 
    /// # Events
    /// Emits an initialization event with the admin address
    pub fn initialize(
        env: Env,
        admin: Address,
        member_registry: Address,
        treasury: Address,
    ) -> Result<(), DisputeError> {
        if env.storage().instance().has(&DataKey::Admin) {
            return Err(DisputeError::AlreadyInitialized);
        }

        // Set admin
        env.storage().instance().set(&DataKey::Admin, &admin);
        
        // Set external contract dependencies
        env.storage().instance().set(&DataKey::MemberRegistry, &member_registry);
        env.storage().instance().set(&DataKey::Treasury, &treasury);
        
        // Initialize dispute counter
        env.storage().instance().set(&DataKey::DisputeCounter, &0u32);
        
        // Initialize emergency state as false
        env.storage().instance().set(&DataKey::Emergency, &false);

        env.events().publish(
            (symbol_short!("init"),),
            (admin.clone(),)
        );

        Ok(())
    }

    /// Raise a new dispute against another member
    /// 
    /// Creates a new dispute between two DAO members. Both parties must be
    /// verified members of the DAO.
    /// 
    /// # Arguments
    /// * `env` - The contract environment
    /// * `plaintiff` - The address raising the dispute (must authenticate)
    /// * `defendant` - The address being disputed against
    /// * `description` - Description of the dispute (1-1000 characters)
    /// 
    /// # Returns
    /// * `Ok(dispute_id)` - The ID of the newly created dispute
    /// * `Err(DisputeError)` - Various validation or authorization errors
    /// 
    /// # Errors
    /// * `EmergencyMode` - Contract is paused
    /// * `InvalidDescription` - Description is empty or too long
    /// * `SelfDispute` - Plaintiff and defendant are the same
    /// * `NotInitialized` - Contract not properly initialized
    /// 
    /// # Events
    /// Emits a `DisputeRaised` event with dispute details
    pub fn raise_dispute(
        env: Env,
        plaintiff: Address,
        defendant: Address,
        description: String,
    ) -> Result<u32, DisputeError> {
        // Ensure emergency mode is not active
        Self::require_not_emergency(&env)?;
        
        // Authenticate the plaintiff
        plaintiff.require_auth();
        
        // Validate inputs
        Self::validate_dispute_description(&description)?;
        
        if plaintiff == defendant {
            return Err(DisputeError::SelfDispute);
        }

        // Verify both parties are DAO members
        Self::verify_member(&env, &plaintiff)?;
        Self::verify_member(&env, &defendant)?;

        // Create new dispute
        let dispute_id = Self::get_next_dispute_id(&env);
        let dispute = Dispute {
            id: dispute_id,
            plaintiff: plaintiff.clone(),
            defendant: defendant.clone(),
            description: description.clone(),
            status: DisputeStatus::Open,
            created_at: env.ledger().timestamp(),
            arbitrators: Vec::new(&env),
        };

        // Store dispute
        env.storage().persistent().set(&DataKey::Dispute(dispute_id), &dispute);
        
        // Increment counter
        env.storage().instance().set(&DataKey::DisputeCounter, &dispute_id);

        // Emit event
        env.events().publish(
            (EventType::DisputeRaised, dispute_id),
            (plaintiff, defendant, description)
        );

        Ok(dispute_id)
    }

    /// Allow community members to volunteer as arbitrators
    /// 
    /// Enables DAO members to volunteer as arbitrators for open disputes.
    /// Arbitrators cannot be involved in the dispute as plaintiff or defendant.
    /// 
    /// # Arguments
    /// * `env` - The contract environment
    /// * `arbitrator` - The address volunteering (must authenticate)
    /// * `dispute_id` - The ID of the dispute to arbitrate
    /// 
    /// # Returns
    /// * `Ok(())` if successfully volunteered
    /// * `Err(DisputeError)` - Various validation or authorization errors
    /// 
    /// # Errors
    /// * `EmergencyMode` - Contract is paused
    /// * `DisputeNotFound` - Invalid dispute ID
    /// * `DisputeAlreadyResolved` - Dispute is already closed
    /// * `ConflictOfInterest` - Arbitrator is plaintiff or defendant
    /// * `AlreadyVolunteered` - Already volunteered for this dispute
    /// 
    /// # Events
    /// Emits an `ArbitratorVolunteered` event
    pub fn volunteer_as_arbitrator(
        env: Env,
        arbitrator: Address,
        dispute_id: u32,
    ) -> Result<(), DisputeError> {
        // Ensure emergency mode is not active
        Self::require_not_emergency(&env)?;
        
        // Authenticate the arbitrator
        arbitrator.require_auth();

        // Verify arbitrator is a DAO member
        Self::verify_member(&env, &arbitrator)?;

        // Get dispute
        let mut dispute: Dispute = env.storage().persistent()
            .get(&DataKey::Dispute(dispute_id))
            .ok_or(DisputeError::DisputeNotFound)?;

        // Check dispute is still open
        if dispute.status != DisputeStatus::Open {
            return Err(DisputeError::DisputeAlreadyResolved);
        }

        // Prevent parties from arbitrating their own dispute
        if arbitrator == dispute.plaintiff || arbitrator == dispute.defendant {
            return Err(DisputeError::ConflictOfInterest);
        }

        // Check if already volunteered
        for existing_arbitrator in dispute.arbitrators.iter() {
            if existing_arbitrator == arbitrator {
                return Err(DisputeError::AlreadyVolunteered);
            }
        }

        // Add arbitrator to dispute
        dispute.arbitrators.push_back(arbitrator.clone());
        
        // Update dispute in storage
        env.storage().persistent().set(&DataKey::Dispute(dispute_id), &dispute);

        // Emit event
        env.events().publish(
            (EventType::ArbitratorVolunteered, dispute_id),
            arbitrator
        );

        Ok(())
    }

    /// Submit resolution for a dispute (only by volunteered arbitrators)
    pub fn resolve_dispute(
        env: Env,
        dispute_id: u32,
        arbitrator: Address,
        resolution_text: String,
        penalty: Option<i128>,
    ) -> Result<(), DisputeError> {
        // Ensure emergency mode is not active
        Self::require_not_emergency(&env)?;
        
        // Authenticate the arbitrator
        arbitrator.require_auth();

        // Validate resolution text
        Self::validate_resolution_text_internal(&resolution_text)?;

        // Get dispute
        let mut dispute: Dispute = env.storage().persistent()
            .get(&DataKey::Dispute(dispute_id))
            .ok_or(DisputeError::DisputeNotFound)?;

        // Check dispute is still open
        if dispute.status != DisputeStatus::Open {
            return Err(DisputeError::DisputeAlreadyResolved);
        }

        // Verify arbitrator volunteered for this dispute
        let mut arbitrator_found = false;
        for volunteered_arbitrator in dispute.arbitrators.iter() {
            if volunteered_arbitrator == arbitrator {
                arbitrator_found = true;
                break;
            }
        }
        
        if !arbitrator_found {
            return Err(DisputeError::UnauthorizedArbitrator);
        }

        // Create resolution
        let resolution = Resolution {
            arbitrator: arbitrator.clone(),
            resolution_text: resolution_text.clone(),
            penalty,
            resolved_at: env.ledger().timestamp(),
        };

        // Store resolution separately
        env.storage().persistent().set(&DataKey::Resolution(dispute_id), &resolution);

        // Update dispute status
        dispute.status = DisputeStatus::Resolved;

        // Store updated dispute
        env.storage().persistent().set(&DataKey::Dispute(dispute_id), &dispute);

        // Emit event
        env.events().publish(
            (EventType::DisputeResolved, dispute_id),
            (arbitrator, resolution_text, penalty.unwrap_or(0))
        );

        Ok(())
    }

    /// Get dispute details by ID
    pub fn get_dispute(env: Env, dispute_id: u32) -> Result<Dispute, DisputeError> {
        env.storage().persistent()
            .get(&DataKey::Dispute(dispute_id))
            .ok_or(DisputeError::DisputeNotFound)
    }

    /// Get resolution for a dispute by ID
    pub fn get_resolution(env: Env, dispute_id: u32) -> Result<Resolution, DisputeError> {
        env.storage().persistent()
            .get(&DataKey::Resolution(dispute_id))
            .ok_or(DisputeError::DisputeNotFound)
    }

    /// Get current dispute status
    pub fn get_dispute_status(env: Env, dispute_id: u32) -> Result<DisputeStatus, DisputeError> {
        let dispute: Dispute = env.storage().persistent()
            .get(&DataKey::Dispute(dispute_id))
            .ok_or(DisputeError::DisputeNotFound)?;
        
        Ok(dispute.status)
    }

    /// List all open disputes (with pagination)
    pub fn list_open_disputes(env: Env, start: u32, limit: u32) -> Vec<u32> {
        let mut open_disputes = Vec::new(&env);
        let max_limit = constants::MAX_DISPUTES_PER_QUERY; // Prevent excessive gas usage
        let actual_limit = if limit > max_limit { max_limit } else { limit };
        
        let current_counter: u32 = env.storage().instance()
            .get(&DataKey::DisputeCounter)
            .unwrap_or(0);

        let mut count = 0u32;
        for i in start..=current_counter {
            if count >= actual_limit {
                break;
            }
            
            if let Some(dispute) = env.storage().persistent().get::<DataKey, Dispute>(&DataKey::Dispute(i)) {
                if dispute.status == DisputeStatus::Open {
                    open_disputes.push_back(i);
                    count += 1;
                }
            }
        }

        open_disputes
    }

    /// Get total number of disputes
    pub fn get_total_disputes(env: Env) -> u32 {
        env.storage().instance()
            .get(&DataKey::DisputeCounter)
            .unwrap_or(0)
    }

    /// Emergency stop functionality (admin only)
    pub fn set_emergency_state(env: Env, caller: Address, emergency: bool) -> Result<(), DisputeError> {
        caller.require_auth();
        
        let admin: Address = env.storage().instance()
            .get(&DataKey::Admin)
            .ok_or(DisputeError::NotInitialized)?;

        if caller != admin {
            return Err(DisputeError::Unauthorized);
        }

        env.storage().instance().set(&DataKey::Emergency, &emergency);

        env.events().publish(
            (EventType::EmergencyStateChanged,),
            emergency
        );

        Ok(())
    }

    /// Check if contract is in emergency mode
    pub fn is_emergency(env: Env) -> bool {
        env.storage().instance()
            .get(&DataKey::Emergency)
            .unwrap_or(false)
    }

    // Helper functions
    
    /// Get the next dispute ID by incrementing the counter
    fn get_next_dispute_id(env: &Env) -> u32 {
        let current: u32 = env.storage().instance()
            .get(&DataKey::DisputeCounter)
            .unwrap_or(0);
        current + 1
    }

    /// Verify that an address is a valid DAO member
    /// 
    /// # Arguments
    /// * `env` - The contract environment
    /// * `_address` - The address to verify
    /// 
    /// # Returns
    /// * `Ok(())` if the address is a valid member
    /// * `Err(DisputeError)` if verification fails
    fn verify_member(env: &Env, _address: &Address) -> Result<(), DisputeError> {
        let _member_registry: Address = env.storage().instance()
            .get(&DataKey::MemberRegistry)
            .ok_or(DisputeError::NotInitialized)?;

        // TODO: Call member registry to verify membership
        // This would invoke the member registry contract
        // For now, we'll assume all addresses are valid members
        // In production, you'd call: member_registry.is_member(address)
        
        Ok(())
    }

    /// Ensure the contract is not in emergency mode
    /// 
    /// # Arguments
    /// * `env` - The contract environment
    /// 
    /// # Returns
    /// * `Ok(())` if not in emergency mode
    /// * `Err(DisputeError::EmergencyMode)` if in emergency mode
    fn require_not_emergency(env: &Env) -> Result<(), DisputeError> {
        if Self::is_emergency(env.clone()) {
            return Err(DisputeError::EmergencyMode);
        }
        Ok(())
    }

    /// Validate dispute description
    /// 
    /// # Arguments
    /// * `description` - The description to validate
    /// 
    /// # Returns
    /// * `Ok(())` if valid
    /// * `Err(DisputeError)` if invalid
    fn validate_dispute_description(description: &String) -> Result<(), DisputeError> {
        if description.is_empty() {
            return Err(DisputeError::InvalidDescription);
        }
        
        if description.len() > constants::MAX_DESCRIPTION_LENGTH {
            return Err(DisputeError::InvalidDescription);
        }
        
        Ok(())
    }

    /// Validate resolution text
    /// 
    /// # Arguments
    /// * `resolution_text` - The resolution text to validate
    /// 
    /// # Returns
    /// * `Ok(())` if valid
    /// * `Err(DisputeError)` if invalid
    fn validate_resolution_text_internal(resolution_text: &String) -> Result<(), DisputeError> {
        if resolution_text.is_empty() {
            return Err(DisputeError::InvalidResolution);
        }
        
        if resolution_text.len() > constants::MAX_RESOLUTION_LENGTH {
            return Err(DisputeError::InvalidResolution);
        }
        
        Ok(())
    }
} 