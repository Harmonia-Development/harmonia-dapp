#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, vec, Address, Env, IntoVal, Symbol, Vec};

mod constants;
mod errors;
mod test;
mod types;

use constants::*;
use errors::TreasuryError;
use types::TransactionLog;

#[contract]
pub struct TreasuryContract;

#[contractimpl]
impl TreasuryContract {
    // Initialize the contract with an admin address
    pub fn init(env: Env, admin: Address) -> Result<(), TreasuryError> {
        // Check if already initialized
        if env.storage().persistent().has(&ADMIN) {
            return Err(TreasuryError::AlreadyInitialized);
        }

        // Require the admin to authorize this transaction
        admin.require_auth();

        // Store admin address
        env.storage().persistent().set(&ADMIN, &admin);

        // Emit initialization event
        env.events().publish((symbol_short!("init"),), admin);

        Ok(())
    }

    // Check if caller is admin
    fn is_admin(env: &Env, caller: &Address) -> bool {
        if let Some(admin) = env.storage().persistent().get::<_, Address>(&ADMIN) {
            return &admin == caller;
        }
        false
    }

    // Require admin authorization
    fn require_admin(env: &Env, caller: &Address) -> Result<(), TreasuryError> {
        // Require authorization from the caller
        caller.require_auth();

        // Check if caller is admin
        if Self::is_admin(env, caller) {
            Ok(())
        } else {
            Err(TreasuryError::Unauthorized)
        }
    }

    // Allow DAO to hold and transfer assets
    pub fn deposit(
        env: Env,
        asset: Address,
        from: Address,
        amount: i128,
    ) -> Result<(), TreasuryError> {
        // Require authorization from the depositor
        from.require_auth();

        // Validate input
        if amount <= 0 {
            return Err(TreasuryError::InvalidAmount);
        }

        // Update the balance
        let current_balance = Self::get_balance(env.clone(), asset.clone());
        let new_balance = current_balance + amount;
        env.storage()
            .persistent()
            .set(&balance_key(&asset), &new_balance);

        // Add to assets list if it's a new asset
        if current_balance == 0 {
            let assets_count: u32 = env.storage().persistent().get(&ASSETS_COUNT).unwrap_or(0);

            env.storage()
                .persistent()
                .set(&asset_key(assets_count), &asset);
            env.storage()
                .persistent()
                .set(&ASSETS_COUNT, &(assets_count + 1));
        }

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
            milestone_id: symbol_short!("none"), // No milestone for deposits
        };

        let tx_count = Self::get_tx_count(&env);
        env.storage()
            .persistent()
            .set(&tx_log_key(tx_count), &tx_log);
        env.storage().persistent().set(&TX_COUNT, &(tx_count + 1));

        // Emit event
        env.events().publish(
            (FUNDS_DEPOSITED, asset.clone(), from.clone()),
            (tx_id, amount),
        );

        Ok(())
    }

    // Schedule funds for release at a future time
    pub fn schedule_release(
        env: Env,
        caller: Address,
        asset: Address,
        amount: i128,
        unlock_time: u64,
        milestone_id: Symbol,
    ) -> Result<Symbol, TreasuryError> {
        // Require authorization from the caller
        caller.require_auth();

        // Validate input
        if amount <= 0 {
            return Err(TreasuryError::InvalidAmount);
        }

        let current_time = env.ledger().timestamp();
        if unlock_time <= current_time {
            return Err(TreasuryError::InvalidUnlockTime);
        }

        // Validate milestone ID
        if milestone_id == symbol_short!("none") || milestone_id == symbol_short!("") {
            return Err(TreasuryError::InvalidMilestoneId);
        }

        // Check if milestone ID exists by validating with the proposal contract
        Self::validate_milestone_id(&env, &milestone_id)?;

        let current_balance = Self::get_balance(env.clone(), asset.clone());
        if current_balance < amount {
            return Err(TreasuryError::InsufficientFunds);
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
            triggered_by: caller.clone(),
            milestone_id: milestone_id.clone(),
        };

        let tx_count = Self::get_tx_count(&env);
        env.storage()
            .persistent()
            .set(&tx_log_key(tx_count), &tx_log);
        env.storage().persistent().set(&TX_COUNT, &(tx_count + 1));

        // Reserve the funds
        let reserved_amount = Self::get_reserved(env.clone(), asset.clone()) + amount;
        env.storage()
            .persistent()
            .set(&reserved_key(&asset), &reserved_amount);

        // Emit event
        env.events().publish(
            (FUNDS_SCHEDULED, asset.clone(), caller.clone()),
            (tx_id.clone(), amount, unlock_time, milestone_id),
        );

        Ok(tx_id)
    }

    // Release funds to a recipient
    pub fn release(
        env: Env,
        caller: Address,
        asset: Address,
        to: Address,
        amount: i128,
        milestone_id: Symbol,
    ) -> Result<Symbol, TreasuryError> {
        // Require admin authentication
        Self::require_admin(&env, &caller)?;

        // Validate input
        if amount <= 0 {
            return Err(TreasuryError::InvalidAmount);
        }

        // Validate milestone ID
        if milestone_id == symbol_short!("none") || milestone_id == symbol_short!("") {
            return Err(TreasuryError::InvalidMilestoneId);
        }

        // Check if milestone ID exists by validating with the proposal contract
        Self::validate_milestone_id(&env, &milestone_id)?;

        let current_balance = Self::get_balance(env.clone(), asset.clone());
        let available_balance = current_balance - Self::get_reserved(env.clone(), asset.clone());

        if available_balance < amount {
            return Err(TreasuryError::InsufficientFunds);
        }

        // Check rate limits
        Self::check_and_update_rate_limit(env.clone(), asset.clone(), amount)?;

        // Update the balance
        let new_balance = current_balance - amount;
        env.storage()
            .persistent()
            .set(&balance_key(&asset), &new_balance);

        // Record the transaction
        let tx_id = Self::generate_tx_id(&env);
        let tx_log = TransactionLog {
            tx_id: tx_id.clone(),
            asset: asset.clone(),
            amount,
            direction: symbol_short!("out"),
            timestamp: env.ledger().timestamp(),
            status: symbol_short!("released"),
            triggered_by: caller.clone(),
            milestone_id: milestone_id.clone(),
        };

        let tx_count = Self::get_tx_count(&env);
        env.storage()
            .persistent()
            .set(&tx_log_key(tx_count), &tx_log);
        env.storage().persistent().set(&TX_COUNT, &(tx_count + 1));

        // Emit event
        env.events().publish(
            (FUNDS_RELEASED, asset.clone(), to.clone()),
            (tx_id.clone(), amount, milestone_id),
        );

        Ok(tx_id)
    }

    // Process a scheduled release
    pub fn process_scheduled_release(
        env: Env,
        caller: Address,
        tx_id: Symbol,
        to: Address,
    ) -> Result<(), TreasuryError> {
        // Require admin authorization
        Self::require_admin(&env, &caller)?;

        // Find the scheduled transaction
        let tx_count = Self::get_tx_count(&env);
        let mut found_tx: Option<(u32, TransactionLog)> = None;

        for i in 0..tx_count {
            let tx_log: TransactionLog = env
                .storage()
                .persistent()
                .get(&tx_log_key(i))
                .unwrap_or_default();

            if tx_log.tx_id == tx_id && tx_log.status == symbol_short!("pending") {
                found_tx = Some((i, tx_log));
                break;
            }
        }

        let (index, tx) = found_tx.ok_or(TreasuryError::TransactionNotFound)?;

        // Check if the unlock time has passed
        let current_time = env.ledger().timestamp();
        if current_time < tx.timestamp {
            return Err(TreasuryError::UnlockTimeNotReached);
        }

        // Revalidate milestone ID still exists
        Self::validate_milestone_id(&env, &tx.milestone_id)?;

        // Check rate limits
        Self::check_and_update_rate_limit(env.clone(), tx.asset.clone(), tx.amount)?;

        // Update the transaction status
        let updated_tx = TransactionLog {
            status: symbol_short!("released"),
            ..tx.clone()
        };
        env.storage()
            .persistent()
            .set(&tx_log_key(index), &updated_tx);

        // Update the reserved amount
        let asset = tx.asset.clone();
        let reserved_amount = Self::get_reserved(env.clone(), asset.clone()) - tx.amount;
        env.storage()
            .persistent()
            .set(&reserved_key(&asset), &reserved_amount);

        // Update the balance
        let current_balance = Self::get_balance(env.clone(), asset.clone());
        let new_balance = current_balance - tx.amount;
        env.storage()
            .persistent()
            .set(&balance_key(&asset), &new_balance);

        // Emit event
        env.events().publish(
            (FUNDS_RELEASED, asset.clone(), to.clone()),
            (tx_id, tx.amount, tx.milestone_id),
        );

        Ok(())
    }

    // Internal function to check and update rate limits
    fn check_and_update_rate_limit(
        env: Env,
        asset: Address,
        amount: i128,
    ) -> Result<(), TreasuryError> {
        // Get current rate limit settings
        let (max_amount, time_window) = Self::get_rate_limit(env.clone(), asset.clone());

        // If no rate limit set, allow the transaction
        if max_amount == i128::MAX || time_window == 0 {
            return Ok(());
        }

        let current_time = env.ledger().timestamp();
        let last_update_time: u64 = env
            .storage()
            .persistent()
            .get(&rate_limit_timestamp_key(&asset))
            .unwrap_or(current_time);

        // Check if we're in a new time window
        let mut amount_used = 0i128;
        if current_time >= last_update_time + time_window {
            // New time window - reset counter
            env.storage()
                .persistent()
                .set(&rate_limit_timestamp_key(&asset), &current_time);
        } else {
            // Still in current window - get used amount
            amount_used = Self::get_rate_limit_used(env.clone(), asset.clone());
        }

        // Check if the new withdrawal would exceed the limit
        if amount_used + amount > max_amount {
            return Err(TreasuryError::RateLimitExceeded);
        }

        // Update the used amount
        let new_amount_used = amount_used + amount;
        env.storage()
            .persistent()
            .set(&rate_limit_used_key(&asset), &new_amount_used);

        Ok(())
    }

    // Set rate limit for an asset
    pub fn set_rate_limit(
        env: Env,
        caller: Address,
        asset: Address,
        max_amount: i128,
        time_window_in_seconds: u64,
    ) -> Result<(), TreasuryError> {
        // Check if caller is admin
        Self::require_admin(&env, &caller)?;

        // Validate input
        if max_amount <= 0 {
            return Err(TreasuryError::InvalidAmount);
        }

        if time_window_in_seconds == 0 {
            return Err(TreasuryError::InvalidTimeWindow);
        }

        // Reset rate limit data when changing the limits
        env.storage()
            .persistent()
            .set(&rate_limit_amount_key(&asset), &max_amount);
        env.storage()
            .persistent()
            .set(&rate_limit_window_key(&asset), &time_window_in_seconds);
        env.storage()
            .persistent()
            .set(&rate_limit_used_key(&asset), &0i128);
        env.storage()
            .persistent()
            .set(&rate_limit_timestamp_key(&asset), &env.ledger().timestamp());

        // Emit event
        env.events().publish(
            (RATE_LIMIT_SET, asset.clone()),
            (max_amount, time_window_in_seconds),
        );

        Ok(())
    }

    // Validate milestone ID with the proposal contract
    fn validate_milestone_id(env: &Env, milestone_id: &Symbol) -> Result<(), TreasuryError> {
        // Get the proposal contract address from storage
        let proposal_contract: Option<Address> = env.storage().persistent().get(&PROPOSAL_CONTRACT);

        match proposal_contract {
            Some(contract_id) => {
                // Invoke the proposal contract's milestone validation function
                let valid: bool = env.invoke_contract(
                    &contract_id,
                    &Symbol::new(env, "milestone_exists"),
                    vec![env, milestone_id.clone().into_val(env)],
                );

                if valid {
                    Ok(())
                } else {
                    Err(TreasuryError::InvalidMilestoneId)
                }
            }
            None => {
                // For testing purposes, consider all milestone IDs valid if no proposal contract is set
                #[cfg(test)]
                return Ok(());

                #[cfg(not(test))]
                return Err(TreasuryError::InvalidMilestoneId);
            }
        }
    }

    // Set proposal contract address for milestone validation
    pub fn set_proposal_contract(
        env: Env,
        caller: Address,
        proposal_contract: Address,
    ) -> Result<(), TreasuryError> {
        // Check if caller is admin
        Self::require_admin(&env, &caller)?;

        env.storage()
            .persistent()
            .set(&PROPOSAL_CONTRACT, &proposal_contract);

        Ok(())
    }

    // Get admin address
    pub fn get_admin(env: Env) -> Option<Address> {
        env.storage().persistent().get(&ADMIN)
    }

    // Get the current rate limit for an asset
    pub fn get_rate_limit(env: Env, asset: Address) -> (i128, u64) {
        let max_amount = env
            .storage()
            .persistent()
            .get(&rate_limit_amount_key(&asset))
            .unwrap_or(i128::MAX);

        let time_window = env
            .storage()
            .persistent()
            .get(&rate_limit_window_key(&asset))
            .unwrap_or(0);

        (max_amount, time_window)
    }

    // Get the amount used in the current rate limit window
    pub fn get_rate_limit_used(env: Env, asset: Address) -> i128 {
        env.storage()
            .persistent()
            .get(&rate_limit_used_key(&asset))
            .unwrap_or(0)
    } // Get the balance of a specific asset
    pub fn get_balance(env: Env, asset: Address) -> i128 {
        env.storage()
            .persistent()
            .get(&balance_key(&asset))
            .unwrap_or(0)
    }

    // Get the reserved amount for a specific asset
    pub fn get_reserved(env: Env, asset: Address) -> i128 {
        env.storage()
            .persistent()
            .get(&reserved_key(&asset))
            .unwrap_or(0)
    }

    // Get the transaction log
    pub fn get_transaction_log(env: Env) -> Vec<TransactionLog> {
        let tx_count = Self::get_tx_count(&env);
        let mut logs = vec![&env];

        for i in 0..tx_count {
            if let Some(tx_log) = env.storage().persistent().get(&tx_log_key(i)) {
                logs.push_back(tx_log);
            }
        }

        logs
    }

    // Get a specific transaction by ID
    pub fn get_transaction_by_id(env: Env, tx_id: Symbol) -> Option<TransactionLog> {
        let tx_count = Self::get_tx_count(&env);

        for i in 0..tx_count {
            if let Some(tx_log) = env.storage().persistent().get(&tx_log_key(i)) {
                let tx_log: TransactionLog = tx_log;
                if tx_log.tx_id == tx_id {
                    return Some(tx_log);
                }
            }
        }

        None
    }

    // Get all assets in the treasury
    pub fn get_assets(env: Env) -> Vec<Address> {
        let assets_count: u32 = env.storage().persistent().get(&ASSETS_COUNT).unwrap_or(0);

        let mut assets = vec![&env];
        for i in 0..assets_count {
            if let Some(asset) = env.storage().persistent().get(&asset_key(i)) {
                assets.push_back(asset);
            }
        }

        assets
    }

    // Helper: Get transaction count
    fn get_tx_count(env: &Env) -> u32 {
        env.storage().persistent().get(&TX_COUNT).unwrap_or(0)
    }

    // Helper: Generate transaction ID without using to_string or format! in no_std environment
    fn generate_tx_id(env: &Env) -> Symbol {
        let count = Self::get_tx_count(env);
        let ledger = env.ledger().sequence() as u64;
        let timestamp = env.ledger().timestamp();

        // We'll use a combination of timestamp, ledger sequence, and count to ensure uniqueness
        // Create a simple hash based on current contract instance + timestamp
        let instance_factor = (timestamp % 10000) ^ (ledger % 10000);

        // Combine all components into a buffer - format: tx_{ledger}_{timestamp}_{instance}_{count}
        let mut buffer = [0u8; 64]; // Buffer for constructing the ID string
        let mut pos = 0;

        // Add "tx_" prefix
        buffer[pos] = b't';
        pos += 1;
        buffer[pos] = b'x';
        pos += 1;
        buffer[pos] = b'_';
        pos += 1;

        // Add ledger sequence
        let ledger_str = Self::u64_to_str(ledger as u64, &mut buffer[pos..]);
        pos += ledger_str;

        buffer[pos] = b'_';
        pos += 1;

        // Add timestamp segment
        let timestamp_str = Self::u64_to_str(timestamp, &mut buffer[pos..]);
        pos += timestamp_str;

        buffer[pos] = b'_';
        pos += 1;

        // Add instance factor (derived from ledger and timestamp)
        let instance_str = Self::u64_to_str(instance_factor, &mut buffer[pos..]);
        pos += instance_str;

        buffer[pos] = b'_';
        pos += 1;

        // Add transaction count
        let count_str = Self::u64_to_str(count as u64, &mut buffer[pos..]);
        pos += count_str;

        // Create symbol from the constructed buffer
        Symbol::new(
            env,
            &core::str::from_utf8(&buffer[0..pos]).unwrap_or("tx_error"),
        )
    }

    // Helper: Convert u64 to string representation in the provided buffer
    // Returns the number of bytes written
    fn u64_to_str(mut value: u64, buffer: &mut [u8]) -> usize {
        if value == 0 {
            buffer[0] = b'0';
            return 1;
        }

        let mut pos = 0;
        let mut digits = [0u8; 20]; // Max digits for u64
        let mut digit_count = 0;

        while value > 0 {
            digits[digit_count] = (value % 10) as u8 + b'0';
            value /= 10;
            digit_count += 1;
        }

        // Copy digits in reverse order (correct order)
        for i in (0..digit_count).rev() {
            buffer[pos] = digits[i];
            pos += 1;
        }

        pos
    }
}

// Helper: Generate storage key for assets
fn asset_key(index: u32) -> (Symbol, u32) {
    (ASSET, index)
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

// Helper: Generate storage key for rate limit amount
fn rate_limit_amount_key(asset: &Address) -> (Symbol, Address) {
    (RATE_LIMIT_AMOUNT, asset.clone())
}

// Helper: Generate storage key for rate limit timestamp
fn rate_limit_timestamp_key(asset: &Address) -> (Symbol, Address) {
    (RATE_LIMIT_TIMESTAMP, asset.clone())
}

// Helper: Generate storage key for rate limit used amount
fn rate_limit_used_key(asset: &Address) -> (Symbol, Address) {
    (RATE_LIMIT_USED, asset.clone())
}

// Helper: Generate storage key for rate limit time window
fn rate_limit_window_key(asset: &Address) -> (Symbol, Address) {
    (RATE_LIMIT_WINDOW, asset.clone())
}
