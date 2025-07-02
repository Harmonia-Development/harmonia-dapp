//! # Comprehensive Test Suite for Delegation System
//!
//! Tests all core functionality including edge cases and error conditions.

#![cfg(test)]

use crate::{DelegationContract, DelegationContractClient, DelegationError};
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
    let (env, client, _admin, member_1, member_2, _member_3, _member_4) = create_test_env();

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
    let (env, client, _admin, member_1, member_2, _member_3, _member_4) = create_test_env();

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
    let (env, client, _admin, member_1, _member_2, _member_3, _member_4) = create_test_env();

    client.set_base_power(&member_1, &10);

    // Attempt self-delegation should fail
    let result = client.try_delegate_votes(&member_1, &member_1);
    assert!(result.is_err());

    // Power should remain unchanged
    assert_eq!(client.get_voting_power(&member_1), 10);
}

#[test]
fn test_multiple_delegators() {
    let (env, client, _admin, member_1, member_2, member_3, member_4) = create_test_env();

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
    let (env, client, _admin, member_1, member_2, member_3, _member_4) = create_test_env();

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
    let (env, client, _admin, member_1, member_2, _member_3, _member_4) = create_test_env();

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
    let (env, client, _admin, member_1, member_2, member_3, _member_4) = create_test_env();

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
    let (env, client, _admin, member_1, member_2, _member_3, _member_4) = create_test_env();

    client.set_base_power(&member_1, &10);
    client.set_base_power(&member_2, &5);

    client.delegate_votes(&member_1, &member_2);

    let member_2_details = client.get_voting_power_details(&member_2);
    assert_eq!(member_2_details.member, member_2);
    assert_eq!(member_2_details.total_power, 15);
}
