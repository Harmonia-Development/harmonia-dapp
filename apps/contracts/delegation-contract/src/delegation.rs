use soroban_sdk::{Address, Env, Vec};
use crate::{DelegationError, DELEGATIONS, DELEGATORS};

/// Delegate voting power to another member
/// 
/// # Arguments
/// * `env` - The contract environment
/// * `delegator` - The address delegating their voting power
/// * `delegate` - The address receiving the delegated voting power
/// 
/// # Returns
/// * `Result<(), DelegationError>` - Success or error
pub fn delegate_votes(
    env: Env,
    delegator: Address,
    delegate: Address,
) -> Result<(), DelegationError> {
    // Prevent self-delegation
    if delegator == delegate {
        return Err(DelegationError::SelfDelegation);
    }


    // Remove any existing delegation first
    if let Some(current_delegate) = get_delegate(env.clone(), delegator.clone()) {
        remove_delegator_from_delegate(&env, &delegator, &current_delegate);
    }

    // Store the new delegation
    env.storage().persistent().set(&delegation_key(&delegator), &delegate);

    // Update reverse lookup - add delegator to delegate's list
    add_delegator_to_delegate(&env, &delegator, &delegate);

    Ok(())
}

/// Remove delegation and restore direct control
/// 
/// # Arguments
/// * `env` - The contract environment
/// * `delegator` - The address removing their delegation
/// 
/// # Returns
/// * `Result<(), DelegationError>` - Success or error
pub fn undelegate(env: Env, delegator: Address) -> Result<(), DelegationError> {
    // Check if delegation exists
    let delegate = match get_delegate(env.clone(), delegator.clone()) {
        Some(delegate) => delegate,
        None => return Err(DelegationError::NoDelegation),
    };

    // Remove delegation from storage
    env.storage().persistent().remove(&delegation_key(&delegator));

    // Update reverse lookup - remove delegator from delegate's list
    remove_delegator_from_delegate(&env, &delegator, &delegate);

    Ok(())
}



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

/// Helper function to add a delegator to a delegate's list of delegators
/// 
/// # Arguments
/// * `env` - The contract environment
/// * `delegator` - The delegator address
/// * `delegate` - The delegate address
fn add_delegator_to_delegate(env: &Env, delegator: &Address, delegate: &Address) {
    let mut delegators = get_delegators(env.clone(), delegate.clone());
    
    // Check if delegator is already in the list
    for addr in delegators.iter() {
        if addr == *delegator {
            return; // Already exists
        }
    }
    
    delegators.push_back(delegator.clone());
    env.storage()
        .persistent()
        .set(&delegators_key(delegate), &delegators);
}

/// Helper function to remove a delegator from a delegate's list of delegators
/// 
/// # Arguments
/// * `env` - The contract environment
/// * `delegator` - The delegator address
/// * `delegate` - The delegate address
fn remove_delegator_from_delegate(env: &Env, delegator: &Address, delegate: &Address) {
    let mut delegators = get_delegators(env.clone(), delegate.clone());
    let mut new_delegators = Vec::new(env);
    
    // Filter out the delegator
    for addr in delegators.iter() {
        if addr != *delegator {
            new_delegators.push_back(addr);
        }
    }
    
    if new_delegators.is_empty() {
        env.storage().persistent().remove(&delegators_key(delegate));
    } else {
        env.storage()
            .persistent()
            .set(&delegators_key(delegate), &new_delegators);
    }
}