use soroban_sdk::{Address, Env, Vec};
use crate::{DelegationError, DELEGATIONS, DELEGATORS};



/// Retrieve the current delegate of a member
/// 
/// # Arguments
/// * `env` - The contract environment
/// * `delegator` - The address to check delegation for
/// 
/// # Returns
/// * `Option<Address>` - The delegate address if delegation exists
pub fn get_delegate(env: Env, delegator: Address) -> Option<Address> {
    env.storage()
        .persistent()
        .get(&delegation_key(&delegator))
}

/// Return all addresses delegating to a member
/// 
/// # Arguments
/// * `env` - The contract environment
/// * `delegate` - The address to get delegators for
/// 
/// # Returns
/// * `Vec<Address>` - Vector of addresses delegating to the member
pub fn get_delegators(env: Env, delegate: Address) -> Vec<Address> {
    env.storage()
        .persistent()
        .get(&delegators_key(&delegate))
        .unwrap_or(Vec::new(&env))
}
/// Check if an address has any delegation relationships
/// 
/// # Arguments
/// * `env` - The contract environment
/// * `address` - The address to check
/// 
/// # Returns
/// * `bool` - True if the address has delegation relationships
pub fn has_delegation(env: Env, address: Address) -> bool {
    // Check if address is a delegator
    if get_delegate(env.clone(), address.clone()).is_some() {
        return true;
    }

    // Check if address has delegators
    let delegators = get_delegators(env, address);
    !delegators.is_empty()
}

/// Generate storage key for delegation mapping
/// 
/// # Arguments
/// * `delegator` - The delegator address
/// 
/// # Returns
/// * Tuple for storage key
fn delegation_key(delegator: &Address) -> (soroban_sdk::Symbol, Address) {
    (DELEGATIONS, delegator.clone())
}

/// Generate storage key for delegators mapping
/// 
/// # Arguments
/// * `delegate` - The delegate address
/// 
/// # Returns
/// * Tuple for storage key
fn delegators_key(delegate: &Address) -> (soroban_sdk::Symbol, Address) {
    (DELEGATORS, delegate.clone())
}