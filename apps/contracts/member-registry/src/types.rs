use soroban_sdk::{contracttype, Address, Symbol};

#[contracttype]
pub enum DataKey {
    Member(Address), // Stores member data for a given address
    TotalMembers,    // Tracks total number of members
    Admin,           // Stores admin address
}

#[contracttype]
#[derive(Clone)]
pub struct Member {
    pub address: Address,
    pub role: Symbol,
    pub is_active: bool,
    pub voting_power: u32,
    pub joined_at: u64,
}

#[contracttype]
#[derive(Clone)]
pub enum MemberEvent {
    MemberRegistered(Address, Symbol),
    RoleUpdated(Address, Symbol),
    StatusChanged(Address, bool),
}
