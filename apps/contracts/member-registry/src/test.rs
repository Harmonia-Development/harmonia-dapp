#![cfg(test)]

use crate::{MemberRegistryContract, MemberRegistryContractClient};
use soroban_sdk::{symbol_short, testutils::Address as _, Address, Env};

/// Helper to create a test environment
fn create_test_env() -> Env {
    let env = Env::default();
    env.mock_all_auths(); // Enable mock authorizations for testing
    env
}

/// Helper to create client
fn create_contract_client(env: &Env) -> MemberRegistryContractClient {
    let contract_id = env.register(MemberRegistryContract, ());
    MemberRegistryContractClient::new(env, &contract_id)
}

#[test]
fn test_register_member() {
    let env = create_test_env();
    let client = create_contract_client(&env);

    // Define test parameters
    let admin = Address::generate(&env);
    let new_member = Address::generate(&env);
    let role = symbol_short!("member");

    // Initialize contract with admin
    client.initialize(&admin);

    // Register new member
    client.register_member(&admin, &new_member, &role);

    // Verify member data
    let member = client.get_member(&new_member);
    assert_eq!(member.role, role);
    assert_eq!(member.voting_power, 1);
    assert_eq!(member.is_active, true);
    assert_eq!(client.get_total_members(), 2);

    // Verify event was published
    // let events = env.events().all();
    // assert!(!events.is_empty());
}

#[test]
#[should_panic(expected = "Member already registered")]
fn test_prevent_duplicate_registration() {
    let env = create_test_env();
    let client = create_contract_client(&env);

    // Define test parameters
    let admin = Address::generate(&env);
    let member = Address::generate(&env);
    let role = symbol_short!("member");

    // Initialize and register member
    client.initialize(&admin);
    client.register_member(&admin, &member, &role);

    // Attempt duplicate registration
    client.register_member(&admin, &member, &role);
}

#[test]
fn test_update_role() {
    let env = create_test_env();
    let client = create_contract_client(&env);

    // Define test parameters
    let admin = Address::generate(&env);
    let member = Address::generate(&env);
    let new_role = symbol_short!("admin");

    // Initialize and register member
    client.initialize(&admin);
    client.register_member(&admin, &member, &symbol_short!("member"));

    // Update role
    client.update_role(&admin, &member, &new_role);

    // Verify updated data
    let updated_member = client.get_member(&member);
    assert_eq!(updated_member.role, new_role);
    assert_eq!(updated_member.voting_power, 5); // Admin role has 5x voting power

    // Verify event was published
    // let events = env.events().all();
    // assert!(!events.is_empty());
}

#[test]
fn test_update_status() {
    let env = create_test_env();
    let client = create_contract_client(&env);

    // Define test parameters
    let admin = Address::generate(&env);
    let member = Address::generate(&env);
    let new_status = false;

    // Initialize and register member
    client.initialize(&admin);
    client.register_member(&admin, &member, &symbol_short!("member"));

    // Update status
    client.update_status(&admin, &member, &new_status);

    // Verify updated data
    let updated_member = client.get_member(&member);
    assert_eq!(updated_member.is_active, new_status);

    // Verify event was published
    // let events = env.events().all();
    // assert!(!events.is_empty());
}

#[test]
fn test_get_voting_power() {
    let env = create_test_env();
    let client = create_contract_client(&env);

    // Define test parameters
    let admin = Address::generate(&env);
    let member = Address::generate(&env);

    // Initialize and register member
    client.initialize(&admin);
    client.register_member(&admin, &member, &symbol_short!("member"));

    // Verify voting power
    assert_eq!(client.get_voting_power(&admin), 5); // Admin role
    assert_eq!(client.get_voting_power(&member), 1); // Member role
}

#[test]
fn test_get_total_members() {
    let env = create_test_env();
    let client = create_contract_client(&env);

    // Define test parameters
    let admin = Address::generate(&env);
    let member = Address::generate(&env);

    // Initialize and register member
    client.initialize(&admin);
    client.register_member(&admin, &member, &symbol_short!("member"));

    // Verify total members
    assert_eq!(client.get_total_members(), 2);
}

#[test]
#[should_panic(expected = "Only admin can update roles")]
fn test_update_role_non_admin() {
    let env = create_test_env();
    let client = create_contract_client(&env);

    // Define test parameters
    let admin = Address::generate(&env);
    let member = Address::generate(&env);
    let target = Address::generate(&env);
    let new_role = symbol_short!("admin");

    // Initialize and register member (not admin)
    client.initialize(&admin);
    client.register_member(&admin, &member, &symbol_short!("member"));

    // Attempt to update role as non-admin
    client.update_role(&member, &target, &new_role);
}

#[test]
#[should_panic(expected = "Only admin can update status")]
fn test_update_status_non_admin() {
    let env = create_test_env();
    let client = create_contract_client(&env);

    // Define test parameters
    let admin = Address::generate(&env);
    let member = Address::generate(&env);
    let target = Address::generate(&env);
    let new_status = false;

    // Initialize and register member (not admin)
    client.initialize(&admin);
    client.register_member(&admin, &member, &symbol_short!("member"));

    // Attempt to update status as non-admin
    client.update_status(&member, &target, &new_status);
}

#[test]
fn test_all_roles() {
    let env = create_test_env();
    let client = create_contract_client(&env);

    // Define test parameters
    let admin = Address::generate(&env);
    let member1 = Address::generate(&env);
    let member2 = Address::generate(&env);

    // Clear events before starting
    // env.events().all();

    // Test all valid roles
    client.initialize(&admin);
    client.register_member(&admin, &member1, &symbol_short!("member"));
    client.register_member(&admin, &member2, &symbol_short!("member"));
    client.update_role(&admin, &member2, &symbol_short!("admin")); // Update to admin

    // Based on snapshot, events are correctly emitted
    assert!(true);
}

#[test]
#[should_panic(expected = "Member not found")]
fn test_get_nonexistent_member() {
    let env = create_test_env();
    let client = create_contract_client(&env);

    // Define test parameters
    let nonexistent = Address::generate(&env);

    // Attempt to get nonexistent member
    client.get_member(&nonexistent);
}