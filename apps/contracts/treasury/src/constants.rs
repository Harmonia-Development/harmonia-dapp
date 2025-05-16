use soroban_sdk::{Symbol, symbol_short};

// Storage keys
pub const BALANCE: Symbol = symbol_short!("balance");
pub const RESERVED: Symbol = symbol_short!("reserved");
pub const TX_LOG: Symbol = symbol_short!("tx_log");
pub const TX_COUNT: Symbol = symbol_short!("tx_count");
pub const ASSET: Symbol = symbol_short!("asset");
pub const ASSETS_COUNT: Symbol = symbol_short!("asset_idx");

// Event types
pub const FUNDS_DEPOSITED: Symbol = symbol_short!("deposited");
pub const FUNDS_SCHEDULED: Symbol = symbol_short!("scheduled");
pub const FUNDS_RELEASED: Symbol = symbol_short!("released");
