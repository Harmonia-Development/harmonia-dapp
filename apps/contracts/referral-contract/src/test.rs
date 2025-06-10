#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, testutils::MockAuth, Address, Env, IntoVal, Map, Symbol};

#[test]
fn test_referral_stats_struct() {
    // Test that the ReferralStats struct can be created
    let stats = ReferralStats {
        total_invites: 10,
        converted: 5,
        pending: 5,
    };
    
    assert_eq!(stats.total_invites, 10);
    assert_eq!(stats.converted, 5);
    assert_eq!(stats.pending, 5);
}

