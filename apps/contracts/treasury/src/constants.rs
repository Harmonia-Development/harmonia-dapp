use soroban_sdk::Symbol;

// Storage keys
pub const BALANCE: Symbol = Symbol::short("balance");
pub const RESERVED: Symbol = Symbol::short("reserved");
pub const TX_LOG: Symbol = Symbol::short("tx_log");
pub const TX_COUNT: Symbol = Symbol::short("tx_count");
pub const ASSET: Symbol = Symbol::short("asset");
pub const ASSETS_COUNT: Symbol = Symbol::short("assets_count");

// Event types
pub const FUNDS_DEPOSITED: Symbol = Symbol::short("funds_deposited");
pub const FUNDS_SCHEDULED: Symbol = Symbol::short("funds_scheduled");
pub const FUNDS_RELEASED: Symbol = Symbol::short("funds_released");
