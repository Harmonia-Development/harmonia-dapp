#![no_std]

use soroban_sdk::{contract, contractimpl, Env, String};

#[path = "kyc-contract.rs"]
mod kyc_contract;
pub use kyc_contract::{KycContract, KycRecord};

/// Main KYC/KYB Smart Contract
/// 
/// This contract manages KYC/KYB data for the Stellar wallet service.
/// It stores hashes of user identity data along with verification status,
/// ensuring transparency and immutability on the Stellar network.
#[contract]
pub struct KycKybContract;

#[contractimpl]
impl KycKybContract {
    /// Stores or updates a KYC/KYB record with the given kyc_id, data_hash, and status.
    /// This function is idempotent - it will overwrite existing records with the same kyc_id.
    /// 
    /// # Arguments
    /// * `env` - The Soroban environment
    /// * `kyc_id` - Unique identifier for the KYC/KYB record  
    /// * `data_hash` - Cryptographic hash of the KYC/KYB data
    /// * `status` - Verification status (e.g., "approved", "rejected")
    pub fn register_kyc(
        env: Env,
        kyc_id: String,
        data_hash: String,
        status: String,
    ) {
        KycContract::register_kyc(env, kyc_id, data_hash, status);
    }

    /// Retrieves the verification status for a given kyc_id.
    /// Returns the status string if the record exists, or None if it doesn't.
    /// 
    /// # Arguments
    /// * `env` - The Soroban environment
    /// * `kyc_id` - The unique identifier to look up
    /// 
    /// # Returns
    /// * `Option<String>` - The verification status if found, None otherwise
    pub fn get_kyc_status(env: Env, kyc_id: String) -> Option<String> {
        KycContract::get_kyc_status(env, kyc_id)
    }
}

#[cfg(test)]
mod test;