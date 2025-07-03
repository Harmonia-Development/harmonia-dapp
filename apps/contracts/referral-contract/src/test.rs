#![cfg(test)]

use super::*;
use soroban_sdk::testutils::{Address as _, Ledger};
use crate::ReferralContract;
use crate::referral::{Referral, Reward};

/// Test that the ReferralStats struct correctly stores and retrieves data
/// This ensures our data structure works as expected for tracking referral metrics
#[test]
fn test_referral_stats_struct() {
    let stats = ReferralStats {
        total_invites: 10,
        converted: 5,
        pending: 5,
    };
    assert_eq!(stats.total_invites, 10);
    assert_eq!(stats.converted, 5);
    assert_eq!(stats.pending, 5);
}

/// Test successful referral registration - the core functionality
/// Verifies that when someone refers another user, both get properly recorded
/// and rewards are distributed correctly
#[test]
fn test_register_referral() {
    let env = Env::default();
    let contract_id = env.register(ReferralContract, ());
    let client = ReferralContractClient::new(&env, &contract_id);
    let referrer = Address::generate(&env);
    let referee = Address::generate(&env);

    env.ledger().set_timestamp(12345);
    client.register_referral(&referrer, &referee);

    // Check that the referral relationship was stored correctly
    let campaign_referrals = symbol_short!("referrals");
    let referrals: Map<Address, Referral> = env
        .storage()
        .persistent()
        .get(&campaign_referrals)
        .unwrap();
    let stored = referrals.get(referee.clone()).unwrap();
    assert_eq!(stored.referrer, referrer);
    assert_eq!(stored.referee, referee);
    assert_eq!(stored.timestamp, 12345);

    // Verify that both referrer and referee received their initial rewards
    let rewards: Map<Address, Reward> = env
        .storage()
        .persistent()
        .get(&symbol_short!("rewards"))
        .unwrap();
    assert_eq!(rewards.get(referrer.clone()).unwrap().amount, 1);
    assert_eq!(rewards.get(referee.clone()).unwrap().referee_amount, 1);
}

/// Test that users cannot refer themselves - prevents gaming the system
/// This is a critical security check to maintain referral integrity
#[test]
#[should_panic(expected = "Cannot self-refer!")]
fn test_self_referral() {
    let env = Env::default();
    let contract_id = env.register(ReferralContract, ());
    let client = ReferralContractClient::new(&env, &contract_id);
    let user = Address::generate(&env);
    client.register_referral(&user, &user);
}

/// Test that a user can only have one referrer - prevents referral conflicts
/// Ensures data consistency and prevents users from gaming the system
#[test]
#[should_panic(expected = "Referee already has a referrer!")]
fn test_duplicate_referral() {
    let env = Env::default();
    let contract_id = env.register(ReferralContract, ());
    let client = ReferralContractClient::new(&env, &contract_id);
    let referrer1 = Address::generate(&env);
    let referrer2 = Address::generate(&env);
    let referee = Address::generate(&env);

    // First referral should succeed
    client.register_referral(&referrer1, &referee);
    // Second referral should fail - user already has a referrer
    client.register_referral(&referrer2, &referee);
}

/// Test retrieving a user's referrer - basic lookup functionality
/// This is used for displaying referral relationships and calculating rewards
#[test]
fn test_get_referrer() {
    let env = Env::default();
    let contract_id = env.register(ReferralContract, ());
    let client = ReferralContractClient::new(&env, &contract_id);
    let referrer = Address::generate(&env);
    let referee = Address::generate(&env);

    client.register_referral(&referrer, &referee);

    let result = client.get_referrer(&referee);
    assert_eq!(result, Some(referrer));
}

/// Test checking if a user has been referred - useful for UI logic
/// Helps determine if a user is eligible for referral bonuses or needs a referrer
#[test]
fn test_has_been_referred() {
    let env = Env::default();
    let contract_id = env.register(ReferralContract, ());
    let client = ReferralContractClient::new(&env, &contract_id);
    let referrer = Address::generate(&env);
    let referee = Address::generate(&env);

    // User should not be referred initially
    let result_before = client.has_been_referred(&referee);
    assert_eq!(result_before, false);

    // After registration, user should be marked as referred
    client.register_referral(&referrer, &referee);

    let result_after = client.has_been_referred(&referee);
    assert_eq!(result_after, true);
}

/// Test listing all referrals for a specific referrer - useful for analytics
/// Helps track how successful a user is at bringing in new members
#[test]
fn test_list_referrals() {
    let env = Env::default();
    let contract_id = env.register(ReferralContract, ());
    let client = ReferralContractClient::new(&env, &contract_id);
    let referrer = Address::generate(&env);
    let referee1 = Address::generate(&env);
    let referee2 = Address::generate(&env);

    // Register multiple referrals for the same referrer
    client.register_referral(&referrer, &referee1);
    client.register_referral(&referrer, &referee2);

    let result = client.list_referrals(&referrer);
    assert_eq!(result.len(), 2);
    assert!(result.contains(&referee1));
    assert!(result.contains(&referee2));
}

/// Test reward claiming functionality - users can withdraw their earned rewards
/// This is the mechanism that incentivizes users to participate in referrals
#[test]
fn test_grant_reward() {
    let env = Env::default();
    let contract_id = env.register(ReferralContract, ());
    let client = ReferralContractClient::new(&env, &contract_id);
    let referrer = Address::generate(&env);
    let referee = Address::generate(&env);

    // Register a referral to earn initial reward
    client.register_referral(&referrer, &referee);

    // Check initial reward balance
    let balance_before = client.get_reward_balance(&referrer);
    assert_eq!(balance_before, 1);

    // Claim the reward
    client.grant_reward(&referrer);

    // Balance should be reset to zero after claiming
    let balance_after = client.get_reward_balance(&referrer);
    assert_eq!(balance_after, 0);
}

/// Test that the leaderboard ranks users by number of conversions
/// This verifies correct sorting and aggregation logic
#[test]
fn test_get_leaderboard_ordering() {
    let env = Env::default();
    let contract_id = env.register(ReferralContract, ());
    let client = ReferralContractClient::new(&env, &contract_id);
    let referrer1 = Address::generate(&env);
    let referrer2 = Address::generate(&env);
    let referee1 = Address::generate(&env);
    let referee2 = Address::generate(&env);
    let referee3 = Address::generate(&env);

    // Setup: referrer1 gets 2 referrals, referrer2 gets 1
    client.register_referral(&referrer1, &referee1);
    client.register_referral(&referrer1, &referee2);
    client.register_referral(&referrer2, &referee3);

    // Mark two conversions: both referrals by referrer1
    env.mock_all_auths();
    client.mark_converted(&referee1);
    client.mark_converted(&referee2);

    // Fetch leaderboard
    let leaderboard = client.get_leaderboard();

    assert_eq!(leaderboard.len(), 1); // Only referrer1 should have conversions
    assert_eq!(leaderboard.get(0).unwrap().address, referrer1);
    assert_eq!(leaderboard.get(0).unwrap().converted, 2);
}

/// Test referral statistics for a given user
/// Confirms that total, converted, and pending counts are accurate
#[test]
fn test_get_referral_stats() {
    let env = Env::default();
    let contract_id = env.register(ReferralContract, ());
    let client = ReferralContractClient::new(&env, &contract_id);
    let referrer = Address::generate(&env);
    let referee1 = Address::generate(&env);
    let referee2 = Address::generate(&env);

    client.register_referral(&referrer, &referee1);
    client.register_referral(&referrer, &referee2);

    // Mark only one as converted
    env.mock_all_auths();
    client.mark_converted(&referee1);

    let stats = client.get_referral_stats(&referrer);

    assert_eq!(stats.total_invites, 2);
    assert_eq!(stats.converted, 1);
    assert_eq!(stats.pending, 1);
}

/// Test circular referral prevention - critical security feature
/// Prevents users from creating referral loops that could break the system
/// or be exploited for unlimited rewards
#[test]
#[should_panic(expected = "Circular referral detected!")]
fn test_circular_referral() {
    let env = Env::default();
    let contract_id = env.register(ReferralContract, ());
    let client = ReferralContractClient::new(&env, &contract_id);
    let addr1 = Address::generate(&env);
    let addr2 = Address::generate(&env);

    // First referral should work
    client.register_referral(&addr1, &addr2);
    // Second referral should fail - would create a circular reference
    client.register_referral(&addr2, &addr1);
}