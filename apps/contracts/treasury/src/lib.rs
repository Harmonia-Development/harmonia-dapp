#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, 
    Address, Env, Symbol, Vec, vec, Map, log
};

mod test;
mod types;
mod errors;
mod constants;

use types::TransactionLog;
use errors::TreasuryError;
use constants::*;

#[contract]
pub struct TreasuryContract;

#[contractimpl]
impl TreasuryContract {
    // Allow DAO to hold and transfer assets
    pub fn deposit(env: Env, asset: Address, from: Address, amount: i128) {
        // Require authorization from the depositor
        from.require_auth();

        // Validate input
        if amount <= 0 {
            panic!("{}", TreasuryError::InvalidAmount);
        }

        // Update the balance
        let current_balance = Self::get_balance(env.clone(), asset.clone());
        let new_balance = current_balance + amount;
        env.storage().persistent().set(&balance_key(&asset), &new_balance);

        // Record the transaction
        let tx_id = Self::generate_tx_id(&env);
        let tx_log = TransactionLog {
            tx_id: tx_id.clone(),
            asset: asset.clone(),
            amount,
            direction: symbol_short!("in"),
            timestamp: env.ledger().timestamp(),
            status: symbol_short!("released"),
            triggered_by: from.clone(),
        };
        
        let tx_count = Self::get_tx_count(&env);
        env.storage().persistent().set(&tx_log_key(tx_count), &tx_log);
        env.storage().persistent().set(&TX_COUNT, &(tx_count + 1));

        // Emit event
        env.events().publish(
            (FUNDS_DEPOSITED, asset.clone(), from.clone()),
            (tx_id, amount),
        );
    }

    // Schedule funds for release at a future time
    pub fn schedule_release(env: Env, asset: Address, amount: i128, unlock_time: u64) {
        // Require authorization from the invoker
        env.invoker().require_auth();

        // Validate input
        if amount <= 0 {
            panic!("{}", TreasuryError::InvalidAmount);
        }

        let current_time = env.ledger().timestamp();
        if unlock_time <= current_time {
            panic!("{}", TreasuryError::InvalidUnlockTime);
        }

        let current_balance = Self::get_balance(env.clone(), asset.clone());
        if current_balance < amount {
            panic!("{}", TreasuryError::InsufficientFunds);
        }

        // Record the scheduled transaction
        let tx_id = Self::generate_tx_id(&env);
        let tx_log = TransactionLog {
            tx_id: tx_id.clone(),
            asset: asset.clone(),
            amount,
            direction: symbol_short!("out"),
            timestamp: unlock_time,
            status: symbol_short!("pending"),
            triggered_by: env.invoker().clone(),
        };
        
        let tx_count = Self::get_tx_count(&env);
        env.storage().persistent().set(&tx_log_key(tx_count), &tx_log);
        env.storage().persistent().set(&TX_COUNT, &(tx_count + 1));

        // Reserve the funds
        let reserved_amount = Self::get_reserved(&env, &asset) + amount;
        env.storage().persistent().set(&reserved_key(&asset), &reserved_amount);

        // Emit event
        env.events().publish(
            (FUNDS_SCHEDULED, asset.clone(), env.invoker().clone()),
            (tx_id, amount, unlock_time),
        );
    }

    // Release funds to a recipient
    pub fn release(env: Env, asset: Address, to: Address, amount: i128) {
        // Require authorization from the invoker
        env.invoker().require_auth();

        // Validate input
        if amount <= 0 {
            panic!("{}", TreasuryError::InvalidAmount);
        }

        let current_balance = Self::get_balance(env.clone(), asset.clone());
        let available_balance = current_balance - Self::get_reserved(&env, &asset);
        
        if available_balance < amount {
            panic!("{}", TreasuryError::InsufficientFunds);
        }

        // Update the balance
        let new_balance = current_balance - amount;
        env.storage().persistent().set(&balance_key(&asset), &new_balance);

        // Record the transaction
        let tx_id = Self::generate_tx_id(&env);
        let tx_log = TransactionLog {
            tx_id: tx_id.clone(),
            asset: asset.clone(),
            amount,
            direction: symbol_short!("out"),
            timestamp: env.ledger().timestamp(),
            status: symbol_short!("released"),
            triggered_by: env.invoker().clone(),
        };
        
        let tx_count = Self::get_tx_count(&env);
        env.storage().persistent().set(&tx_log_key(tx_count), &tx_log);
        env.storage().persistent().set(&TX_COUNT, &(tx_count + 1));

        // Emit event
        env.events().publish(
            (FUNDS_RELEASED, asset.clone(), to.clone()),
            (tx_id, amount),
        );
    }

    // Process a scheduled release
    pub fn process_scheduled_release(env: Env, tx_id: Symbol, to: Address) {
        // Require authorization from the invoker
        env.invoker().require_auth();

        // Find the scheduled transaction
        let tx_count = Self::get_tx_count(&env);
        let mut found_tx: Option<(u32, TransactionLog)> = None;

        for i in 0..tx_count {
            let tx_log: TransactionLog = env
                .storage()
                .persistent()
                .get(&tx_log_key(i))
                .unwrap_or_else(|| panic!("{}", TreasuryError::TransactionNotFound));

            if tx_log.tx_id == tx_id && tx_log.status == symbol_short!("pending") {
                found_tx = Some((i, tx_log));
                break;
            }
        }

        let (index, tx) = found_tx.unwrap_or_else(|| panic!("{}", TreasuryError::TransactionNotFound));

        // Check if the unlock time has passed
        let current_time = env.ledger().timestamp();
        if current_time < tx.timestamp {
            panic!("{}", TreasuryError::UnlockTimeNotReached);
        }

        // Update the transaction status
        let updated_tx = TransactionLog {
            status: symbol_short!("released"),
            ..tx.clone()
        };
        env.storage().persistent().set(&tx_log_key(index), &updated_tx);

        // Update the reserved amount
        let asset = tx.asset.clone();
        let reserved_amount = Self::get_reserved(&env, &asset) - tx.amount;
        env.storage().persistent().set(&reserved_key(&asset), &reserved_amount);

        // Update the balance
        let current_balance = Self::get_balance(env.clone(), asset.clone());
        let new_balance = current_balance - tx.amount;
        env.storage().persistent().set(&balance_key(&asset), &new_balance);

        // Emit event
        env.events().publish(
            (FUNDS_RELEASED, asset.clone(), to.clone()),
            (tx_id, tx.amount),
        );
    }

    // Get the balance of a specific asset
    pub fn get_balance(env: Env, asset: Address) -> i128 {
        env.storage()
            .persistent()
            .get(&balance_key(&asset))
            .unwrap_or(0)
    }

    // Get the reserved amount for a specific asset
    pub fn get_reserved(env: &Env, asset: &Address) -> i128 {
        env.storage()
            .persistent()
            .get(&reserved_key(asset))
            .unwrap_or(0)
    }

    // Get the transaction log
    pub fn get_transaction_log(env: Env) -> Vec<TransactionLog> {
        let tx_count = Self::get_tx_count(&env);
        let mut logs = vec![&env];

        for i in 0..tx_count {
            let tx_log: TransactionLog = env
                .storage()
                .persistent()
                .get(&tx_log_key(i))
                .unwrap_or_else(|| panic!("{}", TreasuryError::TransactionNotFound));
            logs.push_back(tx_log);
        }

        logs
    }

    // Get a specific transaction by ID
    pub fn get_transaction_by_id(env: Env, tx_id: Symbol) -> Option<TransactionLog> {
        let tx_count = Self::get_tx_count(&env);

        for i in 0..tx_count {
            let tx_log: TransactionLog = env
                .storage()
                .persistent()
                .get(&tx_log_key(i))
                .unwrap_or_else(|| panic!("{}", TreasuryError::TransactionNotFound));

            if tx_log.tx_id == tx_id {
                return Some(tx_log);
            }
        }

        None
    }

    // Get all assets in the treasury
    pub fn get_assets(env: Env) -> Vec<Address> {
        let assets_count: u32 = env
            .storage()
            .persistent()
            .get(&ASSETS_COUNT)
            .unwrap_or(0);
        
        let mut assets = vec![&env];
        for i in 0..assets_count {
            let asset: Address = env
                .storage()
                .persistent()
                .get(&asset_key(i))
                .unwrap_or_else(|| panic!("{}", TreasuryError::AssetNotFound));
            assets.push_back(asset);
        }

        assets
    }

    // Helper: Get transaction count
    fn get_tx_count(env: &Env) -> u32 {
        env.storage()
            .persistent()
            .get(&TX_COUNT)
            .unwrap_or(0)
    }

    // Helper: Generate transaction ID
    fn generate_tx_id(env: &Env) -> Symbol {
        let count = Self::get_tx_count(env);
        let ledger = env.ledger().sequence();
        Symbol::from(format!("tx_{}_{}", ledger, count))
    }
}

// Helper: Generate storage key for balance
fn balance_key(asset: &Address) -> (Symbol, Address) {
    (BALANCE, asset.clone())
}

// Helper: Generate storage key for reserved amounts
fn reserved_key(asset: &Address) -> (Symbol, Address) {
    (RESERVED, asset.clone())
}

// Helper: Generate storage key for transaction logs
fn tx_log_key(index: u32) -> (Symbol, u32) {
    (TX_LOG, index)
}

// Helper: Generate storage key for assets
fn asset_key(index: u32) -> (Symbol, u32) {
    (ASSET, index)
}
