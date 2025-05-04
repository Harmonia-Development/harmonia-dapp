/// Severity level constants
pub mod severity {
    use soroban_sdk::{symbol_short, Symbol};
    
    pub const LOW: Symbol = symbol_short!("low");
    pub const MEDIUM: Symbol = symbol_short!("medium");
    pub const HIGH: Symbol = symbol_short!("high");
    
    /// Returns all valid severity levels as a tuple
    pub fn all() -> (Symbol, Symbol, Symbol) {
        (LOW, MEDIUM, HIGH)
    }
}

/// Category constants
pub mod category {
    use soroban_sdk::{symbol_short, Symbol};
    
    pub const GOVERNANCE: Symbol = symbol_short!("gov");
    pub const TREASURY: Symbol = symbol_short!("treasury");
    pub const MEMBER: Symbol = symbol_short!("member");
    pub const SYSTEM: Symbol = symbol_short!("system");
    
    /// Returns all valid categories as a tuple
    pub fn all() -> (Symbol, Symbol, Symbol, Symbol) {
        (GOVERNANCE, TREASURY, MEMBER, SYSTEM)
    }
} 