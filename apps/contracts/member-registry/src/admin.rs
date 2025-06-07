use crate::types::*;
use soroban_sdk::{Address, Env};

pub fn initialize(env: Env, admin: Address) {
    admin.require_auth();
    env.storage().instance().set(&DataKey::Admin, &admin);
    env.storage().instance().set(&DataKey::TotalMembers, &0u32);
}

pub fn is_admin(env: &Env, address: &Address) -> bool {
    let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
    admin == *address
}
