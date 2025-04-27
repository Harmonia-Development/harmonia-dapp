use soroban_sdk::{contracttype, Symbol};

/// Define event type for notification logging
#[derive(Clone, Debug)]
#[contracttype]
pub enum NotificationEvent {
    /// Structured notification with category, severity, title, and message
    NotificationInfo(Symbol, Symbol, Symbol, Symbol), // category, severity, title, message
}

/// Define notification struct for potential future storage
#[derive(Clone, Debug)]
#[contracttype]
pub struct Notification {
    /// The notification category (gov, treasury, member, system)
    pub category: Symbol,
    /// The severity level (low, medium, high)
    pub severity: Symbol,
    /// A short title for the notification
    pub title: Symbol,
    /// A more detailed message
    pub message: Symbol,
    /// Timestamp of when the notification was created
    pub timestamp: u64,
} 