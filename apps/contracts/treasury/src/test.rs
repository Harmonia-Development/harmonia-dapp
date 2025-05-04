#![cfg(test)]

use crate::{TreasuryContract, TreasuryContractClient};
use soroban_sdk::{
    symbol_short,
    testutils::{Address as AddressTestUtils, Ledger, LedgerInfo},
    vec, Address, Env, Symbol,
};

#[test]
fn test_deposit() {
    let env = Env::default();
    let contract_id = env.register_contract(None, TreasuryContract);
    let client = TreasuryContractClient::new(&env, &contract_id);

    let user = Address::generate(&env);
    let asset = Address::generate(&env);
    let amount = 1000;

    // Deposit funds
    client
        .with_source_account(&user)
        .deposit(&asset, &user, &amount);

    // Check balance
    let balance = client.get_balance(&asset);
    assert_eq!(balance, amount);

    // Check transaction log
    let logs = client.get_transaction_log();
    assert_eq!(logs.len(), 1);
    assert_eq!(logs.get(0).unwrap().amount, amount);
    assert_eq!(logs.get(0).unwrap().asset, asset);
    assert_eq!(logs.get(0).unwrap().direction, symbol_short!("in"));
    assert_eq!(logs.get(0).unwrap().status, symbol_short!("released"));
    assert_eq!(logs.get(0).unwrap().triggered_by, user);
}

#[test]
#[should_panic(expected = "Invalid amount")]
fn test_deposit_invalid_amount() {
    let env = Env::default();
    let contract_id = env.register_contract(None, TreasuryContract);
    let client = TreasuryContractClient::new(&env, &contract_id);

    let user = Address::generate(&env);
    let asset = Address::generate(&env);

    // Try to deposit invalid amount
    client.with_source_account(&user).deposit(&asset, &user, &0);
}

#[test]
fn test_schedule_release() {
    let env = Env::default();
    let contract_id = env.register_contract(None, TreasuryContract);
    let client = TreasuryContractClient::new(&env, &contract_id);

    let user = Address::generate(&env);
    let asset = Address::generate(&env);
    let amount = 1000;

    // Set current timestamp
    let current_time = 1000;
    env.ledger().set(LedgerInfo {
        timestamp: current_time,
        protocol_version: 20,
        sequence_number: 123,
        network_id: Default::default(),
        base_reserve: 10,
        min_temp_entry_expiration: 10,
        min_persistent_entry_expiration: 10,
        max_entry_expiration: 100,
    });

    // Deposit funds first
    client
        .with_source_account(&user)
        .deposit(&asset, &user, &amount);

    // Schedule release
    let unlock_time = current_time + 100;
    client
        .with_source_account(&user)
        .schedule_release(&asset, &500, &unlock_time);

    // Check transaction log
    let logs = client.get_transaction_log();
    assert_eq!(logs.len(), 2);
    let scheduled_tx = logs.get(1).unwrap();
    assert_eq!(scheduled_tx.amount, 500);
    assert_eq!(scheduled_tx.asset, asset);
    assert_eq!(scheduled_tx.direction, symbol_short!("out"));
    assert_eq!(scheduled_tx.status, symbol_short!("pending"));
    assert_eq!(scheduled_tx.timestamp, unlock_time);
    assert_eq!(scheduled_tx.triggered_by, user);

    // Balance shouldn't change yet
    let balance = client.get_balance(&asset);
    assert_eq!(balance, amount);
}

#[test]
#[should_panic(expected = "Invalid unlock time")]
fn test_schedule_release_invalid_time() {
    let env = Env::default();
    let contract_id = env.register_contract(None, TreasuryContract);
    let client = TreasuryContractClient::new(&env, &contract_id);

    let user = Address::generate(&env);
    let asset = Address::generate(&env);

    // Set current timestamp
    let current_time = 1000;
    env.ledger().set(LedgerInfo {
        timestamp: current_time,
        protocol_version: 20,
        sequence_number: 123,
        network_id: Default::default(),
        base_reserve: 10,
        min_temp_entry_expiration: 10,
        min_persistent_entry_expiration: 10,
        max_entry_expiration: 100,
    });

    // Deposit funds first
    client
        .with_source_account(&user)
        .deposit(&asset, &user, &1000);

    // Try to schedule release with invalid unlock time (same as current time)
    client
        .with_source_account(&user)
        .schedule_release(&asset, &500, &current_time);
}

#[test]
#[should_panic(expected = "Insufficient funds")]
fn test_schedule_release_insufficient_funds() {
    let env = Env::default();
    let contract_id = env.register_contract(None, TreasuryContract);
    let client = TreasuryContractClient::new(&env, &contract_id);

    let user = Address::generate(&env);
    let asset = Address::generate(&env);

    // Set current timestamp
    let current_time = 1000;
    env.ledger().set(LedgerInfo {
        timestamp: current_time,
        protocol_version: 20,
        sequence_number: 123,
        network_id: Default::default(),
        base_reserve: 10,
        min_temp_entry_expiration: 10,
        min_persistent_entry_expiration: 10,
        max_entry_expiration: 100,
    });

    // Deposit funds first
    client
        .with_source_account(&user)
        .deposit(&asset, &user, &500);

    // Try to schedule release with more than available funds
    client
        .with_source_account(&user)
        .schedule_release(&asset, &1000, &(current_time + 100));
}

#[test]
fn test_release() {
    let env = Env::default();
    let contract_id = env.register_contract(None, TreasuryContract);
    let client = TreasuryContractClient::new(&env, &contract_id);

    let user = Address::generate(&env);
    let recipient = Address::generate(&env);
    let asset = Address::generate(&env);
    let amount = 1000;

    // Deposit funds first
    client
        .with_source_account(&user)
        .deposit(&asset, &user, &amount);

    // Release some funds
    client
        .with_source_account(&user)
        .release(&asset, &recipient, &500);

    // Check balance
    let balance = client.get_balance(&asset);
    assert_eq!(balance, 500);

    // Check transaction log
    let logs = client.get_transaction_log();
    assert_eq!(logs.len(), 2);
    let release_tx = logs.get(1).unwrap();
    assert_eq!(release_tx.amount, 500);
    assert_eq!(release_tx.asset, asset);
    assert_eq!(release_tx.direction, symbol_short!("out"));
    assert_eq!(release_tx.status, symbol_short!("released"));
    assert_eq!(release_tx.triggered_by, user);
}

#[test]
#[should_panic(expected = "Insufficient funds")]
fn test_release_insufficient_funds() {
    let env = Env::default();
    let contract_id = env.register_contract(None, TreasuryContract);
    let client = TreasuryContractClient::new(&env, &contract_id);

    let user = Address::generate(&env);
    let recipient = Address::generate(&env);
    let asset = Address::generate(&env);

    // Deposit funds first
    client
        .with_source_account(&user)
        .deposit(&asset, &user, &500);

    // Try to release more than available
    client
        .with_source_account(&user)
        .release(&asset, &recipient, &1000);
}

#[test]
fn test_process_scheduled_release() {
    let env = Env::default();
    let contract_id = env.register_contract(None, TreasuryContract);
    let client = TreasuryContractClient::new(&env, &contract_id);

    let user = Address::generate(&env);
    let recipient = Address::generate(&env);
    let asset = Address::generate(&env);
    let amount = 1000;

    // Set current timestamp
    let current_time = 1000;
    env.ledger().set(LedgerInfo {
        timestamp: current_time,
        protocol_version: 20,
        sequence_number: 123,
        network_id: Default::default(),
        base_reserve: 10,
        min_temp_entry_expiration: 10,
        min_persistent_entry_expiration: 10,
        max_entry_expiration: 100,
    });

    // Deposit funds first
    client
        .with_source_account(&user)
        .deposit(&asset, &user, &amount);

    // Schedule release
    let unlock_time = current_time + 100;
    client
        .with_source_account(&user)
        .schedule_release(&asset, &500, &unlock_time);

    // Get the transaction ID
    let logs = client.get_transaction_log();
    let scheduled_tx = logs.get(1).unwrap();
    let tx_id = scheduled_tx.tx_id.clone();

    // Try to process before unlock time (should fail)
    let result = std::panic::catch_unwind(|| {
        client
            .with_source_account(&user)
            .process_scheduled_release(&tx_id, &recipient);
    });
    assert!(result.is_err());

    // Advance time past unlock time
    env.ledger().set(LedgerInfo {
        timestamp: unlock_time + 10,
        protocol_version: 20,
        sequence_number: 123,
        network_id: Default::default(),
        base_reserve: 10,
        min_temp_entry_expiration: 10,
        min_persistent_entry_expiration: 10,
        max_entry_expiration: 100,
    });

    // Process the scheduled release
    client
        .with_source_account(&user)
        .process_scheduled_release(&tx_id, &recipient);

    // Check balance
    let balance = client.get_balance(&asset);
    assert_eq!(balance, 500);

    // Check transaction status
    let tx = client.get_transaction_by_id(&tx_id);
    assert!(tx.is_some());
    let tx = tx.unwrap();
    assert_eq!(tx.status, symbol_short!("released"));
}

#[test]
fn test_get_transaction_by_id() {
    let env = Env::default();
    let contract_id = env.register_contract(None, TreasuryContract);
    let client = TreasuryContractClient::new(&env, &contract_id);

    let user = Address::generate(&env);
    let asset = Address::generate(&env);

    // Deposit funds
    client
        .with_source_account(&user)
        .deposit(&asset, &user, &1000);

    // Get the transaction log
    let logs = client.get_transaction_log();
    let tx = logs.get(0).unwrap();
    let tx_id = tx.tx_id.clone();

    // Get transaction by ID
    let found_tx = client.get_transaction_by_id(&tx_id);
    assert!(found_tx.is_some());
    let found_tx = found_tx.unwrap();
    assert_eq!(found_tx.tx_id, tx_id);
    assert_eq!(found_tx.amount, 1000);

    // Try to get non-existent transaction
    let non_existent_tx = client.get_transaction_by_id(&Symbol::from("non_existent"));
    assert!(non_existent_tx.is_none());
}

#[test]
fn test_multiple_assets() {
    let env = Env::default();
    let contract_id = env.register_contract(None, TreasuryContract);
    let client = TreasuryContractClient::new(&env, &contract_id);

    let user = Address::generate(&env);
    let asset1 = Address::generate(&env);
    let asset2 = Address::generate(&env);

    // Deposit different assets
    client
        .with_source_account(&user)
        .deposit(&asset1, &user, &1000);
    client
        .with_source_account(&user)
        .deposit(&asset2, &user, &500);

    // Check balances
    let balance1 = client.get_balance(&asset1);
    let balance2 = client.get_balance(&asset2);
    assert_eq!(balance1, 1000);
    assert_eq!(balance2, 500);

    // Get all transactions
    let logs = client.get_transaction_log();
    assert_eq!(logs.len(), 2);
}
