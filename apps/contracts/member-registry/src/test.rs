#![cfg(test)]

extern crate std;

use crate::{MemberRegistryContract, MemberRegistryContractClient};
use soroban_sdk::{testutils::Address as _, Address, Env, Symbol};

#[test]
fn test_initialize_contract() {
    let env = Env::default();
    let admin = Address::generate(&env);

    let contract_address = env.register(MemberRegistryContract, ()); // No constructor arguments
    let contract_client = MemberRegistryContractClient::new(&env, &contract_address);

    env.mock_all_auths();
    contract_client.initialize(&admin);

    assert_eq!(contract_client.get_total_members(), 0);
}

#[test]
fn test_register_member() {
    let env = Env::default();
    let admin = Address::generate(&env);
    let member = Address::generate(&env);
    let role = Symbol::new(&env, "member");

    let contract_address = env.register(MemberRegistryContract, ()); // No constructor arguments
    let contract_client = MemberRegistryContractClient::new(&env, &contract_address);

    env.mock_all_auths();
    contract_client.initialize(&admin);
    contract_client.register_member(&admin, &member, &role);

    let registered_member = contract_client.get_member(&member);
    assert_eq!(registered_member.address, member);
    assert_eq!(registered_member.role, role);
    assert_eq!(registered_member.is_active, true);
    assert_eq!(registered_member.voting_power, 1);
    assert_eq!(contract_client.get_total_members(), 1);
}

#[test]
#[should_panic(expected = "Member already registered")]
fn test_prevent_duplicate_registration() {
    let env = Env::default();
    let admin = Address::generate(&env);
    let member = Address::generate(&env);
    let role = Symbol::new(&env, "member");

    let contract_address = env.register(MemberRegistryContract, ()); // No constructor arguments
    let contract_client = MemberRegistryContractClient::new(&env, &contract_address);

    env.mock_all_auths();
    contract_client.initialize(&admin);
    contract_client.register_member(&admin, &member, &role);
    contract_client.register_member(&admin, &member, &role); // Should panic
}

#[test]
fn test_update_status() {
    let env = Env::default();
    let admin = Address::generate(&env);
    let member = Address::generate(&env);
    let role = Symbol::new(&env, "member");

    let contract_address = env.register(MemberRegistryContract, ()); // No constructor arguments
    let contract_client = MemberRegistryContractClient::new(&env, &contract_address);

    env.mock_all_auths();
    contract_client.initialize(&admin);
    contract_client.register_member(&admin, &member, &role);
    contract_client.update_status(&admin, &member, &false);

    let updated_member = contract_client.get_member(&member);
    assert_eq!(updated_member.is_active, false);
    assert_eq!(contract_client.get_voting_power(&member), 0);
}

#[test]
fn test_update_role() {
    let env = Env::default();
    let admin = Address::generate(&env);
    let member = Address::generate(&env);
    let role = Symbol::new(&env, "member");
    let new_role = Symbol::new(&env, "admin");

    let contract_address = env.register(MemberRegistryContract, ()); // No constructor arguments
    let contract_client = MemberRegistryContractClient::new(&env, &contract_address);

    env.mock_all_auths();
    contract_client.initialize(&admin);
    contract_client.register_member(&admin, &member, &role);
    contract_client.update_role(&admin, &member, &new_role);

    let updated_member = contract_client.get_member(&member);
    assert_eq!(updated_member.role, new_role);
    assert_eq!(updated_member.voting_power, 3); // Role-based multiplier for admin
}

#[test]
fn test_role_based_voting_power() {
    let env = Env::default();
    let admin = Address::generate(&env);
    let member = Address::generate(&env);
    let role_member = Symbol::new(&env, "member");
    let role_moderator = Symbol::new(&env, "moderator");
    let role_admin = Symbol::new(&env, "admin");

    let contract_address = env.register(MemberRegistryContract, ()); // No constructor arguments
    let contract_client = MemberRegistryContractClient::new(&env, &contract_address);

    env.mock_all_auths();
    contract_client.initialize(&admin);
    contract_client.register_member(&admin, &member, &role_member);
    assert_eq!(contract_client.get_voting_power(&member), 1);

    contract_client.update_role(&admin, &member, &role_moderator);
    assert_eq!(contract_client.get_voting_power(&member), 2);

    contract_client.update_role(&admin, &member, &role_admin);
    assert_eq!(contract_client.get_voting_power(&member), 3);
}
