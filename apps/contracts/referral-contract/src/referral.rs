use soroban_sdk::{
    Env, Address, Map, symbol_short, contracttype, Vec, Symbol,
};
use crate as referral_contract; // Explicitly name the crate import

/// Represents a referral relationship between two users
#[derive(Clone)]
#[contracttype]
pub struct Referral {
    pub referee: Address,
    pub referrer: Address,
    pub timestamp: u64,
}

/// Tracks reward balances for both referrers and referees
#[derive(Clone)]
#[contracttype]
pub struct Reward {
    pub referrer: Address,
    pub amount: i128,        // Rewards earned as a referrer
    pub referee_amount: i128, // Rewards earned as a referee
}

/// Symbol key for converted users map
pub const CONVERTED: Symbol = symbol_short!("converted");

/// Main function to register a new referral relationship
pub fn register_referral(env: Env, referrer: Address, referee: Address) {
    if referrer == referee {
        panic!("Cannot self-refer!");
    }

    let campaign_referrals = get_campaign_key(&env);
    let mut referrals: Map<Address, Referral> = env
        .storage()
        .persistent()
        .get(&campaign_referrals)
        .unwrap_or(Map::new(&env));

    if referrals.contains_key(referee.clone()) {
        panic!("Referee already has a referrer!");
    }

    if has_cycle(&env, referrer.clone(), referee.clone(), 0) {
        panic!("Circular referral detected!");
    }

    let timestamp = env.ledger().timestamp();
    let referral = Referral {
        referee: referee.clone(),
        referrer: referrer.clone(),
        timestamp,
    };
    referrals.set(referee.clone(), referral);
    env.storage().persistent().set(&campaign_referrals, &referrals);

    // Update rewards
    let mut rewards: Map<Address, Reward> = env
        .storage()
        .persistent()
        .get(&referral_contract::REWARDS)
        .unwrap_or(Map::new(&env));

    let mut referrer_reward = rewards.get(referrer.clone()).unwrap_or(Reward {
        referrer: referrer.clone(),
        amount: 0,
        referee_amount: 0,
    });
    referrer_reward.amount += 1;
    rewards.set(referrer.clone(), referrer_reward);

    let mut referee_reward = rewards.get(referee.clone()).unwrap_or(Reward {
        referrer: referee.clone(),
        amount: 0,
        referee_amount: 0,
    });
    referee_reward.referee_amount += 1;
    rewards.set(referee.clone(), referee_reward);

    env.storage().persistent().set(&referral_contract::REWARDS, &rewards);

    env.events().publish((symbol_short!("referral"), referee), referrer);
}

pub fn get_referrer(env: Env, referee: Address) -> Option<Address> {
    let campaign_referrals = get_campaign_key(&env);
    let referrals: Map<Address, Referral> = env
        .storage()
        .persistent()
        .get(&campaign_referrals)
        .unwrap_or(Map::new(&env));
    referrals.get(referee).map(|r| r.referrer)
}

pub fn grant_reward(env: Env, referrer: Address) {
    let mut rewards: Map<Address, Reward> = env
        .storage()
        .persistent()
        .get(&referral_contract::REWARDS)
        .unwrap_or(Map::new(&env));
    if let Some(mut reward) = rewards.get(referrer.clone()) {
        if reward.amount > 0 {
            env.events().publish((symbol_short!("reward"), referrer.clone()), reward.amount);
            reward.amount = 0;
            rewards.set(referrer.clone(), reward);
            env.storage().persistent().set(&referral_contract::REWARDS, &rewards);
        }
    }
}

pub fn has_been_referred(env: Env, user: Address) -> bool {
    let campaign_referrals = get_campaign_key(&env);
    let referrals: Map<Address, Referral> = env
        .storage()
        .persistent()
        .get(&campaign_referrals)
        .unwrap_or(Map::new(&env));
    referrals.contains_key(user)
}

pub fn list_referrals(env: Env, referrer: Address) -> Vec<Address> {
    let campaign_referrals = get_campaign_key(&env);
    let referrals: Map<Address, Referral> = env
        .storage()
        .persistent()
        .get(&campaign_referrals)
        .unwrap_or(Map::new(&env));
    let mut result = Vec::new(&env);
    for (referee, referral) in referrals.iter() {
        if referral.referrer == referrer {
            result.push_back(referee);
        }
    }
    result
}

pub fn get_reward_balance(env: Env, referrer: Address) -> i128 {
    let rewards: Map<Address, Reward> = env
        .storage()
        .persistent()
        .get(&referral_contract::REWARDS)
        .unwrap_or(Map::new(&env));
    rewards.get(referrer).map(|reward| reward.amount).unwrap_or(0)
}

/// Returns the campaign storage key
pub fn get_campaign_key(_env: &Env) -> Symbol {
    referral_contract::REFERRALS
}

/// Checks for circular referral relationships
fn has_cycle(env: &Env, referrer: Address, referee: Address, depth: u32) -> bool {
    if depth > referral_contract::MAX_DEPTH {
        return true;
    }

    let campaign_referrals = get_campaign_key(env);
    let referrals: Map<Address, Referral> = env
        .storage()
        .persistent()
        .get(&campaign_referrals)
        .unwrap_or(Map::new(&env));

    let mut current = referrer;
    let mut d = 0;
    while d <= referral_contract::MAX_DEPTH {
        if current == referee {
            return true;
        }
        if let Some(r) = referrals.get(current.clone()) {
            current = r.referrer;
            d += 1;
        } else {
            break;
        }
    }
    false
}

/// Checks if a user has been marked as converted
pub fn is_converted(env: &Env, user: &Address) -> bool {
    let converted_map: Map<Address, bool> = env
        .storage()
        .persistent()
        .get(&CONVERTED)
        .unwrap_or(Map::new(env));
    converted_map.contains_key(user.clone())
}
