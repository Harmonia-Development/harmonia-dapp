use soroban_sdk::{Address, Env, Vec, Symbol};
use crate::{delegation, MEMBER_POWER};

/// Compute the total effective voting power of a member (own + delegated)
/// 
/// This function calculates voting power by:
/// 1. Getting the member's base voting power
/// 2. Adding delegated power from all delegators
/// 3. Handling delegation chains appropriately
/// 
/// # Arguments
/// * `env` - The contract environment
/// * `member` - The address to compute voting power for
/// 
/// # Returns
/// * `i128` - The total effective voting power
pub fn get_voting_power(env: Env, member: Address) -> i128 {
    // Get base voting power for the member
    let base_power = get_base_power(env.clone(), member.clone());
    
    // Get all delegators for this member
    let delegators = delegation::get_delegators(env.clone(), member.clone());
    
    // Calculate total delegated power
    let mut delegated_power = 0i128;
    
    for delegator in delegators.iter() {
        // Get the effective power of each delegator
        // This handles nested delegation chains
        let delegator_power = get_effective_delegator_power(env.clone(), delegator);
        delegated_power += delegator_power;
    }
    
    base_power + delegated_power
}

/// Get the effective power that a delegator contributes
/// 
/// This function calculates the power that a delegator contributes when they delegate.
/// It handles the case where a delegator might also have received delegated power.
/// 
/// # Arguments
/// * `env` - The contract environment
/// * `delegator` - The address of the delegator
/// 
/// # Returns
/// * `i128` - The effective power contributed by the delegator
fn get_effective_delegator_power(env: Env, delegator: Address) -> i128 {
    // Get the delegator's base power
    let base_power = get_base_power(env.clone(), delegator.clone());
    
    // If this delegator has delegated their power, they contribute 0
    // (their power is already counted through their delegate)
    if delegation::get_delegate(env.clone(), delegator.clone()).is_some() {
        return 0;
    }
    
    // Get power delegated to this delegator from others
    let delegators_to_this = delegation::get_delegators(env.clone(), delegator.clone());
    let mut delegated_to_this = 0i128;
    
    for sub_delegator in delegators_to_this.iter() {
        // Recursive calculation for nested delegations
        let sub_power = get_effective_delegator_power(env.clone(), sub_delegator);
        delegated_to_this += sub_power;
    }
    
    base_power + delegated_to_this
}

/// Get the base voting power for a member
/// 
/// # Arguments
/// * `env` - The contract environment
/// * `member` - The address to get base power for
/// 
/// # Returns
/// * `i128` - The base voting power (defaults to 1 if not set)
pub fn get_base_power(env: Env, member: Address) -> i128 {
    env.storage()
        .persistent()
        .get(&base_power_key(&member))
        .unwrap_or(1i128) // Default base power is 1
}

/// Set the base voting power for a member
/// 
/// # Arguments
/// * `env` - The contract environment
/// * `member` - The address to set base power for
/// * `power` - The base voting power amount
pub fn set_base_power(env: Env, member: Address, power: i128) {
    if power <= 0 {
        // Remove entry for zero or negative power
        env.storage().persistent().remove(&base_power_key(&member));
    } else {
        env.storage()
            .persistent()
            .set(&base_power_key(&member), &power);
    }
}


/// Generate storage key for base power mapping
/// 
/// # Arguments
/// * `member` - The member address
/// 
/// # Returns
/// * Tuple for storage key
fn base_power_key(member: &Address) -> (Symbol, Address) {
    (MEMBER_POWER, member.clone())
}