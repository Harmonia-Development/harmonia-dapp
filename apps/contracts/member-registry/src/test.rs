#![cfg(test)]

extern crate std;

use crate::{MemberRegistryContract, MemberRegistryContractClient};
use soroban_sdk::{testutils::Address as _, Address, Env, Symbol};

/// Helper to create a test environment
fn create_test_env() -> Env {
    let env = Env::default();
    env.mock_all_auths(); // Enable mock authorizations for testing
    env
}

/// Helper to create contract client
fn create_contract_client(env: &Env) -> MemberRegistryContractClient {
    let contract_id = env.register(MemberRegistryContract, ());
    MemberRegistryContractClient::new(env, &contract_id)
}

#[test]
fn test_initialize_contract() {
    let env = create_test_env();
    let admin = Address::generate(&env);
    let client = create_contract_client(&env);

    client.initialize(&admin);

    assert_eq!(client.get_total_members(), 0);
}

#[test]
fn test_register_member() {
    let env = create_test_env();
    let client = create_contract_client(&env);
    
    let admin = Address::generate(&env);
    let member = Address::generate(&env);
    let role = Symbol::new(&env, "member");

    client.initialize(&admin);
    client.register_member(&admin, &member, &role);

    let registered_member = client.get_member(&member);
    assert_eq!(registered_member.address, member);
    assert_eq!(registered_member.role, role);
    assert_eq!(registered_member.is_active, true);
    assert_eq!(registered_member.voting_power, 1);
    assert_eq!(client.get_total_members(), 1);
}

#[test]
#[should_panic(expected = "Member already registered")]
fn test_prevent_duplicate_registration() {
    let env = create_test_env();
    let client = create_contract_client(&env);
    
    let admin = Address::generate(&env);
    let member = Address::generate(&env);
    let role = Symbol::new(&env, "member");

    client.initialize(&admin);
    client.register_member(&admin, &member, &role);
    client.register_member(&admin, &member, &role); // Should panic
}

#[test]
fn test_update_status() {
    let env = create_test_env();
    let client = create_contract_client(&env);
    
    let admin = Address::generate(&env);
    let member = Address::generate(&env);
    let role = Symbol::new(&env, "member");

    client.initialize(&admin);
    client.register_member(&admin, &member, &role);
    client.update_status(&admin, &member, &false);

    let updated_member = client.get_member(&member);
    assert_eq!(updated_member.is_active, false);
    assert_eq!(client.get_voting_power(&member), 0);
}

#[test]
fn test_update_role() {
    let env = create_test_env();
    let client = create_contract_client(&env);
    
    let admin = Address::generate(&env);
    let member = Address::generate(&env);
    let role = Symbol::new(&env, "member");
    let new_role = Symbol::new(&env, "admin");

    client.initialize(&admin);
    client.register_member(&admin, &member, &role);
    client.update_role(&admin, &member, &new_role);

    let updated_member = client.get_member(&member);
    assert_eq!(updated_member.role, new_role);
    assert_eq!(updated_member.voting_power, 3); // Role-based multiplier for admin
}

#[test]
fn test_role_based_voting_power() {
    let env = create_test_env();
    let client = create_contract_client(&env);
    
    let admin = Address::generate(&env);
    let member = Address::generate(&env);
    let role_member = Symbol::new(&env, "member");
    let role_moderator = Symbol::new(&env, "moderator");
    let role_admin = Symbol::new(&env, "admin");

    client.initialize(&admin);
    client.register_member(&admin, &member, &role_member);
    assert_eq!(client.get_voting_power(&member), 1);

    client.update_role(&admin, &member, &role_moderator);
    assert_eq!(client.get_voting_power(&member), 2);

    client.update_role(&admin, &member, &role_admin);
    assert_eq!(client.get_voting_power(&member), 3);
}

#[test]
fn test_get_total_members() {
    let env = create_test_env();
    let client = create_contract_client(&env);
    
    let admin = Address::generate(&env);
    let member1 = Address::generate(&env);
    let member2 = Address::generate(&env);

    client.initialize(&admin);
    assert_eq!(client.get_total_members(), 0);

    client.register_member(&admin, &member1, &Symbol::new(&env, "member"));
    assert_eq!(client.get_total_members(), 1);

    client.register_member(&admin, &member2, &Symbol::new(&env, "member"));
    assert_eq!(client.get_total_members(), 2);
}

#[test]
#[should_panic(expected = "Only admin can update member status")]
fn test_update_status_non_admin() {
    let env = create_test_env();
    let client = create_contract_client(&env);
    
    let admin = Address::generate(&env);
    let member = Address::generate(&env);
    let target = Address::generate(&env);

    client.initialize(&admin);
    client.register_member(&admin, &member, &Symbol::new(&env, "member"));
    client.register_member(&admin, &target, &Symbol::new(&env, "member"));

    // Attempt to update status as non-admin
    client.update_status(&member, &target, &false);
}

#[test]
#[should_panic(expected = "Only admin can update member role")]
fn test_update_role_non_admin() {
    let env = create_test_env();
    let client = create_contract_client(&env);
    
    let admin = Address::generate(&env);
    let member = Address::generate(&env);
    let target = Address::generate(&env);

    client.initialize(&admin);
    client.register_member(&admin, &member, &Symbol::new(&env, "member"));
    client.register_member(&admin, &target, &Symbol::new(&env, "member"));

    // Attempt to update role as non-admin
    client.update_role(&member, &target, &Symbol::new(&env, "admin"));
}

#[test]
#[should_panic(expected = "Member not found")]
fn test_get_nonexistent_member() {
    let env = create_test_env();
    let client = create_contract_client(&env);
    
    let nonexistent = Address::generate(&env);

    // Attempt to get nonexistent member
    client.get_member(&nonexistent);
}

#[test]
#[should_panic(expected = "Member not found")]
fn test_update_nonexistent_member() {
    let env = create_test_env();
    let client = create_contract_client(&env);
    
    let admin = Address::generate(&env);
    let nonexistent = Address::generate(&env);

    client.initialize(&admin);

    // Attempt to update nonexistent member
    client.update_status(&admin, &nonexistent, &false);
}