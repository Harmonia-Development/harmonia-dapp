use soroban_sdk::{contracttype, symbol_short, Env, String};

/// Data structure for storing KYC/KYB records
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct KycRecord {
    /// Unique identifier for the KYC/KYB record
    pub kyc_id: String,
    /// Cryptographic hash of the KYC/KYB data
    pub data_hash: String,
    /// Verification status (e.g., "approved", "rejected")
    pub status: String,
}

/// Core KYC/KYB contract implementation
pub struct KycContract;

impl KycContract {
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
        // Create the KYC record
        let record = KycRecord {
            kyc_id: kyc_id.clone(),
            data_hash,
            status,
        };

        // Store the record using kyc_id as the key
        // This overwrites existing records, making the function idempotent
        env.storage().persistent().set(&kyc_id, &record);

        // Emit an event for the registration
        env.events().publish(
            (symbol_short!("kyc_reg"), kyc_id.clone()),
            record.status.clone(),
        );
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
        // Attempt to retrieve the record from storage
        if let Some(record) = env.storage().persistent().get::<String, KycRecord>(&kyc_id) {
            Some(record.status)
        } else {
            None
        }
    }
}