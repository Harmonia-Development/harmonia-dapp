#![no_std]
//! # Notification Router Contract
//!
//! This Soroban smart contract serves as a central notification hub for the Harmonia DAO platform.
//! It provides standardized event emission for various categories of platform activities,
//! allowing for a consistent notification pattern across the DAO ecosystem.
//!
//! ## Features
//!
//! - Standardized event emission for governance, treasury, member, and system activities
//! - Support for severity levels (low, medium, high)
//! - Proper validation of inputs
//! - Batch processing capability for efficient notification grouping
//!
//! ## Modules
//! 
//! - `constants`: Contains severity levels and category constants
//! - `errors`: Defines custom error types for better error handling
//! - `types`: Contains event and notification data structures
//! - `contract`: Core contract implementation with event emission logic

// Module declarations
mod constants;
mod errors;
mod types;
mod contract;

#[cfg(test)]
mod test;

// Public exports
pub use constants::{severity, category};
pub use errors::NotificationError;
pub use types::{NotificationEvent, Notification};
pub use contract::{NotificationRouterContract, NotificationRouterContractClient}; 