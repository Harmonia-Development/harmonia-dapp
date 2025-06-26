use soroban_sdk::{contracttype, contracterror, Address, String};
use crate::constants;

/// Resolution data structure containing arbitrator's decision
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Resolution {
    pub arbitrator: Address,
    pub resolution_text: String,
    pub penalty: Option<i128>,
    pub resolved_at: u64,
}

/// Resolution validation and utility functions
impl Resolution {
    /// Create a new resolution
    pub fn new(
        arbitrator: Address,
        resolution_text: String,
        penalty: Option<i128>,
        resolved_at: u64,
    ) -> Self {
        Self {
            arbitrator,
            resolution_text,
            penalty,
            resolved_at,
        }
    }

    /// Validate resolution text length
    pub fn is_valid_resolution_text(&self) -> bool {
        !self.resolution_text.is_empty() && self.resolution_text.len() <= constants::MAX_RESOLUTION_LENGTH
    }

    /// Check if resolution includes a penalty
    pub fn has_penalty(&self) -> bool {
        self.penalty.is_some()
    }

    /// Get penalty amount (returns 0 if no penalty)
    pub fn get_penalty_amount(&self) -> i128 {
        self.penalty.unwrap_or(0)
    }

    /// Check if penalty is positive (fine) or negative (compensation)
    pub fn is_fine(&self) -> bool {
        match self.penalty {
            Some(amount) => amount > 0,
            None => false,
        }
    }

    /// Check if penalty is compensation
    pub fn is_compensation(&self) -> bool {
        match self.penalty {
            Some(amount) => amount < 0,
            None => false,
        }
    }

    /// Validate that penalty amount is reasonable (not exceeding limits)
    pub fn is_valid_penalty(&self) -> bool {
        match self.penalty {
            Some(amount) => {
                // Set reasonable limits for penalties
                // Max fine: 10,000 units (positive)
                // Max compensation: -10,000 units (negative)
                (constants::MIN_PENALTY_AMOUNT..=constants::MAX_PENALTY_AMOUNT).contains(&amount) && amount != 0
            }
            None => true, // No penalty is always valid
        }
    }

    /// Get resolution summary for display
    pub fn get_summary(&self) -> ResolutionSummary {
        ResolutionSummary {
            has_penalty: self.has_penalty(),
            penalty_amount: self.get_penalty_amount(),
            is_fine: self.is_fine(),
            is_compensation: self.is_compensation(),
            text_length: self.resolution_text.len(),
            resolved_timestamp: self.resolved_at,
        }
    }
}

/// Summary information about a resolution for efficient querying
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ResolutionSummary {
    pub has_penalty: bool,
    pub penalty_amount: i128,
    pub is_fine: bool,
    pub is_compensation: bool,
    pub text_length: u32,
    pub resolved_timestamp: u64,
}

/// Resolution-related error types
#[contracterror]
#[derive(Clone, Debug, Copy, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum ResolutionError {
    InvalidResolutionText = 1,
    InvalidPenaltyAmount = 2,
    ResolutionTooLong = 3,
    ResolutionEmpty = 4,
}

/// Resolution validation functions
pub fn validate_resolution_text(text: &String) -> Result<(), ResolutionError> {
    if text.is_empty() {
        return Err(ResolutionError::ResolutionEmpty);
    }
    
    if text.len() > constants::MAX_RESOLUTION_LENGTH {
        return Err(ResolutionError::ResolutionTooLong);
    }
    
    Ok(())
}

pub fn validate_penalty_amount(penalty: Option<i128>) -> Result<(), ResolutionError> {
    match penalty {
        Some(amount) => {
            if amount == 0 {
                return Err(ResolutionError::InvalidPenaltyAmount);
            }
            
            // Check reasonable limits
            if !(constants::MIN_PENALTY_AMOUNT..=constants::MAX_PENALTY_AMOUNT).contains(&amount) {
                return Err(ResolutionError::InvalidPenaltyAmount);
            }
            
            Ok(())
        }
        None => Ok(()), // No penalty is valid
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Env};

    #[test]
    fn test_resolution_creation() {
        let env = Env::default();
        let arbitrator = Address::generate(&env);
        let resolution_text = String::from_str(&env, "Dispute resolved in favor of plaintiff");
        
        let resolution = Resolution::new(
            arbitrator.clone(),
            resolution_text.clone(),
            Some(500),
            1000,
        );

        assert_eq!(resolution.arbitrator, arbitrator);
        assert_eq!(resolution.resolution_text, resolution_text);
        assert_eq!(resolution.penalty, Some(500));
        assert_eq!(resolution.resolved_at, 1000);
    }

    #[test]
    fn test_resolution_validation() {
        let env = Env::default();
        let arbitrator = Address::generate(&env);
        
        // Valid resolution
        let valid_text = String::from_str(&env, "Valid resolution text");
        let resolution = Resolution::new(arbitrator.clone(), valid_text, Some(100), 1000);
        assert!(resolution.is_valid_resolution_text());
        assert!(resolution.is_valid_penalty());

        // Empty resolution text
        let empty_text = String::from_str(&env, "");
        let invalid_resolution = Resolution::new(arbitrator.clone(), empty_text, None, 1000);
        assert!(!invalid_resolution.is_valid_resolution_text());

        // Invalid penalty (too high)
        let valid_text2 = String::from_str(&env, "Valid text");
        let invalid_penalty = Resolution::new(arbitrator, valid_text2, Some(20_000), 1000);
        assert!(!invalid_penalty.is_valid_penalty());
    }

    #[test]
    fn test_penalty_types() {
        let env = Env::default();
        let arbitrator = Address::generate(&env);
        let text = String::from_str(&env, "Resolution text");

        // Fine (positive penalty)
        let fine_resolution = Resolution::new(arbitrator.clone(), text.clone(), Some(500), 1000);
        assert!(fine_resolution.has_penalty());
        assert!(fine_resolution.is_fine());
        assert!(!fine_resolution.is_compensation());
        assert_eq!(fine_resolution.get_penalty_amount(), 500);

        // Compensation (negative penalty)
        let comp_resolution = Resolution::new(arbitrator.clone(), text.clone(), Some(-300), 1000);
        assert!(comp_resolution.has_penalty());
        assert!(!comp_resolution.is_fine());
        assert!(comp_resolution.is_compensation());
        assert_eq!(comp_resolution.get_penalty_amount(), -300);

        // No penalty
        let no_penalty_resolution = Resolution::new(arbitrator, text, None, 1000);
        assert!(!no_penalty_resolution.has_penalty());
        assert!(!no_penalty_resolution.is_fine());
        assert!(!no_penalty_resolution.is_compensation());
        assert_eq!(no_penalty_resolution.get_penalty_amount(), 0);
    }

    #[test]
    fn test_resolution_summary() {
        let env = Env::default();
        let arbitrator = Address::generate(&env);
        let text = String::from_str(&env, "Test resolution");

        let resolution = Resolution::new(arbitrator, text, Some(250), 1500);
        let summary = resolution.get_summary();

        assert!(summary.has_penalty);
        assert_eq!(summary.penalty_amount, 250);
        assert!(summary.is_fine);
        assert!(!summary.is_compensation);
        assert_eq!(summary.resolved_timestamp, 1500);
    }

    #[test]
    fn test_validation_functions() {
        let env = Env::default();
        
        // Test text validation
        let valid_text = String::from_str(&env, "Valid resolution");
        assert!(validate_resolution_text(&valid_text).is_ok());

        let empty_text = String::from_str(&env, "");
        assert_eq!(validate_resolution_text(&empty_text), Err(ResolutionError::ResolutionEmpty));

        // Test penalty validation
        assert!(validate_penalty_amount(Some(500)).is_ok());
        assert!(validate_penalty_amount(None).is_ok());
        assert_eq!(validate_penalty_amount(Some(0)), Err(ResolutionError::InvalidPenaltyAmount));
        assert_eq!(validate_penalty_amount(Some(15_000)), Err(ResolutionError::InvalidPenaltyAmount));
    }
} 