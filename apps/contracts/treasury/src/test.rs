#![cfg(test)]
use super::*;
use soroban_sdk::{
    contract, contractimpl, symbol_short,
    testutils::{Address as AddressTestUtils, Ledger},
    Address, Env, Symbol,
};

// Mock implementation for a simple proposal contract
#[contract]
pub struct MockProposalContract;

#[contractimpl]
impl MockProposalContract {
    // Function to check if a milestone exists
    pub fn milestone_exists(env: Env, milestone_id: Symbol) -> bool {
        env.storage()
            .persistent()
            .get(&milestone_id)
            .unwrap_or(false)
    }

    // Function to create a milestone
    pub fn create_milestone(env: Env, milestone_id: Symbol) -> bool {
        env.storage().persistent().set(&milestone_id, &true);
        true
    }
}

#[test]
fn test_initialization() {
    let env = Env::default();
    env.mock_all_auths(); // Mock authentication for all transactions

    let contract_id = env.register(TreasuryContract, ());
    let client = TreasuryContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);

    // Initialize the contract
    client.init(&admin);

    // Verify admin was set correctly
    let stored_admin = client.get_admin();
    assert!(stored_admin.is_some());
    assert_eq!(stored_admin.unwrap(), admin);
}

#[test]
fn test_initialization_already_initialized() {
    let env = Env::default();
    env.mock_all_auths(); // Mock authentication for all transactions

    let contract_id = env.register(TreasuryContract, ());
    let client = TreasuryContractClient::new(&env, &contract_id);

    let admin1 = Address::generate(&env);
    let admin2 = Address::generate(&env);

    // Initialize the contract with first admin
    client.init(&admin1);

    // Try to initialize again with different admin
    let result = client.try_init(&admin2);
    assert_eq!(result, Err(Ok(TreasuryError::AlreadyInitialized)));

    // Verify the first admin is still set
    let stored_admin = client.get_admin();
    assert!(stored_admin.is_some());
    assert_eq!(stored_admin.unwrap(), admin1);
}

#[test]
fn test_admin_functions() {
    let env = Env::default();
    env.mock_all_auths(); // Mock authentication for all transactions

    let contract_id = env.register(TreasuryContract, ());
    let client = TreasuryContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let non_admin = Address::generate(&env);
    let proposal_contract = Address::generate(&env);
    let asset = Address::generate(&env);

    // Initialize the contract with admin
    client.init(&admin);

    // Admin should be able to set proposal contract
    client.set_proposal_contract(&admin, &proposal_contract);

    // Admin should be able to set rate limit
    client.set_rate_limit(&admin, &asset, &1000, &3600);

    // Verify rate limit was set
    let (max_amount, time_window) = client.get_rate_limit(&asset);
    assert_eq!(max_amount, 1000);
    assert_eq!(time_window, 3600);

    // Non-admin should not be able to set proposal contract
    let result = client.try_set_proposal_contract(&non_admin, &proposal_contract);
    assert_eq!(result, Err(Ok(TreasuryError::Unauthorized)));

    // Non-admin should not be able to set rate limit
    let result = client.try_set_rate_limit(&non_admin, &asset, &2000, &7200);
    assert_eq!(result, Err(Ok(TreasuryError::Unauthorized)));

    // Verify rate limit was not changed
    let (max_amount, time_window) = client.get_rate_limit(&asset);
    assert_eq!(max_amount, 1000);
    assert_eq!(time_window, 3600);
}

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
    let milestone_id = symbol_short!("m1");

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
    let _tx_id = client.schedule_release(&user, &asset, &amount, &unlock_time, &milestone_id);

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
    let milestone_id = symbol_short!("m1");

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
    let result = client.try_schedule_release(&user, &asset, &500, &current_time, &milestone_id);
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
    let milestone_id = symbol_short!("m1");

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
    let result =
        client.try_schedule_release(&user, &asset, &1000, &(current_time + 100), &milestone_id);
    assert_eq!(result, Err(Ok(TreasuryError::InsufficientFunds)));
}

#[test]
fn test_release_success() {
    let env = Env::default();
    env.mock_all_auths(); // Mock authentication for all transactions

    let contract_id = env.register(TreasuryContract, ());
    let client = TreasuryContractClient::new(&env, &contract_id);

    // Initialize with admin
    let admin = Address::generate(&env);
    client.init(&admin);

    let user = Address::generate(&env);
    let recipient = Address::generate(&env);
    let asset = Address::generate(&env);
    let amount = 1000_i128;
    let milestone_id = symbol_short!("m1");

    // Deposit funds first
    client.deposit(&asset, &user, &amount);

    // Test release using admin
    client.release(&admin, &asset, &recipient, &500, &milestone_id);

    // Verify balance
    assert_eq!(client.get_balance(&asset), 500);
}

#[test]
fn test_release_insufficient_funds() {
    let env = Env::default();
    env.mock_all_auths(); // Mock authentication for all transactions

    let contract_id = env.register(TreasuryContract, ());
    let client = TreasuryContractClient::new(&env, &contract_id);

    // Initialize with admin
    let admin = Address::generate(&env);
    client.init(&admin);

    let user = Address::generate(&env);
    let recipient = Address::generate(&env);
    let asset = Address::generate(&env);
    let milestone_id = symbol_short!("m1");

    // Deposit some funds, but less than needed
    client.deposit(&asset, &user, &500);

    // Reserve all funds
    let current_time = env.ledger().timestamp();
    let unlock_time = current_time + 100;
    client.schedule_release(&user, &asset, &500, &unlock_time, &milestone_id);

    // Try to release funds (should fail because all funds are reserved)
    let result = client.try_release(&admin, &asset, &recipient, &500, &milestone_id);
    assert_eq!(result, Err(Ok(TreasuryError::InsufficientFunds)));
}

#[test]
fn test_release_invalid_amount() {
    let env = Env::default();
    env.mock_all_auths(); // Mock authentication for all transactions

    let contract_id = env.register(TreasuryContract, ());
    let client = TreasuryContractClient::new(&env, &contract_id);

    // Initialize with admin
    let admin = Address::generate(&env);
    client.init(&admin);

    let user = Address::generate(&env);
    let recipient = Address::generate(&env);
    let asset = Address::generate(&env);
    let milestone_id = symbol_short!("m1");

    // Deposit funds first
    client.deposit(&asset, &user, &500);

    // Try to release with invalid amount
    let result = client.try_release(&admin, &asset, &recipient, &0, &milestone_id);
    assert_eq!(result, Err(Ok(TreasuryError::InvalidAmount)));
}

#[test]
fn test_process_scheduled_release_success() {
    let env = Env::default();
    env.mock_all_auths(); // Mock authentication for all transactions

    let contract_id = env.register(TreasuryContract, ());
    let client = TreasuryContractClient::new(&env, &contract_id);

    // Initialize with admin
    let admin = Address::generate(&env);
    client.init(&admin);

    let user = Address::generate(&env);
    let recipient = Address::generate(&env);
    let asset = Address::generate(&env);
    let amount = 1000_i128;
    let milestone_id = symbol_short!("m1");

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
    let tx_id = client.schedule_release(&user, &asset, &500, &unlock_time, &milestone_id);

    // Try to process before unlock time
    let result = client.try_process_scheduled_release(&admin, &tx_id, &recipient);
    assert_eq!(result, Err(Ok(TreasuryError::UnlockTimeNotReached)));

    // Advance time past unlock
    env.ledger().with_mut(|li| {
        li.timestamp = unlock_time + 1;
    });

    // Process the scheduled release as admin
    client.process_scheduled_release(&admin, &tx_id, &recipient);

    // Verify transaction and recipient balance
    let tx = client.get_transaction_by_id(&tx_id).unwrap();
    assert_eq!(tx.status, symbol_short!("released"));

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

    // Initialize with admin
    let admin = Address::generate(&env);
    client.init(&admin);

    let recipient = Address::generate(&env);

    // Try to process a non-existent transaction
    let tx_id = symbol_short!("not_found");
    let result = client.try_process_scheduled_release(&admin, &tx_id, &recipient);
    assert_eq!(result, Err(Ok(TreasuryError::TransactionNotFound)));
}

#[test]
fn test_process_scheduled_release_unauthorized() {
    let env = Env::default();
    env.mock_all_auths(); // Mock authentication for all transactions

    let contract_id = env.register(TreasuryContract, ());
    let client = TreasuryContractClient::new(&env, &contract_id);

    // Initialize with admin
    let admin = Address::generate(&env);
    client.init(&admin);

    let user = Address::generate(&env);
    let non_admin = Address::generate(&env);
    let recipient = Address::generate(&env);
    let asset = Address::generate(&env);
    let amount = 1000_i128;
    let milestone_id = symbol_short!("m1");

    // Configure ledger for testing
    env.ledger().with_mut(|li| {
        li.timestamp = 12345;
    });

    let current_time = env.ledger().timestamp();
    let unlock_time = current_time + 100;

    // Deposit funds first
    client.deposit(&asset, &user, &amount);

    // Schedule a release
    let tx_id = client.schedule_release(&user, &asset, &500, &unlock_time, &milestone_id);

    // Advance time past unlock
    env.ledger().with_mut(|li| {
        li.timestamp = unlock_time + 1;
    });

    // Try to process as non-admin (should fail)
    let result = client.try_process_scheduled_release(&non_admin, &tx_id, &recipient);
    assert_eq!(result, Err(Ok(TreasuryError::Unauthorized)));

    // Verify transaction hasn't been processed
    let tx = client.get_transaction_by_id(&tx_id).unwrap();
    assert_eq!(tx.status, symbol_short!("pending"));

    // Now process as admin (should succeed)
    client.process_scheduled_release(&admin, &tx_id, &recipient);

    // Verify transaction is now processed
    let tx = client.get_transaction_by_id(&tx_id).unwrap();
    assert_eq!(tx.status, symbol_short!("released"));
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

    // Initialize the contract with admin
    client.init(&admin);

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
    let milestone_id = symbol_short!("m1");

    // Initialize the contract with admin
    client.init(&admin);

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
    let _tx_id = client.release(&admin, &asset, &recipient, &600, &milestone_id);

    // Second transfer within limit - should succeed
    let _tx_id = client.release(&admin, &asset, &recipient, &300, &milestone_id);

    // Verify used amount
    assert_eq!(client.get_rate_limit_used(&asset), 900);

    // Third transfer that exceeds rate limit - should fail
    let result = client.try_release(&admin, &asset, &recipient, &200, &milestone_id);
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

    // Initialize the contract with admin
    client.init(&admin);

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
    let milestone_id = symbol_short!("m1");
    let _tx_id = client.release(&admin, &asset, &recipient, &800, &milestone_id);

    // Verify used amount
    assert_eq!(client.get_rate_limit_used(&asset), 800);

    // Advance time past the window
    env.ledger().with_mut(|li| {
        li.timestamp = start_time + time_window + 10;
    });

    // New transfer should succeed since window has reset
    let _tx_id = client.release(&admin, &asset, &recipient, &800, &milestone_id);

    // Verify used amount (should be only the new transfer)
    assert_eq!(client.get_rate_limit_used(&asset), 800);

    // Another transfer within the new window's limit should succeed
    let _tx_id = client.release(&admin, &asset, &recipient, &100, &milestone_id);

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

    // Initialize the contract with admin
    client.init(&admin);

    // Test setting invalid amount
    let result = client.try_set_rate_limit(&admin, &asset, &0, &3600);
    assert_eq!(result, Err(Ok(TreasuryError::InvalidAmount)));

    // Test setting invalid time window
    let result = client.try_set_rate_limit(&admin, &asset, &1000, &0);
    assert_eq!(result, Err(Ok(TreasuryError::InvalidTimeWindow)));
}

#[test]
fn test_milestone_based_release() {
    let env = Env::default();
    env.mock_all_auths(); // Mock authentication for all transactions

    // Set up the proposal contract for milestone validation
    let proposal_id = env.register(MockProposalContract, ());
    let proposal_client = MockProposalContractClient::new(&env, &proposal_id);

    // Set up the treasury contract
    let treasury_id = env.register(TreasuryContract, ());
    let treasury_client = TreasuryContractClient::new(&env, &treasury_id);

    // Initialize the treasury contract with admin
    let admin = Address::generate(&env);
    treasury_client.init(&admin);

    // Set the proposal contract in the treasury
    treasury_client.set_proposal_contract(&admin, &proposal_id);

    // Create a milestone
    let milestone_id = symbol_short!("milestone");
    proposal_client.create_milestone(&milestone_id);

    // Set up test accounts and assets
    let user = Address::generate(&env);
    let recipient = Address::generate(&env);
    let asset = Address::generate(&env);
    let deposit_amount = 10000_i128;
    let milestone_amount = 5000_i128;

    // Deposit funds to treasury
    treasury_client.deposit(&asset, &user, &deposit_amount);
    assert_eq!(treasury_client.get_balance(&asset), deposit_amount);

    // Schedule milestone-based release
    let current_time = env.ledger().timestamp();
    let unlock_time = current_time + 1000; // 1000 seconds from now
    let tx_id = treasury_client.schedule_release(
        &user,
        &asset,
        &milestone_amount,
        &unlock_time,
        &milestone_id,
    );

    // Verify transaction is in pending state
    let tx = treasury_client.get_transaction_by_id(&tx_id).unwrap();
    assert_eq!(tx.status, symbol_short!("pending"));
    assert_eq!(tx.milestone_id, milestone_id);

    // Verify reserved amount
    assert_eq!(treasury_client.get_reserved(&asset), milestone_amount);

    // Advance time past unlock time
    env.ledger().with_mut(|li| {
        li.timestamp = current_time + 1001;
    });

    // Process the scheduled release
    treasury_client.process_scheduled_release(&admin, &tx_id, &recipient);

    // Verify transaction is now released
    let tx = treasury_client.get_transaction_by_id(&tx_id).unwrap();
    assert_eq!(tx.status, symbol_short!("released"));

    // Verify balance and reserved amount were updated
    assert_eq!(
        treasury_client.get_balance(&asset),
        deposit_amount - milestone_amount
    );
    assert_eq!(treasury_client.get_reserved(&asset), 0);
}

#[test]
fn test_milestone_validation() {
    let env = Env::default();
    env.mock_all_auths(); // Mock authentication for all transactions

    // Set up the proposal contract for milestone validation
    let proposal_id = env.register(MockProposalContract, ());
    let proposal_client = MockProposalContractClient::new(&env, &proposal_id);

    // Set up the treasury contract
    let treasury_id = env.register(TreasuryContract, ());
    let treasury_client = TreasuryContractClient::new(&env, &treasury_id);

    // Initialize the treasury contract with admin
    let admin = Address::generate(&env);
    treasury_client.init(&admin);

    // Set the proposal contract in the treasury
    treasury_client.set_proposal_contract(&admin, &proposal_id);

    // Set up test accounts and assets
    let user = Address::generate(&env);
    let asset = Address::generate(&env);
    let deposit_amount = 10000_i128;
    let milestone_amount = 5000_i128;

    // Deposit funds to treasury
    treasury_client.deposit(&asset, &user, &deposit_amount);

    // Try to schedule with non-existent milestone
    let invalid_milestone = symbol_short!("invalidml");
    let current_time = env.ledger().timestamp();
    let unlock_time = current_time + 1000;

    // This should fail because the milestone doesn't exist
    let result = treasury_client.try_schedule_release(
        &user,
        &asset,
        &milestone_amount,
        &unlock_time,
        &invalid_milestone,
    );

    assert_eq!(result, Err(Ok(TreasuryError::InvalidMilestoneId)));

    // Now create the milestone and try again
    proposal_client.create_milestone(&invalid_milestone);

    // This should succeed now
    let tx_id = treasury_client.schedule_release(
        &user,
        &asset,
        &milestone_amount,
        &unlock_time,
        &invalid_milestone,
    );

    assert!(tx_id != symbol_short!(""));
}

#[test]
fn test_multi_milestone_proposal() {
    let env = Env::default();
    env.mock_all_auths(); // Mock authentication for all transactions

    // Set up the proposal contract for milestone validation
    let proposal_id = env.register(MockProposalContract, ());
    let proposal_client = MockProposalContractClient::new(&env, &proposal_id);

    // Set up the treasury contract
    let treasury_id = env.register(TreasuryContract, ());
    let treasury_client = TreasuryContractClient::new(&env, &treasury_id);

    // Initialize the treasury contract with admin
    let admin = Address::generate(&env);
    treasury_client.init(&admin);

    // Set the proposal contract in the treasury
    treasury_client.set_proposal_contract(&admin, &proposal_id);

    // Create multiple milestones for a proposal
    let milestone_1 = symbol_short!("pr_mlstn1"); // Initial payment
    let milestone_2 = symbol_short!("pr_mlstn2"); // Mid-project payment
    let milestone_3 = symbol_short!("pr_mlstn3"); // Final payment

    proposal_client.create_milestone(&milestone_1);
    proposal_client.create_milestone(&milestone_2);
    proposal_client.create_milestone(&milestone_3);

    // Set up test accounts and assets
    let dao_member = Address::generate(&env);
    let contractor = Address::generate(&env);
    let asset = Address::generate(&env);
    let deposit_amount = 10000_i128;

    // Payment structure: 20% initial, 30% mid-project, 50% on completion
    let payment_1 = 2000_i128; // 20%
    let payment_2 = 3000_i128; // 30%
    let payment_3 = 5000_i128; // 50%

    // Deposit funds to treasury
    treasury_client.deposit(&asset, &dao_member, &deposit_amount);

    let current_time = env.ledger().timestamp();

    // Schedule first milestone payment (available immediately)
    let unlock_time_1 = current_time + 100;
    let tx_id_1 = treasury_client.schedule_release(
        &dao_member,
        &asset,
        &payment_1,
        &unlock_time_1,
        &milestone_1,
    );

    // Schedule second milestone payment (in 2 weeks)
    let unlock_time_2 = current_time + 1_209_600; // 2 weeks in seconds
    let tx_id_2 = treasury_client.schedule_release(
        &dao_member,
        &asset,
        &payment_2,
        &unlock_time_2,
        &milestone_2,
    );

    // Schedule third milestone payment (in 4 weeks)
    let unlock_time_3 = current_time + 2_419_200; // 4 weeks in seconds
    let tx_id_3 = treasury_client.schedule_release(
        &dao_member,
        &asset,
        &payment_3,
        &unlock_time_3,
        &milestone_3,
    );

    // Verify all scheduled transactions exist
    assert!(treasury_client.get_transaction_by_id(&tx_id_1).is_some());
    assert!(treasury_client.get_transaction_by_id(&tx_id_2).is_some());
    assert!(treasury_client.get_transaction_by_id(&tx_id_3).is_some());

    // Verify total reserved amount
    assert_eq!(
        treasury_client.get_reserved(&asset),
        payment_1 + payment_2 + payment_3
    );

    // Advance time past first milestone
    env.ledger().with_mut(|li| {
        li.timestamp = current_time + 500; // Past first milestone
    });

    // Process first milestone payment
    treasury_client.process_scheduled_release(&admin, &tx_id_1, &contractor);

    // Verify first payment was processed
    let tx_1 = treasury_client.get_transaction_by_id(&tx_id_1).unwrap();
    assert_eq!(tx_1.status, symbol_short!("released"));

    // Verify remaining transactions are still pending
    let tx_2 = treasury_client.get_transaction_by_id(&tx_id_2).unwrap();
    let tx_3 = treasury_client.get_transaction_by_id(&tx_id_3).unwrap();
    assert_eq!(tx_2.status, symbol_short!("pending"));
    assert_eq!(tx_3.status, symbol_short!("pending"));

    // Verify updated reserved amount
    assert_eq!(treasury_client.get_reserved(&asset), payment_2 + payment_3);

    // Advance time past second milestone
    env.ledger().with_mut(|li| {
        li.timestamp = current_time + 1_300_000; // Past second milestone
    });

    // Process second milestone payment
    treasury_client.process_scheduled_release(&admin, &tx_id_2, &contractor);

    // Verify second payment was processed
    let tx_2 = treasury_client.get_transaction_by_id(&tx_id_2).unwrap();
    assert_eq!(tx_2.status, symbol_short!("released"));

    // Verify updated balance and reserved amount
    assert_eq!(
        treasury_client.get_balance(&asset),
        deposit_amount - payment_1 - payment_2
    );
    assert_eq!(treasury_client.get_reserved(&asset), payment_3);

    // Attempt to process third milestone payment (should fail as time hasn't advanced far enough)
    let result = treasury_client.try_process_scheduled_release(&admin, &tx_id_3, &contractor);
    assert_eq!(result, Err(Ok(TreasuryError::UnlockTimeNotReached)));

    // Advance time past third milestone
    env.ledger().with_mut(|li| {
        li.timestamp = current_time + 2_500_000; // Past third milestone
    });

    // Process third milestone payment
    treasury_client.process_scheduled_release(&admin, &tx_id_3, &contractor);

    // Verify all payments were processed
    let tx_3 = treasury_client.get_transaction_by_id(&tx_id_3).unwrap();
    assert_eq!(tx_3.status, symbol_short!("released"));

    // Verify final balance and reserved amount
    assert_eq!(
        treasury_client.get_balance(&asset),
        deposit_amount - payment_1 - payment_2 - payment_3
    );
    assert_eq!(treasury_client.get_reserved(&asset), 0);
}

#[test]
fn test_release_unauthorized() {
    let env = Env::default();
    env.mock_all_auths(); // Mock authentication for all transactions

    let contract_id = env.register(TreasuryContract, ());
    let client = TreasuryContractClient::new(&env, &contract_id);

    // Initialize with admin
    let admin = Address::generate(&env);
    client.init(&admin);

    let non_admin = Address::generate(&env);
    let recipient = Address::generate(&env);
    let asset = Address::generate(&env);
    let amount = 1000_i128;
    let milestone_id = symbol_short!("m1");

    // Deposit funds first (as non-admin)
    client.deposit(&asset, &non_admin, &amount);

    // Try to release as non-admin (should fail)
    let result = client.try_release(&non_admin, &asset, &recipient, &500, &milestone_id);
    assert_eq!(result, Err(Ok(TreasuryError::Unauthorized)));

    // Verify balance wasn't changed
    assert_eq!(client.get_balance(&asset), amount);

    // Now try with admin (should succeed)
    client.release(&admin, &asset, &recipient, &500, &milestone_id);

    // Verify balance was updated
    assert_eq!(client.get_balance(&asset), amount - 500);
}
