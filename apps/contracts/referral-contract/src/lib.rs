#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, vec, xdr::{FromXdr, ToXdr, WriteXdr}, Address, Bytes, BytesN, Env, Map, String, Symbol, Vec
};

const CODES: Symbol = symbol_short!("codes");
const INVITERS: Symbol = symbol_short!("inviters");
const CODE_LENGTH: usize = 8;

fn hash_to_code(env: &Env, input: &Bytes) -> Symbol {
    let hash: Bytes = env.crypto().sha256(input).into();

    String::from_xdr(env, hash);
    let mut code = String::from_str(env, "");
    for byte in hash.iter().take(CODE_LENGTH) {
        let hex = format!("{:02X}", byte.unwrap());
        let hex_part = String::from_slice(env, &hex);
        code.append(&hex_part);
    }

    Symbol::new(env, &code.to_string()[..CODE_LENGTH.min(10)])
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
    fn generate_code(env: Env, inviter: Address) -> Symbol {
        inviter.require_auth();
        let mut codes: Map<Address, Symbol> = env
            .storage()
            .persistent()
            .get(&CODES)
            .unwrap_or(Map::new(&env));
        if let Some(existing_code) = codes.get(inviter.clone()) {
            return Ok(existing_code);
        }

        let nonce = env.ledger().timestamp();
        let mut input = Bytes::new(&env);
        input.append(&inviter.to_xdr(&env));
        input.append(&nonce.to_xdr(&env));
        let code_string = String::from_xdr(&env, &input).unwrap();
        let code_string = code_string.into();

        Ok(Symbol::new("test"))
    }

    fn use_code(env: Env, code: Symbol, new_user: Address) {}

    fn mark_converted(env: Env, address: Address) {}

    fn get_referral_stats(env: Env, inviter: Address) -> ReferralStats {}

    fn get_leaderboard(env: Env) -> Vec<ReferralLeaderboardEntry> {}
}

mod test;
