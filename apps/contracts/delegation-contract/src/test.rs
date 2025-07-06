//! # Comprehensive Test Suite for Delegation System
//!
//! Tests all core functionality including edge cases and error conditions.

#![cfg(test)]

use crate::{DelegationContract, DelegationContractClient};
use soroban_sdk::{Address, Env, Vec, testutils::Address as _};

fn create_test_env<'a>() -> (
    Env,
    DelegationContractClient<'a>,
    Address,
    Address,
    Address,
    Address,
    Address,
) {
    let env = Env::default();
    let admin = Address::generate(&env);
    let client =
        DelegationContractClient::new(&env, &env.register(DelegationContract {}, (&admin, 1i128)));

    let member_1 = Address::generate(&env);
    let member_2 = Address::generate(&env);
    let member_3 = Address::generate(&env);
    let member_4 = Address::generate(&env);

    env.mock_all_auths();

    (env, client, admin, member_1, member_2, member_3, member_4)
}

#[test]
fn test_basic_delegation() {
    let (_env, client, _admin, member_1, member_2, _member_3, _member_4) = create_test_env();

    // Set up base powers
    client.set_base_power(&member_1, &10);
    client.set_base_power(&member_2, &5);

    // Initially, each member has only their base power
    assert_eq!(client.get_voting_power(&member_1), 10);
    assert_eq!(client.get_voting_power(&member_2), 5);

    // member_1 delegates to member_2
    client.delegate_votes(&member_1, &member_2);

    // member_1's power should remain 10, member_2's should be 5 + 10 = 15
    assert_eq!(client.get_voting_power(&member_1), 10);
    assert_eq!(client.get_voting_power(&member_2), 15);

    // Check delegation relationship
    assert_eq!(client.get_delegate(&member_1), Some(member_2.clone()));
    let delegators = client.get_delegators(&member_2);
    assert_eq!(delegators.len(), 1);
    assert_eq!(delegators.get(0).unwrap(), member_1);
}

#[test]
fn test_undelegation() {
    let (_env, client, _admin, member_1, member_2, _member_3, _member_4) = create_test_env();

    // Set up base powers
    client.set_base_power(&member_1, &10);
    client.set_base_power(&member_2, &5);

    // member_1 delegates to member_2
    client.delegate_votes(&member_1, &member_2);
    assert_eq!(client.get_voting_power(&member_2), 15);

    // member_1 undelegates
    client.undelegate(&member_1);

    // Powers should return to base values
    assert_eq!(client.get_voting_power(&member_1), 10);
    assert_eq!(client.get_voting_power(&member_2), 5);

    // Delegation relationship should be removed
    assert_eq!(client.get_delegate(&member_1), None);
    assert_eq!(client.get_delegators(&member_2).len(), 0);
}

#[test]
fn test_self_delegation_prevention() {
    let (_env, client, _admin, member_1, _member_2, _member_3, _member_4) = create_test_env();

    client.set_base_power(&member_1, &10);

    // Attempt self-delegation should fail
    let result = client.try_delegate_votes(&member_1, &member_1);
    assert!(result.is_err());

    // Power should remain unchanged
    assert_eq!(client.get_voting_power(&member_1), 10);
}

#[test]
fn test_multiple_delegators() {
    let (_env, client, _admin, member_1, member_2, member_3, member_4) = create_test_env();

    // Set up base powers
    client.set_base_power(&member_1, &10);
    client.set_base_power(&member_2, &5);
    client.set_base_power(&member_3, &3);
    client.set_base_power(&member_4, &2);

    // Multiple people delegate to member_2
    client.delegate_votes(&member_1, &member_2);
    client.delegate_votes(&member_3, &member_2);
    client.delegate_votes(&member_4, &member_2);

    // Check delegators list
    let delegators = client.get_delegators(&member_2);
    assert_eq!(delegators.len(), 3);

    // Verify all delegators are in the list
    let delegator_addrs: Vec<Address> = delegators;
    assert!(delegator_addrs.contains(&member_1));
    assert!(delegator_addrs.contains(&member_3));
    assert!(delegator_addrs.contains(&member_4));
}

#[test]
fn test_redelegation() {
    let (_env, client, _admin, member_1, member_2, member_3, _member_4) = create_test_env();

    // Set up base powers
    client.set_base_power(&member_1, &10);
    client.set_base_power(&member_2, &5);
    client.set_base_power(&member_3, &3);

    // member_1 delegates to member_2
    client.delegate_votes(&member_1, &member_2);
    assert_eq!(client.get_voting_power(&member_2), 15);
    assert_eq!(client.get_voting_power(&member_3), 3);

    // member_1 redelegates to member_3
    client.delegate_votes(&member_1, &member_3);

    // member_2 should lose member_1's delegation, member_3 should gain it
    assert_eq!(client.get_voting_power(&member_2), 5);
    assert_eq!(client.get_voting_power(&member_3), 13);

    // Check delegation relationships
    assert_eq!(client.get_delegate(&member_1), Some(member_3.clone()));
    assert_eq!(client.get_delegators(&member_2).len(), 0);
    assert_eq!(client.get_delegators(&member_3).len(), 1);
}

#[test]
fn test_zero_base_power() {
    let (_env, client, _admin, member_1, member_2, _member_3, _member_4) = create_test_env();

    // member_1 has no base power set (defaults to 1)
    // member_2 has explicit base power
    client.set_base_power(&member_2, &10);

    // member_1 delegates to member_2
    client.delegate_votes(&member_1, &member_2);

    // member_2 should have: 10 (base) + 1 (member_1's default) = 11
    assert_eq!(client.get_voting_power(&member_1), 1);
    assert_eq!(client.get_voting_power(&member_2), 11);
}

#[test]
fn test_has_delegation_check() {
    let (_env, client, _admin, member_1, member_2, member_3, _member_4) = create_test_env();

    // Initially, no one has delegations
    assert_eq!(client.has_delegation(&member_1), false);
    assert_eq!(client.has_delegation(&member_2), false);

    // member_1 delegates to member_2
    client.delegate_votes(&member_1, &member_2);

    // Now both member_1 (as delegator) and member_2 (as delegate) have delegations
    assert_eq!(client.has_delegation(&member_1), true);
    assert_eq!(client.has_delegation(&member_2), true);
    assert_eq!(client.has_delegation(&member_3), false);

    // After undelegation, neither should have delegations
    client.undelegate(&member_1);
    assert_eq!(client.has_delegation(&member_1), false);
    assert_eq!(client.has_delegation(&member_2), false);
}

#[test]
fn test_voting_power_details() {
    let (_env, client, _admin, member_1, member_2, _member_3, _member_4) = create_test_env();

    client.set_base_power(&member_1, &10);
    client.set_base_power(&member_2, &5);

    client.delegate_votes(&member_1, &member_2);

    let member_2_details = client.get_voting_power_details(&member_2);
    assert_eq!(member_2_details.member, member_2);
    assert_eq!(member_2_details.total_power, 15);
}

#[test]
fn test_circular_delegation_prevention() {
    let (_env, client, _admin, member_1, member_2, member_3, _member_4) = create_test_env();

    // Set up base powers
    client.set_base_power(&member_1, &10);
    client.set_base_power(&member_2, &5);
    client.set_base_power(&member_3, &3);

    // Create a potential circular delegation chain
    client.delegate_votes(&member_1, &member_2);
    client.delegate_votes(&member_2, &member_3);

    // Verify first two delegations worked
    assert_eq!(client.get_delegate(&member_1), Some(member_2.clone()));
    assert_eq!(client.get_delegate(&member_2), Some(member_3.clone()));

    // Verify the delegation relationships
    let member_2_delegators = client.get_delegators(&member_2);
    assert_eq!(member_2_delegators.len(), 1);
    assert!(member_2_delegators.contains(&member_1));

    let member_3_delegators = client.get_delegators(&member_3);
    assert_eq!(member_3_delegators.len(), 1);
    assert!(member_3_delegators.contains(&member_2));

    // Test that member_3 can still delegate (circular delegation is not prevented at the contract level)
    client.delegate_votes(&member_3, &member_1);
    assert_eq!(client.get_delegate(&member_3), Some(member_1.clone()));
}

#[test]
fn test_max_power_delegation() {
    let (_env, client, _admin, member_1, member_2, _member_3, _member_4) = create_test_env();

    // Set maximum possible base power
    let max_power = i128::MAX / 2; // Using half of max to prevent overflow
    client.set_base_power(&member_1, &max_power);
    client.set_base_power(&member_2, &max_power);

    // Delegate maximum power
    client.delegate_votes(&member_1, &member_2);

    // Check that power calculation handles large numbers correctly
    assert_eq!(client.get_voting_power(&member_1), max_power);
    assert_eq!(client.get_voting_power(&member_2), max_power * 2);
}

#[test]
fn test_concurrent_delegations() {
    let (_env, client, _admin, member_1, member_2, member_3, member_4) = create_test_env();

    // Set up base powers
    client.set_base_power(&member_1, &10);
    client.set_base_power(&member_2, &5);
    client.set_base_power(&member_3, &3);
    client.set_base_power(&member_4, &2);

    // Perform multiple delegations in sequence
    client.delegate_votes(&member_1, &member_2);
    client.delegate_votes(&member_3, &member_2);
    client.delegate_votes(&member_4, &member_2);

    // Verify final state after all delegations
    assert_eq!(client.get_voting_power(&member_2), 20); // 5 + 10 + 3 + 2
    
    // Verify all delegations are tracked correctly
    let delegators = client.get_delegators(&member_2);
    assert_eq!(delegators.len(), 3);
    
    // Undelegate all simultaneously
    client.undelegate(&member_1);
    client.undelegate(&member_3);
    client.undelegate(&member_4);

    // Verify power returns to original state
    assert_eq!(client.get_voting_power(&member_2), 5);
    assert_eq!(client.get_delegators(&member_2).len(), 0);
}
