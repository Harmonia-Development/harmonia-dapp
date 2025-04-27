use soroban_sdk::{
    contract, contractimpl, symbol_short, 
    Env, Symbol, Vec, log, panic_with_error
};

use crate::constants::{category, severity};
use crate::errors::NotificationError;

/// Define the notification router contract
#[contract]
pub struct NotificationRouterContract;

#[contractimpl]
impl NotificationRouterContract {
    /// Log governance events
    ///
    /// # Arguments
    ///
    /// * `env` - The Soroban environment
    /// * `title` - A short title for the notification
    /// * `message` - A more detailed message
    /// * `severity` - The severity level (low, medium, high)
    pub fn log_governance_event(env: Env, title: Symbol, message: Symbol, severity: Symbol) {
        Self::validate_severity(&env, &severity);
        log!(&env, "Governance event logged: {}", title);
        
        // Log the event using supported format
        env.events().publish(
            (
                symbol_short!("notify"),
                category::GOVERNANCE,
                severity.clone(),
            ),
            (
                category::GOVERNANCE,
                severity,
                title,
                message,
            ),
        );
    }

    /// Log treasury events
    ///
    /// # Arguments
    ///
    /// * `env` - The Soroban environment
    /// * `title` - A short title for the notification
    /// * `message` - A more detailed message
    /// * `severity` - The severity level (low, medium, high)
    pub fn log_treasury_event(env: Env, title: Symbol, message: Symbol, severity: Symbol) {
        Self::validate_severity(&env, &severity);
        log!(&env, "Treasury event logged: {}", title);
        
        // Log the event
        env.events().publish(
            (
                symbol_short!("notify"),
                category::TREASURY,
                severity.clone(),
            ),
            (
                category::TREASURY,
                severity,
                title,
                message,
            ),
        );
    }

    /// Log member events
    ///
    /// # Arguments
    ///
    /// * `env` - The Soroban environment
    /// * `title` - A short title for the notification
    /// * `message` - A more detailed message
    /// * `severity` - The severity level (low, medium, high)
    pub fn log_member_event(env: Env, title: Symbol, message: Symbol, severity: Symbol) {
        Self::validate_severity(&env, &severity);
        log!(&env, "Member event logged: {}", title);
        
        // Log the event
        env.events().publish(
            (
                symbol_short!("notify"),
                category::MEMBER,
                severity.clone(),
            ),
            (
                category::MEMBER,
                severity,
                title,
                message,
            ),
        );
    }

    /// Log system events
    ///
    /// # Arguments
    ///
    /// * `env` - The Soroban environment
    /// * `title` - A short title for the notification
    /// * `message` - A more detailed message
    /// * `severity` - The severity level (low, medium, high)
    pub fn log_system_event(env: Env, title: Symbol, message: Symbol, severity: Symbol) {
        Self::validate_severity(&env, &severity);
        log!(&env, "System event logged: {}", title);
        
        // Log the event
        env.events().publish(
            (
                symbol_short!("notify"),
                category::SYSTEM,
                severity.clone(),
            ),
            (
                category::SYSTEM,
                severity,
                title,
                message,
            ),
        );
    }

    /// Batch emit notifications - for efficient processing
    ///
    /// # Arguments
    ///
    /// * `env` - The Soroban environment
    /// * `category` - The category for all notifications in the batch
    /// * `notifications` - A vector of (title, message, severity) tuples
    pub fn batch_emit(
        env: Env,
        category: Symbol,
        notifications: Vec<(Symbol, Symbol, Symbol)>,
    ) {
        Self::validate_category(&env, &category);
        log!(&env, "Batch emitting {} notifications", notifications.len());
        
        for notification in notifications.iter() {
            let (title, message, severity) = notification;
            Self::validate_severity(&env, &severity);
            
            env.events().publish(
                (
                    symbol_short!("notify"),
                    category.clone(),
                    severity.clone(),
                ),
                (
                    category.clone(),
                    severity,
                    title,
                    message,
                ),
            );
        }
    }

    /// Helper to validate severity
    ///
    /// # Arguments
    ///
    /// * `severity` - The severity level to validate
    fn validate_severity(env: &Env, severity: &Symbol) {
        let (low, medium, high) = severity::all();
        
        if *severity != low && *severity != medium && *severity != high {
            panic_with_error!(env, NotificationError::InvalidSeverity);
        }
    }

    /// Helper to validate category
    ///
    /// # Arguments
    ///
    /// * `category` - The category to validate
    fn validate_category(env: &Env, category: &Symbol) {
        let (gov, treasury, member, system) = category::all();
        
        if *category != gov && *category != treasury && *category != member && *category != system {
            panic_with_error!(env, NotificationError::InvalidCategory);
        }
    }
} 