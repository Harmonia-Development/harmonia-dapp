use soroban_sdk::{symbol_short, Symbol};

// Storage keys
pub const ADMIN: Symbol = symbol_short!("admin");
pub const BALANCE: Symbol = symbol_short!("balance");
pub const RESERVED: Symbol = symbol_short!("reserved");
pub const TX_LOG: Symbol = symbol_short!("tx_log");
pub const TX_COUNT: Symbol = symbol_short!("tx_count");
pub const ASSET: Symbol = symbol_short!("asset");
pub const ASSETS_COUNT: Symbol = symbol_short!("asset_idx");
pub const PROPOSAL_CONTRACT: Symbol = symbol_short!("prpcntrct");

// Rate limit related keys
pub const RATE_LIMIT_AMOUNT: Symbol = symbol_short!("rl_amount");
pub const RATE_LIMIT_WINDOW: Symbol = symbol_short!("rl_window");
pub const RATE_LIMIT_USED: Symbol = symbol_short!("rl_used");
pub const RATE_LIMIT_TIMESTAMP: Symbol = symbol_short!("rl_time");

// Event types
pub const FUNDS_DEPOSITED: Symbol = symbol_short!("deposited");
pub const FUNDS_SCHEDULED: Symbol = symbol_short!("scheduled");
pub const FUNDS_RELEASED: Symbol = symbol_short!("released");
pub const RATE_LIMIT_SET: Symbol = symbol_short!("rate_set");
