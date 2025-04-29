use soroban_sdk::{contracttype, Error};

/// Custom error types for better error handling
#[derive(Clone, Debug)]
#[contracttype]
pub enum NotificationError {
    /// Provided severity level is invalid
    InvalidSeverity,
    /// Provided category is invalid
    InvalidCategory,
    /// Provided input data is invalid
    InvalidInput,
}

// Implement From trait for custom error
impl From<NotificationError> for Error {
    fn from(e: NotificationError) -> Self {
        match e {
            NotificationError::InvalidSeverity => Error::from_contract_error(1),
            NotificationError::InvalidCategory => Error::from_contract_error(2),
            NotificationError::InvalidInput => Error::from_contract_error(3),
        }
    }
} 