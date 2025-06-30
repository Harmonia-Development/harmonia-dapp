#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, Address, Env, Symbol, Vec,
};


// Storage keys
pub const DELEGATIONS: Symbol = symbol_short!("DELEG");
pub const DELEGATORS: Symbol = symbol_short!("DLEGR");
pub const MEMBER_POWER: Symbol = symbol_short!("POWER");

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

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum DelegationError {
    SelfDelegation = 1,
    CircularDelegation = 2,
    NoDelegation = 3,
    InvalidAddress = 4,
    InsufficientPower = 5,
}
