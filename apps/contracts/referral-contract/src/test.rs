#![cfg(test)]

use super::*;
use soroban_sdk::testutils::{Address as _, Ledger};
use crate::ReferralContract;
use crate::referral::{Referral, Reward};

/// Test that the ReferralStats struct correctly stores and retrieves data
#[test]
fn test_referral_stats_struct() {
    // Test that the ReferralStats struct can be created
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
    // Set up the test environment and contract
    let env = Env::default();
    let contract_id = env.register(ReferralContract, ());
    let referrer = Address::generate(&env);
    let referee = Address::generate(&env);

    // Set a fake timestamp and register the referral
    env.ledger().set_timestamp(12345);
    env.as_contract(&contract_id, || {
        referral::register_referral(env.clone(), referrer.clone(), referee.clone());
    });

    // Check that the referral relationship was stored correctly
    let campaign_referrals = symbol_short!("referrals");
    let referrals: Map<Address, Referral> = env.as_contract(&contract_id, || {
        env.storage()
            .persistent()
            .get(&campaign_referrals)
            .unwrap()
    });
    let stored = referrals.get(referee.clone()).unwrap();
    assert_eq!(stored.referrer, referrer);
    assert_eq!(stored.referee, referee);
    assert_eq!(stored.timestamp, 12345);

    // Check that both referrer and referee got their rewards
    let rewards: Map<Address, Reward> = env.as_contract(&contract_id, || {
        env.storage()
            .persistent()
            .get(&symbol_short!("rewards"))
            .unwrap()
    });
    assert_eq!(rewards.get(referrer.clone()).unwrap().amount, 1);
    assert_eq!(rewards.get(referee.clone()).unwrap().referee_amount, 1);
}

/// Test that users cannot refer themselves - prevents cheating
#[test]
#[should_panic(expected = "Cannot self-refer!")]
fn test_self_referral() {
    // Try to refer yourself, should panic
    let env = Env::default();
    let contract_id = env.register(ReferralContract, ());
    let user = Address::generate(&env);
    env.as_contract(&contract_id, || {
        referral::register_referral(env.clone(), user.clone(), user.clone());
    });
}

/// Test that a user can only have one referrer - prevents double referrals
#[test]
#[should_panic(expected = "Referee already has a referrer!")]
fn test_duplicate_referral() {
    // Register a referee with one referrer, then try with another
    let env = Env::default();
    let contract_id = env.register(ReferralContract, ());
    let referrer1 = Address::generate(&env);
    let referrer2 = Address::generate(&env);
    let referee = Address::generate(&env);

    // First referral should work
    env.as_contract(&contract_id, || {
        referral::register_referral(env.clone(), referrer1, referee.clone());
    });
    // Second referral should panic
    env.as_contract(&contract_id, || {
        referral::register_referral(env.clone(), referrer2, referee);
    });
}

/// Test getting a user's referrer - basic lookup
#[test]
fn test_get_referrer() {
    // Register a referral and check the referrer
    let env = Env::default();
    let contract_id = env.register(ReferralContract, ());
    let referrer = Address::generate(&env);
    let referee = Address::generate(&env);

    env.as_contract(&contract_id, || {
        referral::register_referral(env.clone(), referrer.clone(), referee.clone());
    });

    let result = env.as_contract(&contract_id, || {
        referral::get_referrer(env.clone(), referee.clone())
    });
    assert_eq!(result, Some(referrer));
}

/// Test if a user has been referred - useful for UI
#[test]
fn test_has_been_referred() {
    // Check before and after registering a referral
    let env = Env::default();
    let contract_id = env.register(ReferralContract, ());
    let referrer = Address::generate(&env);
    let referee = Address::generate(&env);

    // Should be false before referral
    let result_before = env.as_contract(&contract_id, || {
        referral::has_been_referred(env.clone(), referee.clone())
    });
    assert_eq!(result_before, false);

    // Register referral
    env.as_contract(&contract_id, || {
        referral::register_referral(env.clone(), referrer.clone(), referee.clone());
    });

    // Should be true after referral
    let result_after = env.as_contract(&contract_id, || {
        referral::has_been_referred(env.clone(), referee.clone())
    });
    assert_eq!(result_after, true);
}

/// Test listing all referrals for a referrer - shows who they invited
#[test]
fn test_list_referrals() {
    // Register multiple referees for one referrer
    let env = Env::default();
    let contract_id = env.register(ReferralContract, ());
    let referrer = Address::generate(&env);
    let referee1 = Address::generate(&env);
    let referee2 = Address::generate(&env);

    env.as_contract(&contract_id, || {
        referral::register_referral(env.clone(), referrer.clone(), referee1.clone());
        referral::register_referral(env.clone(), referrer.clone(), referee2.clone());
    });

    let result = env.as_contract(&contract_id, || {
        referral::list_referrals(env.clone(), referrer.clone())
    });
    assert_eq!(result.len(), 2);
    assert!(result.contains(&referee1));
    assert!(result.contains(&referee2));
}

/// Test claiming rewards - user can get their earned rewards
#[test]
fn test_grant_reward() {
    // Register a referral and claim the reward
    let env = Env::default();
    let contract_id = env.register(ReferralContract, ());
    let referrer = Address::generate(&env);
    let referee = Address::generate(&env);

    // Register referral to earn reward
    env.as_contract(&contract_id, || {
        referral::register_referral(env.clone(), referrer.clone(), referee.clone());
    });

    // Check reward before claiming
    let balance_before = env.as_contract(&contract_id, || {
        referral::get_reward_balance(env.clone(), referrer.clone())
    });
    assert_eq!(balance_before, 1);

    // Claim the reward
    env.as_contract(&contract_id, || {
        referral::grant_reward(env.clone(), referrer.clone());
    });

    // Reward should be zero after claiming
    let balance_after = env.as_contract(&contract_id, || {
        referral::get_reward_balance(env.clone(), referrer.clone())
    });
    assert_eq!(balance_after, 0);
}

/// Test circular referral prevention - stops referral loops
#[test]
#[should_panic(expected = "Circular referral detected!")]
fn test_circular_referral() {
    // Try to create a referral loop, should panic
    let env = Env::default();
    let contract_id = env.register(ReferralContract, ());
    let addr1 = Address::generate(&env);
    let addr2 = Address::generate(&env);

    // First referral works
    env.as_contract(&contract_id, || {
        referral::register_referral(env.clone(), addr1.clone(), addr2.clone());
    });
    // Second referral creates a loop, should panic
    env.as_contract(&contract_id, || {
        referral::register_referral(env.clone(), addr2.clone(), addr1.clone());
    });
}

/// Test idempotency - registering the same pair twice should panic
#[test]
#[should_panic(expected = "Referee already has a referrer!")]
fn test_idempotent_registration_panics_on_repeat() {
    // Register a referrer/referee pair, then try again with the same pair
    let env = Env::default();
    let contract_id = env.register(ReferralContract, ());
    let referrer = Address::generate(&env);
    let referee = Address::generate(&env);

    // First registration should work
    env.as_contract(&contract_id, || {
        referral::register_referral(env.clone(), referrer.clone(), referee.clone());
    });

    // Second registration with the same pair should panic
    env.as_contract(&contract_id, || {
        referral::register_referral(env.clone(), referrer.clone(), referee.clone());
    });
}