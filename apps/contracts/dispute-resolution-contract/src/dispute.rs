use soroban_sdk::{contracttype, contracterror, Address, String, Vec, Env};

/// Dispute status enumeration
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum DisputeStatus {
    Open,
    Resolved,
}

/// Main dispute data structure
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Dispute {
    pub id: u32,
    pub plaintiff: Address,
    pub defendant: Address,
    pub description: String,
    pub status: DisputeStatus,
    pub created_at: u64,
    pub arbitrators: Vec<Address>,
}

/// Error types for dispute operations
#[contracterror]
#[derive(Clone, Debug, Copy, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum DisputeError {
    // Initialization errors
    AlreadyInitialized = 1,
    NotInitialized = 2,
    
    // Authorization errors
    Unauthorized = 3,
    
    // Dispute-specific errors
    DisputeNotFound = 4,
    DisputeAlreadyResolved = 5,
    SelfDispute = 6,
    ConflictOfInterest = 7,
    
    // Validation errors
    InvalidDescription = 8,
    InvalidResolution = 9,
    
    // Arbitrator errors
    AlreadyVolunteered = 10,
    UnauthorizedArbitrator = 11,
    
    // System errors
    EmergencyMode = 12,
}

impl Dispute {
    /// Create a new dispute
    pub fn new(
        id: u32,
        plaintiff: Address,
        defendant: Address,
        description: String,
        created_at: u64,
        env: &Env,
    ) -> Self {
        Self {
            id,
            plaintiff,
            defendant,
            description,
            status: DisputeStatus::Open,
            created_at,
            arbitrators: Vec::new(env),
        }
    }

    /// Check if dispute is open
    pub fn is_open(&self) -> bool {
        self.status == DisputeStatus::Open
    }

    /// Check if dispute is resolved
    pub fn is_resolved(&self) -> bool {
        self.status == DisputeStatus::Resolved
    }

    /// Check if an address is involved in the dispute (plaintiff or defendant)
    pub fn involves_party(&self, address: &Address) -> bool {
        &self.plaintiff == address || &self.defendant == address
    }

    /// Check if an address has volunteered as arbitrator
    pub fn has_arbitrator(&self, address: &Address) -> bool {
        for arbitrator in self.arbitrators.iter() {
            if &arbitrator == address {
                return true;
            }
        }
        false
    }

    /// Get the number of volunteered arbitrators
    pub fn arbitrator_count(&self) -> u32 {
        self.arbitrators.len()
    }

    /// Add an arbitrator to the dispute
    pub fn add_arbitrator(&mut self, arbitrator: Address) -> Result<(), DisputeError> {
        // Check if already volunteered
        if self.has_arbitrator(&arbitrator) {
            return Err(DisputeError::AlreadyVolunteered);
        }

        // Check for conflict of interest
        if self.involves_party(&arbitrator) {
            return Err(DisputeError::ConflictOfInterest);
        }

        // Check if dispute is still open
        if !self.is_open() {
            return Err(DisputeError::DisputeAlreadyResolved);
        }

        self.arbitrators.push_back(arbitrator);
        Ok(())
    }

    /// Mark dispute as resolved
    pub fn resolve(&mut self) -> Result<(), DisputeError> {
        if !self.is_open() {
            return Err(DisputeError::DisputeAlreadyResolved);
        }

        self.status = DisputeStatus::Resolved;
        
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Env};

    #[test]
    fn test_dispute_creation() {
        let env = Env::default();
        let plaintiff = Address::generate(&env);
        let defendant = Address::generate(&env);
        let description = String::from_str(&env, "Test dispute");

        let dispute = Dispute::new(1, plaintiff.clone(), defendant.clone(), description, 0, &env);

        assert_eq!(dispute.id, 1);
        assert_eq!(dispute.plaintiff, plaintiff);
        assert_eq!(dispute.defendant, defendant);
        assert!(dispute.is_open());
        assert!(!dispute.is_resolved());
        assert_eq!(dispute.arbitrator_count(), 0);
    }

    #[test]
    fn test_arbitrator_management() {
        let env = Env::default();
        let plaintiff = Address::generate(&env);
        let defendant = Address::generate(&env);
        let arbitrator = Address::generate(&env);
        let description = String::from_str(&env, "Test dispute");

        let mut dispute = Dispute::new(1, plaintiff.clone(), defendant.clone(), description, 0, &env);

        // Add arbitrator
        assert!(dispute.add_arbitrator(arbitrator.clone()).is_ok());
        assert!(dispute.has_arbitrator(&arbitrator));
        assert_eq!(dispute.arbitrator_count(), 1);

        // Try to add same arbitrator again
        assert_eq!(dispute.add_arbitrator(arbitrator), Err(DisputeError::AlreadyVolunteered));

        // Try to add plaintiff as arbitrator (conflict of interest)
        assert_eq!(dispute.add_arbitrator(plaintiff), Err(DisputeError::ConflictOfInterest));
    }

    #[test]
    fn test_dispute_resolution() {
        let env = Env::default();
        let plaintiff = Address::generate(&env);
        let defendant = Address::generate(&env);
        let arbitrator = Address::generate(&env);
        let description = String::from_str(&env, "Test dispute");

        let mut dispute = Dispute::new(1, plaintiff, defendant, description, 0, &env);
        
        // Add arbitrator
        dispute.add_arbitrator(arbitrator.clone()).unwrap();

        // Resolve dispute
        assert!(dispute.resolve().is_ok());
        assert!(dispute.is_resolved());
        assert!(!dispute.is_open());
    }


} 