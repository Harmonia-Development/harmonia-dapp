#![no_std]
use soroban_sdk::{Address, Env, Symbol, Vec, contract, contractimpl, contracttype, symbol_short, contracterror};

pub mod delegation;
pub mod power;

use delegation::*;
use power::*;

// Storage keys
pub const DELEGATIONS: Symbol = symbol_short!("DELEG");
pub const DELEGATORS: Symbol = symbol_short!("DLEGR");
pub const MEMBER_POWER: Symbol = symbol_short!("POWER");
pub const ADMIN: Symbol = symbol_short!("ADMIN");

/// Represents a delegation relationship
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Delegation {
    pub delegator: Address,
    pub delegate: Address,
}

/// Represents voting power information
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct VotingPower {
    pub member: Address,
    pub total_power: i128,
}

#[contracterror]
#[derive(Clone, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum DelegationError {
    SelfDelegation = 1,
    NoDelegation = 2,
    InvalidAddress = 3,
    InsufficientPower = 4,
}

/// The main delegation contract
#[contract]
pub struct DelegationContract;

#[contractimpl]
impl DelegationContract {
    pub fn __constructor(e: Env, admin: Address, base_power: i128) {
        // Initialize the contract with the admin address
        e.storage().persistent().set(&ADMIN, &admin);
    }
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
        // Ensure the delegator has authorized this transaction
        delegator.require_auth();

        delegation::delegate_votes(env, delegator, delegate)
    }

    /// Remove delegation from a member
    ///
    /// # Arguments
    /// * `env` - The contract environment
    /// * `delegator` - The address removing their delegation
    ///
    /// # Returns
    /// * `Result<(), DelegationError>` - Success or error
    pub fn undelegate(env: Env, delegator: Address) -> Result<(), DelegationError> {
        // Ensure the delegator has authorized this transaction
        delegator.require_auth();

        delegation::undelegate(env, delegator)
    }

    /// get the total voting power of a member (own + delegated)
    ///
    /// # Arguments
    /// * `env` - The contract environment
    /// * `member` - The address to compute voting power for
    ///
    /// # Returns
    /// * `i128` - The total effective voting power
    pub fn get_voting_power(env: Env, member: Address) -> i128 {
        power::get_voting_power(env, member)
    }

    /// Set the base voting power for a member
    ///
    /// # Arguments
    /// * `env` - The contract environment
    /// * `member` - The address to set base power for
    /// * `power` - The base voting power amount
    pub fn set_base_power(env: Env, member: Address, power: i128) {
        let admin: Address = env.storage().persistent().get(&ADMIN).unwrap();

        admin.require_auth();
        power::set_base_power(env, member, power);
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
        delegation::get_delegate(env, delegator)
    }

    /// Return all addresses delegating to a specific member
    ///
    /// # Arguments
    /// * `env` - The contract environment
    /// * `delegate` - The address to get delegators for
    ///
    /// # Returns
    /// * `Vec<Address>` - Vector of addresses delegating to the member
    pub fn get_delegators(env: Env, delegate: Address) -> Vec<Address> {
        delegation::get_delegators(env, delegate)
    }

    /// Get detailed voting power information for a member
    ///
    /// # Arguments
    /// * `env` - The contract environment
    /// * `member` - The address to get detailed power info for
    ///
    /// # Returns
    /// * `VotingPower` - Detailed voting power information
    pub fn get_voting_power_details(env: Env, member: Address) -> VotingPower {
        VotingPower {
            member: member.clone(),
            total_power: power::get_voting_power(env, member),
        }
    }

    /// Check if an address has any delegation (either as delegator or delegate)
    ///
    /// # Arguments
    /// * `env` - The contract environment
    /// * `address` - The address to check
    ///
    /// # Returns
    /// * `bool` - True if the address has delegation relationships
    pub fn has_delegation(env: Env, address: Address) -> bool {
        delegation::has_delegation(env, address)
    }
}

pub mod test;