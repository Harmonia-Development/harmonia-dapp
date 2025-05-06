use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env, Symbol};

#[contracttype]
#[derive(Clone, Debug)]
pub struct Member {
    pub address: Address,
    pub role: Symbol,
    pub is_active: bool,
    pub voting_power: u32,
    pub joined_at: u64,
}

#[contracttype]
pub enum DataKey {
    Member(Address),
    TotalMembers,
    IsInitialized,
}

#[contracttype]
pub struct MemberRegisteredEvent {
    pub member: Address,
    pub role: Symbol,
    pub voting_power: u32,
}

#[contracttype]
pub struct RoleUpdatedEvent {
    pub member: Address,
    pub new_role: Symbol,
}

#[contracttype]
pub struct StatusChangedEvent {
    pub member: Address,
    pub is_active: bool,
}

#[contract]
pub struct MemberRegistryContract;

#[contractimpl]
impl MemberRegistryContract {
    pub fn initialize(env: Env, admin: Address) {
        admin.require_auth();

        // Check if already initialized
        if env.storage().persistent().has(&DataKey::IsInitialized) {
            panic!("Contract already initialized");
        }

        // Create admin member
        let timestamp = env.ledger().timestamp();
        let admin_member = Member {
            address: admin.clone(),
            role: symbol_short!("admin"),
            is_active: true,
            voting_power: Self::calculate_voting_power(&symbol_short!("admin")),
            joined_at: timestamp,
        };

        // Store admin member
        env.storage()
            .persistent()
            .set(&DataKey::Member(admin.clone()), &admin_member);

        // Set total members to 1
        env.storage().persistent().set(&DataKey::TotalMembers, &1u32);

        // Mark as initialized
        env.storage().persistent().set(&DataKey::IsInitialized, &true);

        // Emit event
        env.events().publish(
            (symbol_short!("mem_reg"),),
            MemberRegisteredEvent {
                member: admin,
                role: symbol_short!("admin"),
                voting_power: admin_member.voting_power,
            },
        );
    }

    pub fn register_member(env: Env, caller: Address, address: Address, role: Symbol) {
        caller.require_auth();

        // Check if contract is initialized
        if !env.storage().persistent().has(&DataKey::IsInitialized) {
            panic!("Contract not initialized");
        }

        // Check if caller is a member or admin
        let caller_member = Self::get_member(env.clone(), caller.clone());
        if !caller_member.is_active || (caller_member.role != symbol_short!("admin") && caller_member.role != symbol_short!("member")) {
            panic!("Caller must be an active member or admin");
        }

        // Prevent duplicate registration
        if env.storage().persistent().has(&DataKey::Member(address.clone())) {
            panic!("Member already registered");
        }

        // Create new member
        let timestamp = env.ledger().timestamp();
        let new_member = Member {
            address: address.clone(),
            role: role.clone(),
            is_active: true,
            voting_power: Self::calculate_voting_power(&role),
            joined_at: timestamp,
        };

        // Store member
        env.storage()
            .persistent()
            .set(&DataKey::Member(address.clone()), &new_member);

        // Increment total members
        let total_members = Self::get_total_members(env.clone());
        env.storage()
            .persistent()
            .set(&DataKey::TotalMembers, &(total_members + 1));

        // Emit event
        env.events().publish(
            (symbol_short!("mem_reg"),),
            MemberRegisteredEvent {
                member: address,
                role,
                voting_power: new_member.voting_power,
            },
        );
    }

    pub fn update_status(env: Env, caller: Address, address: Address, status: bool) {
        caller.require_auth();

        // Only admin can update status
        let caller_member = Self::get_member(env.clone(), caller);
        if caller_member.role != symbol_short!("admin") {
            panic!("Only admin can update status");
        }

        let mut member = Self::get_member(env.clone(), address.clone());
        member.is_active = status;

        env.storage()
            .persistent()
            .set(&DataKey::Member(address.clone()), &member);

        // Emit event
        env.events().publish(
            (symbol_short!("stat_chg"),),
            StatusChangedEvent {
                member: address,
                is_active: status,
            },
        );
    }

    pub fn update_role(env: Env, caller: Address, address: Address, role: Symbol) {
        caller.require_auth();

        // Only admin can update roles
        let caller_member = Self::get_member(env.clone(), caller);
        if caller_member.role != symbol_short!("admin") {
            panic!("Only admin can update roles");
        }

        let mut member = Self::get_member(env.clone(), address.clone());
        member.role = role.clone();
        member.voting_power = Self::calculate_voting_power(&role);

        env.storage()
            .persistent()
            .set(&DataKey::Member(address.clone()), &member);

        // Emit event
        env.events().publish(
            (symbol_short!("role_upd"),),
            RoleUpdatedEvent {
                member: address,
                new_role: role,
            },
        );
    }

    pub fn get_member(env: Env, address: Address) -> Member {
        match env.storage().persistent().get(&DataKey::Member(address)) {
            Some(member) => member,
            None => panic!("Member not found"),
        }
    }

    pub fn get_voting_power(env: Env, address: Address) -> u32 {
        Self::get_member(env, address).voting_power
    }

    pub fn get_total_members(env: Env) -> u32 {
        env.storage()
            .persistent()
            .get(&DataKey::TotalMembers)
            .unwrap_or(0)
    }

    // Bonus: Role-based power multipliers
    fn calculate_voting_power(role: &Symbol) -> u32 {
        if *role == symbol_short!("admin") {
            5 // Admins get 5x voting power
        } else if *role == symbol_short!("member") {
            1 // Regular members get standard voting power
        } else {
            0 // Inactive or invalid roles
        }
    }
}