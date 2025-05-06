use soroban_sdk::{contracttype, Address, BytesN, Env, Symbol};

#[contracttype]
pub struct TransactionLog {
    pub tx_id: Symbol,
    pub asset: Address,
    pub amount: i128,
    pub direction: Symbol, // "in" or "out"
    pub timestamp: u64,
    pub status: Symbol, // "pending" or "released"
    pub triggered_by: Address,
}
