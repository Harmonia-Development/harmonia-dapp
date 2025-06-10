#![no_std]

extern crate alloc;

#[cfg(target_arch = "wasm32")]
use alloc::alloc::{GlobalAlloc, Layout};

#[cfg(target_arch = "wasm32")]
struct SorobanAllocator;

#[cfg(target_arch = "wasm32")]
unsafe impl GlobalAlloc for SorobanAllocator {
    unsafe fn alloc(&self, layout: Layout) -> *mut u8 {
        alloc::alloc::alloc(layout)
    }

    unsafe fn dealloc(&self, ptr: *mut u8, layout: Layout) {
        alloc::alloc::dealloc(ptr, layout)
    }
}

#[cfg(target_arch = "wasm32")]
#[global_allocator]
static ALLOCATOR: SorobanAllocator = SorobanAllocator;

use alloc::format;

use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, xdr::{ToXdr}, Address, Bytes, Env, Map, Symbol, Vec
};

const CODES: Symbol = symbol_short!("codes");
// Will be used in future implementation for tracking inviter-invitee relationships
#[allow(dead_code)]
const INVITERS: Symbol = symbol_short!("inviters");
const CODE_LENGTH: usize = 8;

fn hash_to_code(env: &Env, input: &Bytes) -> Symbol {
    let hash: Bytes = env.crypto().sha256(input).into();
    
    // Start with an empty string and build hex representation
    let mut hex_code = alloc::string::String::new();
    
    // Convert each byte to hex and append to our Rust string
    for byte in hash.iter().take(CODE_LENGTH) {
        let hex = format!("{:02X}", byte);
        hex_code.push_str(&hex);
    }
    
    // Limit the length
    let limit = CODE_LENGTH.min(hex_code.len()).min(10);
    let final_code = &hex_code[..limit];
    
    // Create a symbol from the final code
    Symbol::new(env, final_code)
}

#[contracttype]
pub struct ReferralStats {
    pub total_invites: u32,
    pub converted: u32,
    pub pending: u32,
}

#[contracttype]
pub struct ReferralLeaderboardEntry {
    pub address: Address,
    pub converted: u32,
}

#[contract]
pub struct ReferralContract;

#[contractimpl]
impl ReferralContract {
    pub fn generate_code(env: Env, inviter: Address) -> Symbol {
        inviter.require_auth();
        let mut codes: Map<Address, Symbol> = env
            .storage()
            .persistent()
            .get(&CODES)
            .unwrap_or(Map::new(&env));
        if let Some(existing_code) = codes.get(inviter.clone()) {
            return existing_code;
        }

        let nonce = env.ledger().timestamp();
        let mut input = Bytes::new(&env);
        input.append(&inviter.clone().to_xdr(&env));
        input.append(&nonce.to_xdr(&env));
        
        // Generate a unique code based on the inviter address and nonce
        let code = hash_to_code(&env, &input);
        
        // Store the code in the map
        codes.set(inviter.clone(), code.clone());
        env.storage().persistent().set(&CODES, &codes);
        
        code
    }

    pub fn use_code(_env: Env, _code: Symbol, new_user: Address) {
        // Placeholder implementation
        new_user.require_auth();
        
        // Here you would:
        // 1. Find the inviter associated with this code
        // 2. Record that new_user used this code
        // 3. Update referral stats
    }

    pub fn mark_converted(_env: Env, _address: Address) {
        // Placeholder implementation
        // Here you would mark a user as converted and update stats
    }

    pub fn get_referral_stats(_env: Env, _inviter: Address) -> ReferralStats {
        // Placeholder implementation
        ReferralStats {
            total_invites: 0,
            converted: 0,
            pending: 0,
        }
    }

    pub fn get_leaderboard(env: Env) -> Vec<ReferralLeaderboardEntry> {
        // Placeholder implementation
        Vec::new(&env)
    }
}

mod test;
