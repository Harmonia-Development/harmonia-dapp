#![cfg(test)]
use super::*;
use soroban_sdk::{
    symbol_short, testutils::{Address as AddressTestUtils, Ledger},
    Address, Env,
};

#[test]
fn test_deposit() {
    let env = Env::default();
    env.mock_all_auths(); // Mock authentication for all transactions

    let contract_id = env.register(TreasuryContract, ());
    let client = TreasuryContractClient::new(&env, &contract_id);

    let user = Address::generate(&env);
    let asset = Address::generate(&env);
    let amount = 1000_i128;

    // Test successful deposit
    client.deposit(&asset, &user, &amount);

    // Verify balance
    assert_eq!(client.get_balance(&asset), 1000);
}

#[test]
fn test_deposit_invalid_amount() {
    let env = Env::default();
    env.mock_all_auths(); // Mock authentication for all transactions

    let contract_id = env.register(TreasuryContract, ());
    let client = TreasuryContractClient::new(&env, &contract_id);

    let user = Address::generate(&env);
    let asset = Address::generate(&env);

    // Test deposit with invalid amount (0)
    let result = client.try_deposit(&asset, &user, &0);
    assert_eq!(result, Err(Ok(TreasuryError::InvalidAmount)));
}

#[test]
fn test_schedule_release_success() {
    let env = Env::default();
    env.mock_all_auths(); // Mock authentication for all transactions

    let contract_id = env.register(TreasuryContract, ());
    let client = TreasuryContractClient::new(&env, &contract_id);

    let user = Address::generate(&env);
    let asset = Address::generate(&env);
    let amount = 1000_i128;
    
    // Configure ledger for testing
    env.ledger().with_mut(|li| {
        li.timestamp = 12345;
        li.min_temp_entry_ttl = 10;
        li.min_persistent_entry_ttl = 10;
        li.max_entry_ttl = 100;
    });

    let current_time = env.ledger().timestamp();
    let unlock_time = current_time + 100;
    
    // Deposit funds first
    client.deposit(&asset, &user, &amount);
    
    // Test schedule release with a future time
    let _tx_id = client.schedule_release(&user, &asset, &amount, &unlock_time);
    
    // Verify reserved amount
    assert_eq!(client.get_reserved(&asset), amount);
}

#[test]
fn test_schedule_release_invalid_unlock_time() {
    let env = Env::default();
    env.mock_all_auths(); // Mock authentication for all transactions

    let contract_id = env.register(TreasuryContract, ());
    let client = TreasuryContractClient::new(&env, &contract_id);

    let user = Address::generate(&env);
    let asset = Address::generate(&env);
    
    // Configure ledger for testing
    env.ledger().with_mut(|li| {
        li.timestamp = 12345;
        li.min_temp_entry_ttl = 10;
        li.min_persistent_entry_ttl = 10;
        li.max_entry_ttl = 100;
    });

    let current_time = env.ledger().timestamp();
    
    // Deposit funds first
    client.deposit(&asset, &user, &1000);
    
    // Test schedule release with current time (should fail)
    let result = client.try_schedule_release(&user, &asset, &500, &current_time);
    assert_eq!(result, Err(Ok(TreasuryError::InvalidUnlockTime)));
}

#[test]
fn test_schedule_release_insufficient_funds() {
    let env = Env::default();
    env.mock_all_auths(); // Mock authentication for all transactions

    let contract_id = env.register(TreasuryContract, ());
    let client = TreasuryContractClient::new(&env, &contract_id);

    let user = Address::generate(&env);
    let asset = Address::generate(&env);
    
    // Configure ledger for testing
    env.ledger().with_mut(|li| {
        li.timestamp = 12345;
        li.min_temp_entry_ttl = 10;
        li.min_persistent_entry_ttl = 10;
        li.max_entry_ttl = 100;
    });

    let current_time = env.ledger().timestamp();
    
    // Deposit some funds, but less than needed
    client.deposit(&asset, &user, &500);
    
    // Try to schedule more than available
    let result = client.try_schedule_release(&user, &asset, &1000, &(current_time + 100));
    assert_eq!(result, Err(Ok(TreasuryError::InsufficientFunds)));
}

#[test]
fn test_release_success() {
    let env = Env::default();
    env.mock_all_auths(); // Mock authentication for all transactions

    let contract_id = env.register(TreasuryContract, ());
    let client = TreasuryContractClient::new(&env, &contract_id);

    let user = Address::generate(&env);
    let recipient = Address::generate(&env);
    let asset = Address::generate(&env);
    let amount = 1000_i128;
    
    // Deposit funds first
    client.deposit(&asset, &user, &amount);
    
    // Test release
    client.release(&asset, &recipient, &500);
    
    // Verify balance
    assert_eq!(client.get_balance(&asset), 500);
}

#[test]
fn test_release_insufficient_funds() {
    let env = Env::default();
    env.mock_all_auths(); // Mock authentication for all transactions

    let contract_id = env.register(TreasuryContract, ());
    let client = TreasuryContractClient::new(&env, &contract_id);

    let user = Address::generate(&env);
    let recipient = Address::generate(&env);
    let asset = Address::generate(&env);
    
    // Deposit some funds, but less than needed
    client.deposit(&asset, &user, &500);
    
    // Reserve all funds
    let current_time = env.ledger().timestamp();
    let unlock_time = current_time + 100;
    client.schedule_release(&user, &asset, &500, &unlock_time);
    
    // Try to release funds (should fail because all funds are reserved)
    let result = client.try_release(&asset, &recipient, &500);
    assert_eq!(result, Err(Ok(TreasuryError::InsufficientFunds)));
}

#[test]
fn test_release_invalid_amount() {
    let env = Env::default();
    env.mock_all_auths(); // Mock authentication for all transactions

    let contract_id = env.register(TreasuryContract, ());
    let client = TreasuryContractClient::new(&env, &contract_id);

    let user = Address::generate(&env);
    let recipient = Address::generate(&env);
    let asset = Address::generate(&env);
    
    // Deposit funds first
    client.deposit(&asset, &user, &500);
    
    // Try to release with invalid amount
    let result = client.try_release(&asset, &recipient, &0);
    assert_eq!(result, Err(Ok(TreasuryError::InvalidAmount)));
}

#[test]
fn test_process_scheduled_release_success() {
    let env = Env::default();
    env.mock_all_auths(); // Mock authentication for all transactions

    let contract_id = env.register(TreasuryContract, ());
    let client = TreasuryContractClient::new(&env, &contract_id);

    let user = Address::generate(&env);
    let recipient = Address::generate(&env);
    let asset = Address::generate(&env);
    let amount = 1000_i128;
    
    // Configure ledger for testing
    env.ledger().with_mut(|li| {
        li.timestamp = 12345;
        li.min_temp_entry_ttl = 10;
        li.min_persistent_entry_ttl = 10;
        li.max_entry_ttl = 100;
    });

    let current_time = env.ledger().timestamp();
    let unlock_time = current_time + 100;
    
    // Deposit funds first
    client.deposit(&asset, &user, &amount);
    
    // Schedule a release
    let tx_id = client.schedule_release(&user, &asset, &500, &unlock_time);
    
    // Try to process before unlock time
    let result = client.try_process_scheduled_release(&tx_id, &recipient);
    assert_eq!(result, Err(Ok(TreasuryError::UnlockTimeNotReached)));
    
    // Advance time past unlock
    env.ledger().with_mut(|li| {
        li.timestamp = unlock_time + 1;
        li.min_temp_entry_ttl = 10;
        li.min_persistent_entry_ttl = 10;
        li.max_entry_ttl = 100;
    });
    
    // Process the scheduled release
    client.process_scheduled_release(&tx_id, &recipient);
    
    // Verify balance and reserved amount
    assert_eq!(client.get_balance(&asset), 500);
    assert_eq!(client.get_reserved(&asset), 0);
}

#[test]
fn test_process_scheduled_release_not_found() {
    let env = Env::default();
    env.mock_all_auths(); // Mock authentication for all transactions

    let contract_id = env.register(TreasuryContract, ());
    let client = TreasuryContractClient::new(&env, &contract_id);

    let recipient = Address::generate(&env);
    
    // Try to process a non-existent transaction
    let tx_id = symbol_short!("not_found");
    let result = client.try_process_scheduled_release(&tx_id, &recipient);
    assert_eq!(result, Err(Ok(TreasuryError::TransactionNotFound)));
}

#[test]
fn test_get_transaction_by_id() {
    let env = Env::default();
    env.mock_all_auths(); // Mock authentication for all transactions

    let contract_id = env.register(TreasuryContract, ());
    let client = TreasuryContractClient::new(&env, &contract_id);

    let user = Address::generate(&env);
    let asset = Address::generate(&env);
    
    // Deposit to create a transaction
    client.deposit(&asset, &user, &1000);
    
    // Get transaction log
    let logs = client.get_transaction_log();
    assert_eq!(logs.len(), 1);
    
    // Get transaction by id
    let tx = client.get_transaction_by_id(&logs.get(0).unwrap().tx_id);
    assert!(tx.is_some());
    
    // Try to get non-existent transaction
    let non_existent_tx = client.get_transaction_by_id(&symbol_short!("no_tx"));
    assert!(non_existent_tx.is_none());
}

#[test]
fn test_get_assets() {
    let env = Env::default();
    env.mock_all_auths(); // Mock authentication for all transactions

    let contract_id = env.register(TreasuryContract, ());
    let client = TreasuryContractClient::new(&env, &contract_id);

    let user = Address::generate(&env);
    let asset1 = Address::generate(&env);
    let asset2 = Address::generate(&env);
    
    // Deposit to create assets in treasury
    client.deposit(&asset1, &user, &1000);
    client.deposit(&asset2, &user, &500);
    
    // Get assets
    let assets = client.get_assets();
    assert_eq!(assets.len(), 2);
    assert!(assets.contains(&asset1));
    assert!(assets.contains(&asset2));
}

#[test]
fn test_rate_limit_set_and_get() {
    let env = Env::default();
    env.mock_all_auths(); // Mock authentication for all transactions

    let contract_id = env.register(TreasuryContract, ());
    let client = TreasuryContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let asset = Address::generate(&env);
    
    // Set rate limit
    let max_amount = 1000_i128;
    let time_window = 3600_u64; // 1 hour
    client.set_rate_limit(&admin, &asset, &max_amount, &time_window);
    
    // Verify rate limit settings
    let (stored_max, stored_window) = client.get_rate_limit(&asset);
    assert_eq!(stored_max, max_amount);
    assert_eq!(stored_window, time_window);
    
    // Verify used amount starts at 0
    assert_eq!(client.get_rate_limit_used(&asset), 0);
}

#[test]
fn test_rate_limit_exceeded() {
    let env = Env::default();
    env.mock_all_auths(); // Mock authentication for all transactions

    let contract_id = env.register(TreasuryContract, ());
    let client = TreasuryContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let user = Address::generate(&env);
    let recipient = Address::generate(&env);
    let asset = Address::generate(&env);
    
    // Configure ledger for testing
    env.ledger().with_mut(|li| {
        li.timestamp = 12345;
    });
    
    // Set rate limit to 1000 in a 1 hour window
    let max_amount = 1000_i128;
    let time_window = 3600_u64; // 1 hour
    client.set_rate_limit(&admin, &asset, &max_amount, &time_window);
    
    // Deposit funds
    client.deposit(&asset, &user, &2000);
    
    // First transfer - should succeed
    let _tx_id = client.release(&asset, &recipient, &600);
    
    // Second transfer within limit - should succeed
    let _tx_id = client.release(&asset, &recipient, &300);
    
    // Verify used amount
    assert_eq!(client.get_rate_limit_used(&asset), 900);
    
    // Third transfer that exceeds rate limit - should fail
    let result = client.try_release(&asset, &recipient, &200);
    assert_eq!(result, Err(Ok(TreasuryError::RateLimitExceeded)));
    
    // Verify used amount hasn't changed
    assert_eq!(client.get_rate_limit_used(&asset), 900);
}

#[test]
fn test_rate_limit_reset() {
    let env = Env::default();
    env.mock_all_auths(); // Mock authentication for all transactions

    let contract_id = env.register(TreasuryContract, ());
    let client = TreasuryContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let user = Address::generate(&env);
    let recipient = Address::generate(&env);
    let asset = Address::generate(&env);
    
    // Configure ledger for testing
    let start_time = 12345_u64;
    env.ledger().with_mut(|li| {
        li.timestamp = start_time;
    });
    
    // Set rate limit to 1000 in a 1 hour window
    let max_amount = 1000_i128;
    let time_window = 3600_u64; // 1 hour
    client.set_rate_limit(&admin, &asset, &max_amount, &time_window);
    
    // Deposit funds
    client.deposit(&asset, &user, &3000);
    
    // First transfer - should succeed
    let _tx_id = client.release(&asset, &recipient, &800);
    
    // Verify used amount
    assert_eq!(client.get_rate_limit_used(&asset), 800);
    
    // Advance time past the window
    env.ledger().with_mut(|li| {
        li.timestamp = start_time + time_window + 10;
    });
    
    // New transfer should succeed since window has reset
    let _tx_id = client.release(&asset, &recipient, &800);
    
    // Verify used amount (should be only the new transfer)
    assert_eq!(client.get_rate_limit_used(&asset), 800);
    
    // Another transfer within the new window's limit should succeed
    let _tx_id = client.release(&asset, &recipient, &100);
    
    // Verify cumulative used amount
    assert_eq!(client.get_rate_limit_used(&asset), 900);
}

#[test]
fn test_rate_limit_validation() {
    let env = Env::default();
    env.mock_all_auths(); // Mock authentication for all transactions

    let contract_id = env.register(TreasuryContract, ());
    let client = TreasuryContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let asset = Address::generate(&env);
    
    // Test setting invalid amount
    let result = client.try_set_rate_limit(&admin, &asset, &0, &3600);
    assert_eq!(result, Err(Ok(TreasuryError::InvalidAmount)));
    
    // Test setting invalid time window
    let result = client.try_set_rate_limit(&admin, &asset, &1000, &0);
    assert_eq!(result, Err(Ok(TreasuryError::InvalidTimeWindow)));
}
