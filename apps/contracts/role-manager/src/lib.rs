#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, vec, Address, Env, Symbol, Vec};

mod test;

#[contract]
pub struct RoleManagerContract;

#[contractimpl]
impl RoleManagerContract {
    // Initialize contract with default roles
    pub fn initialize(env: Env, admin: Address) {
        // Define default roles
        let admin_role = symbol_short!("admin");
        let contrib_role = symbol_short!("contrib");
        let review_role = symbol_short!("review");

        // Store defined roles
        let defined_roles: Vec<Symbol> = vec![
            &env,
            admin_role.clone(),
            contrib_role.clone(),
            review_role.clone(),
        ];
        env.storage()
            .persistent()
            .set(&symbol_short!("roles"), &defined_roles);

        // Directly assign all default roles to the admin
        let admin_roles: Vec<Symbol> = vec![&env, admin_role.clone(), contrib_role, review_role];
        env.storage()
            .persistent()
            .set(&Self::roles_key(&admin), &admin_roles);

        env.events()
            .publish((symbol_short!("assigned"), admin, admin_role), ());
    }

    // Define a new role (admin-only)
    pub fn define_role(env: Env, caller: Address, role: Symbol) {
        caller.require_auth(); // Ensure the caller authorizes this transaction
        Self::restrict_to_admin(&env, &caller);
        let mut defined_roles: Vec<Symbol> = env
            .storage()
            .persistent()
            .get(&symbol_short!("roles"))
            .unwrap_or(vec![&env]);

        if !defined_roles.contains(&role) {
            defined_roles.push_back(role.clone());
            env.storage()
                .persistent()
                .set(&symbol_short!("roles"), &defined_roles);

            env.events().publish((symbol_short!("defined"), role), ());
        }
    }

    // Assign a role to an address
    pub fn assign_role(env: Env, target: Address, role: Symbol) {
        // Verify role exists
        let defined_roles: Vec<Symbol> = env
            .storage()
            .persistent()
            .get(&symbol_short!("roles"))
            .unwrap_or(vec![&env]);
        if !defined_roles.contains(&role) {
            panic!("Role not defined");
        }

        let mut user_roles: Vec<Symbol> = env
            .storage()
            .persistent()
            .get(&Self::roles_key(&target))
            .unwrap_or(vec![&env]);

        if !user_roles.contains(&role) {
            user_roles.push_back(role.clone());
            env.storage()
                .persistent()
                .set(&Self::roles_key(&target), &user_roles);

            env.events()
                .publish((symbol_short!("assigned"), target, role), ());
        }
    }

    // Revoke a role from an address
    pub fn revoke_role(env: Env, target: Address, role: Symbol) {
        let mut user_roles: Vec<Symbol> = env
            .storage()
            .persistent()
            .get(&Self::roles_key(&target))
            .unwrap_or(vec![&env]);

        if let Some(index) = user_roles.iter().position(|r| r == role) {
            user_roles.remove(index as u32);
            env.storage()
                .persistent()
                .set(&Self::roles_key(&target), &user_roles);

            env.events()
                .publish((symbol_short!("revoked"), target, role), ());
        }
    }

    // Check if an address has a specific role
    pub fn has_role(env: Env, target: Address, role: Symbol) -> bool {
        let user_roles: Vec<Symbol> = env
            .storage()
            .persistent()
            .get(&Self::roles_key(&target))
            .unwrap_or(vec![&env]);
        user_roles.contains(&role)
    }

    // Get all roles for an address
    pub fn get_roles(env: Env, target: Address) -> Vec<Symbol> {
        env.storage()
            .persistent()
            .get(&Self::roles_key(&target))
            .unwrap_or(vec![&env])
    }

    // Bonus: Check if address has any of the specified roles
    pub fn has_any_role(env: Env, target: Address, roles: Vec<Symbol>) -> bool {
        let user_roles: Vec<Symbol> = env
            .storage()
            .persistent()
            .get(&Self::roles_key(&target))
            .unwrap_or(vec![&env]);

        for role in roles.iter() {
            if user_roles.contains(&role) {
                return true;
            }
        }
        false
    }

    // Helper: Generate storage key for roles
    fn roles_key(target: &Address) -> (Symbol, Address) {
        (symbol_short!("r"), target.clone())
    }

    // Helper: Restrict function to admin role
    fn restrict_to_admin(env: &Env, caller: &Address) {
        if !Self::has_role(env.clone(), caller.clone(), symbol_short!("admin")) {
            panic!("Admin access required");
        }
    }

    // Get all defined roles in the system
    pub fn get_defined_roles(env: Env) -> Vec<Symbol> {
        env.storage()
            .persistent()
            .get(&symbol_short!("roles"))
            .unwrap_or(vec![&env])
    }
}
