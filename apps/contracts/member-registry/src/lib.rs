#![no_std]
use soroban_sdk::{contract, contractimpl, Address, Env, Symbol};

mod admin;
mod test;
mod types;

pub use admin::*;
pub use types::*;

#[contract]
pub struct MemberRegistryContract;

#[contractimpl]
impl MemberRegistryContract {
    // Initialize the contract
    pub fn initialize(env: Env, admin: Address) {
        admin::initialize(env, admin);
    }

    // Register a new member
    pub fn register_member(env: Env, caller: Address, address: Address, role: Symbol) {
        caller.require_auth();

        // Verify caller is admin or existing member
        if !admin::is_admin(&env, &caller) && !Self::is_member(&env, &caller) {
            panic!("Only admin or existing members can register new members");
        }

        // Prevent duplicate registrations
        if env
            .storage()
            .instance()
            .has(&DataKey::Member(address.clone()))
        {
            panic!("Member already registered");
        }

        let member = Member {
            address: address.clone(),
            role: role.clone(), // Clone to avoid moving
            is_active: true,
            voting_power: 1, // Default voting power
            joined_at: env.ledger().timestamp(),
        };

        // Store member data
        env.storage()
            .instance()
            .set(&DataKey::Member(address.clone()), &member);

        // Update total members
        let total_members: u32 = env
            .storage()
            .instance()
            .get(&DataKey::TotalMembers)
            .unwrap_or(0);
        env.storage()
            .instance()
            .set(&DataKey::TotalMembers, &(total_members + 1));

        // Emit event
        env.events()
            .publish(("MemberRegistry", "member_registered"), (address, role));
    }

    // Update member status
    pub fn update_status(env: Env, caller: Address, address: Address, status: bool) {
        caller.require_auth();

        // Only admin can update status
        if !admin::is_admin(&env, &caller) {
            panic!("Only admin can update member status");
        }

        let mut member: Member = env
            .storage()
            .instance()
            .get(&DataKey::Member(address.clone()))
            .unwrap_or_else(|| panic!("Member not found"));
        member.is_active = status;
        env.storage()
            .instance()
            .set(&DataKey::Member(address.clone()), &member);

        // Emit event
        env.events()
            .publish(("MemberRegistry", "status_changed"), (address, status));
    }

    // Update member role
    pub fn update_role(env: Env, caller: Address, address: Address, role: Symbol) {
        caller.require_auth();

        // Only admin can update role
        if !admin::is_admin(&env, &caller) {
            panic!("Only admin can update member role");
        }

        let mut member: Member = env
            .storage()
            .instance()
            .get(&DataKey::Member(address.clone()))
            .unwrap_or_else(|| panic!("Member not found"));
        member.role = role.clone();

        // Bonus: Role-based power multipliers
        member.voting_power = if role == Symbol::new(&env, "admin") {
            3
        } else if role == Symbol::new(&env, "moderator") {
            2
        } else {
            1
        };

        env.storage()
            .instance()
            .set(&DataKey::Member(address.clone()), &member);

        // Emit event
        env.events()
            .publish(("MemberRegistry", "role_updated"), (address, role));
    }

    // Get member details
    pub fn get_member(env: Env, address: Address) -> Member {
        env.storage()
            .instance()
            .get(&DataKey::Member(address))
            .unwrap_or_else(|| panic!("Member not found"))
    }

    // Get member voting power
    pub fn get_voting_power(env: Env, address: Address) -> u32 {
        let member: Member = env
            .storage()
            .instance()
            .get(&DataKey::Member(address))
            .unwrap_or_else(|| panic!("Member not found"));
        if !member.is_active {
            return 0;
        }
        member.voting_power
    }

    // Get total number of members
    pub fn get_total_members(env: Env) -> u32 {
        env.storage()
            .instance()
            .get(&DataKey::TotalMembers)
            .unwrap_or(0)
    }

    // Helper function to check if address is a member
    fn is_member(env: &Env, address: &Address) -> bool {
        env.storage()
            .instance()
            .has(&DataKey::Member(address.clone()))
    }
}
