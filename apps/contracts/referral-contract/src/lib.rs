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

mod referral;
pub use referral::{
    register_referral, get_referrer, grant_reward, has_been_referred, list_referrals, get_reward_balance,
    CONVERTED
};

const CODES: Symbol = symbol_short!("codes");
const REFERRALS: Symbol = symbol_short!("referrals"); // Base key
const REWARDS: Symbol = symbol_short!("rewards");    // Base key
const STATS: Symbol = symbol_short!("stats");        // Stats key
const MAX_DEPTH: u32 = 5; // Depth limit to prevent abuse
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

    pub fn use_code(env: Env, code: Symbol, new_user: Address) {
        new_user.require_auth();
        let codes: Map<Address, Symbol> = env
            .storage()
            .persistent()
            .get(&CODES)
            .unwrap_or(Map::new(&env));
        if let Some((inviter, _)) = codes.iter().find(|(_, c)| *c == code) {
            referral::register_referral(env.clone(), inviter.clone(), new_user.clone());
        }
    }

    pub fn mark_converted(env: Env, user: Address) {
        user.require_auth(); // Only the user can mark themselves as converted
    
        // Check if the user was referred
        let campaign_referrals = referral::get_campaign_key(&env);
        let referrals: Map<Address, referral::Referral> = env
            .storage()
            .persistent()
            .get(&campaign_referrals)
            .unwrap_or(Map::new(&env));
    
        let referral = referrals
            .get(user.clone())
            .unwrap_or_else(|| panic!("User was not referred"));
    
        // Check if already converted
        let mut converted_map: Map<Address, bool> = env
            .storage()
            .persistent()
            .get(&CONVERTED)
            .unwrap_or(Map::new(&env));
    
        if converted_map.contains_key(user.clone()) {
            panic!("Already marked as converted");
        }
    
        // Mark as converted
        converted_map.set(user.clone(), true);
        env.storage().persistent().set(&CONVERTED, &converted_map);
    
        // Update stats
        let mut stats: Map<Address, ReferralStats> = env
            .storage()
            .persistent()
            .get(&STATS)
            .unwrap_or(Map::new(&env));
    
        let mut inviter_stats = stats.get(referral.referrer.clone()).unwrap_or(ReferralStats {
            total_invites: 0,
            converted: 0,
            pending: 0,
        });
    
        inviter_stats.converted += 1;
        if inviter_stats.pending > 0 {
            inviter_stats.pending -= 1;
        }
    
        stats.set(referral.referrer.clone(), inviter_stats);
        env.storage().persistent().set(&STATS, &stats);
    
        // Optional: Emit event
        env.events().publish(
            (symbol_short!("converted"), user),
            referral.referrer,
        );
    }
    

    pub fn get_referral_stats(env: Env, inviter: Address) -> ReferralStats {
        let campaign_referrals = referral::get_campaign_key(&env);
        let referrals: Map<Address, referral::Referral> = env
            .storage()
            .persistent()
            .get(&campaign_referrals)
            .unwrap_or(Map::new(&env));
    
        // Count how many users this inviter has referred
        let mut total = 0;
        let mut converted = 0;
    
        for (referee, referral_data) in referrals.iter() {
            if referral_data.referrer == inviter {
                total += 1;
    
                if referral::is_converted(&env, &referee) {
                    converted += 1;
                }
            }
        }
    
        let pending = total - converted;
    
        ReferralStats {
            total_invites: total,
            converted,
            pending,
        }
    }
    

    pub fn get_leaderboard(env: Env) -> Vec<ReferralLeaderboardEntry> {
        let campaign_referrals = referral::get_campaign_key(&env);
        let referrals: Map<Address, referral::Referral> = env
            .storage()
            .persistent()
            .get(&campaign_referrals)
            .unwrap_or(Map::new(&env));

        // Map from referrer to number of converted referees
        let mut conversion_counts: Map<Address, u32> = Map::new(&env);

        for (referee, referral_data) in referrals.iter() {
            if referral::is_converted(&env, &referee) {
                let referrer = referral_data.referrer;
                let count = conversion_counts.get(referrer.clone()).unwrap_or(0);
                conversion_counts.set(referrer, count + 1);
            }
        }

        // Collect leaderboard entries into a Rust Vec for sorting
        let mut leaderboard_vec: alloc::vec::Vec<ReferralLeaderboardEntry> = alloc::vec::Vec::new();
        for (referrer, count) in conversion_counts.iter() {
            leaderboard_vec.push(ReferralLeaderboardEntry {
                address: referrer,
                converted: count,
            });
        }

        // Sort by converted count descending
        leaderboard_vec.sort_by(|a, b| b.converted.cmp(&a.converted));

        // Convert back to soroban_sdk::Vec
        let mut leaderboard = Vec::new(&env);
        for entry in leaderboard_vec {
            leaderboard.push_back(entry);
        }
        leaderboard
    }

    pub fn register_referral(env: Env, referrer: Address, referee: Address) {
        referral::register_referral(env, referrer, referee);
    }

    pub fn get_referrer(env: Env, referee: Address) -> Option<Address> {
        referral::get_referrer(env, referee)
    }

    pub fn has_been_referred(env: Env, referee: Address) -> bool {
        referral::has_been_referred(env, referee)
    }

    pub fn list_referrals(env: Env, referrer: Address) -> Vec<Address> {
        referral::list_referrals(env, referrer)
    }

    pub fn get_reward_balance(env: Env, address: Address) -> i128 {
        referral::get_reward_balance(env, address)
    }

    pub fn grant_reward(env: Env, address: Address) {
        referral::grant_reward(env, address);
    }
}

mod test;
