use soroban_sdk::{contracttype, contracterror, Address};

/// Arbitrator status enumeration
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum ArbitratorStatus {
    Active,
    Inactive,
    Suspended,
}

/// Experience levels for arbitrators
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum ExperienceLevel {
    Novice,
    Intermediate,
    Experienced,
    Expert,
}

/// Arbitrator profile information
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ArbitratorProfile {
    pub address: Address,
    pub status: ArbitratorStatus,
    pub cases_handled: u32,
    pub reputation_score: u32,
    pub registered_at: u64,
    pub last_active: u64,
}

/// Arbitrator-related errors
#[contracterror]
#[derive(Clone, Debug, Copy, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum ArbitratorError {
    ArbitratorNotFound = 1,
    ArbitratorAlreadyRegistered = 2,
    ArbitratorSuspended = 3,
    InsufficientReputation = 4,
    UnauthorizedAction = 5,
}

impl ArbitratorProfile {
    /// Create a new arbitrator profile
    pub fn new(address: Address, registered_at: u64) -> Self {
        Self {
            address,
            status: ArbitratorStatus::Active,
            cases_handled: 0,
            reputation_score: 100, // Start with neutral reputation
            registered_at,
            last_active: registered_at,
        }
    }

    /// Check if arbitrator is active and can take cases
    pub fn is_available(&self) -> bool {
        matches!(self.status, ArbitratorStatus::Active)
    }

    /// Check if arbitrator is suspended
    pub fn is_suspended(&self) -> bool {
        matches!(self.status, ArbitratorStatus::Suspended)
    }

    /// Update arbitrator's last active timestamp
    pub fn update_last_active(&mut self, timestamp: u64) {
        self.last_active = timestamp;
    }

    /// Increment cases handled
    pub fn increment_cases(&mut self) {
        self.cases_handled += 1;
    }

    /// Update reputation score (0-1000 scale)
    pub fn update_reputation(&mut self, new_score: u32) {
        self.reputation_score = if new_score > 1000 { 1000 } else { new_score };
    }

    /// Check if arbitrator has minimum reputation required
    pub fn meets_reputation_threshold(&self, threshold: u32) -> bool {
        self.reputation_score >= threshold
    }

    /// Get arbitrator experience level based on cases handled
    pub fn get_experience_level(&self) -> ExperienceLevel {
        match self.cases_handled {
            0..=4 => ExperienceLevel::Novice,
            5..=19 => ExperienceLevel::Intermediate,
            20..=49 => ExperienceLevel::Experienced,
            _ => ExperienceLevel::Expert,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Env};

    #[test]
    fn test_arbitrator_profile_creation() {
        let env = Env::default();
        let address = Address::generate(&env);
        let timestamp = 1000u64;

        let profile = ArbitratorProfile::new(address.clone(), timestamp);

        assert_eq!(profile.address, address);
        assert_eq!(profile.status, ArbitratorStatus::Active);
        assert_eq!(profile.cases_handled, 0);
        assert_eq!(profile.reputation_score, 100);
        assert_eq!(profile.registered_at, timestamp);
        assert!(profile.is_available());
        assert!(!profile.is_suspended());
    }

    #[test]
    fn test_experience_levels() {
        let env = Env::default();
        let address = Address::generate(&env);
        let mut profile = ArbitratorProfile::new(address, 1000);

        assert_eq!(profile.get_experience_level(), ExperienceLevel::Novice);

        profile.cases_handled = 10;
        assert_eq!(profile.get_experience_level(), ExperienceLevel::Intermediate);

        profile.cases_handled = 25;
        assert_eq!(profile.get_experience_level(), ExperienceLevel::Experienced);

        profile.cases_handled = 50;
        assert_eq!(profile.get_experience_level(), ExperienceLevel::Expert);
    }

    #[test]
    fn test_reputation_management() {
        let env = Env::default();
        let address = Address::generate(&env);
        let mut profile = ArbitratorProfile::new(address, 1000);

        // Test reputation updates
        profile.update_reputation(500);
        assert_eq!(profile.reputation_score, 500);

        // Test reputation threshold
        assert!(profile.meets_reputation_threshold(400));
        assert!(!profile.meets_reputation_threshold(600));

        // Test reputation cap
        profile.update_reputation(1500);
        assert_eq!(profile.reputation_score, 1000);
    }
} 