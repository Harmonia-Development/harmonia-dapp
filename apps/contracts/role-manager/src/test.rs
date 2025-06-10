#![cfg(test)]

use super::{RoleManagerContract, RoleManagerContractClient};
use soroban_sdk::{log, symbol_short, testutils::Address as _, vec, Address, Env, Symbol};

#[test]
fn test_initialization() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(RoleManagerContract, ());
    let client = RoleManagerContractClient::new(&env, &contract_id);

    // Initialize with admin
    let admin = Address::generate(&env);
    client.initialize(&admin);

    // Verify initial roles are defined
    let defined_roles = client.get_defined_roles();
    log!(&env, "Initial defined roles: {:?}", defined_roles);
    assert!(defined_roles.contains(&symbol_short!("admin")));
    assert!(defined_roles.contains(&symbol_short!("contrib")));
    assert!(defined_roles.contains(&symbol_short!("review")));

    // Verify admin has all default roles
    let admin_roles = client.get_roles(&admin);
    log!(&env, "Admin roles after initialization: {:?}", admin_roles);
    assert!(client.has_role(&admin, &symbol_short!("admin")));
    assert!(client.has_role(&admin, &symbol_short!("contrib")));
    assert!(client.has_role(&admin, &symbol_short!("review")));
    assert_eq!(admin_roles.len(), 3);
}

#[test]
fn test_define_role() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(RoleManagerContract, ());
    let client = RoleManagerContractClient::new(&env, &contract_id);

    // Initialize with admin
    let admin = Address::generate(&env);
    client.initialize(&admin);

    // Define a new role
    let new_role = Symbol::new(&env, "moderator");
    client.define_role(&admin, &new_role);

    // Verify the new role is defined
    let defined_roles = client.get_defined_roles();
    log!(
        &env,
        "Defined roles after adding moderator: {:?}",
        defined_roles
    );
    assert!(defined_roles.contains(&new_role));
}

#[test]
fn test_assign_role() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(RoleManagerContract, ());
    let client = RoleManagerContractClient::new(&env, &contract_id);

    // Initialize with admin
    let admin = Address::generate(&env);
    client.initialize(&admin);

    let user = Address::generate(&env);
    let contributor_role = symbol_short!("contrib");

    // Assign role to user
    client.assign_role(&user, &contributor_role);

    // Verify role assignment
    let user_roles = client.get_roles(&user);
    log!(&env, "User roles after assignment: {:?}", user_roles);
    assert!(client.has_role(&user, &contributor_role));
    assert_eq!(user_roles.len(), 1);
}

#[test]
fn test_revoke_role() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(RoleManagerContract, ());
    let client = RoleManagerContractClient::new(&env, &contract_id);

    // Initialize with admin
    let admin = Address::generate(&env);
    client.initialize(&admin);

    let user = Address::generate(&env);
    let contributor_role = symbol_short!("contrib");

    // Assign role first
    client.assign_role(&user, &contributor_role);
    assert!(client.has_role(&user, &contributor_role));

    // Revoke role
    client.revoke_role(&user, &contributor_role);

    // Verify role revocation
    let user_roles = client.get_roles(&user);
    log!(&env, "User roles after revocation: {:?}", user_roles);
    assert!(!client.has_role(&user, &contributor_role));
    assert_eq!(user_roles.len(), 0);
}

#[test]
fn test_has_any_role() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(RoleManagerContract, ());
    let client = RoleManagerContractClient::new(&env, &contract_id);

    // Initialize with admin
    let admin = Address::generate(&env);
    client.initialize(&admin);

    let user = Address::generate(&env);
    let contributor_role = symbol_short!("contrib");
    let review_role = symbol_short!("review");

    // Assign roles to user
    client.assign_role(&user, &contributor_role);
    client.assign_role(&user, &review_role);

    // Test has_any_role with roles the user has
    let roles_to_check = vec![&env, contributor_role, review_role];
    log!(&env, "Roles to check: {:?}", roles_to_check);
    assert!(client.has_any_role(&user, &roles_to_check));

    // Test has_any_role with a role the user doesn't have
    let admin_role = symbol_short!("admin");
    let roles_to_check = vec![&env, admin_role];
    assert!(!client.has_any_role(&user, &roles_to_check));
}

#[test]
#[should_panic(expected = "Admin access required")]
fn test_admin_restriction_define_role() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(RoleManagerContract, ());
    let client = RoleManagerContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let non_admin = Address::generate(&env);
    client.initialize(&admin);

    // Non-admin should not be able to define roles
    let new_role = Symbol::new(&env, "moderator");
    client.define_role(&non_admin, &new_role);
}

#[test]
#[should_panic(expected = "Role not defined")]
fn test_assign_undefined_role() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(RoleManagerContract, ());
    let client = RoleManagerContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let user = Address::generate(&env);
    client.initialize(&admin);

    // Try to assign an undefined role
    let undefined_role = Symbol::new(&env, "undefined");
    client.assign_role(&user, &undefined_role);
}
