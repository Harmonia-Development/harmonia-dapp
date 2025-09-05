#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Events, Env, String};

#[test]
fn test_register_and_get_kyc() {
    let env = Env::default();
    let contract_id = env.register(KycKybContract, ());
    let client = KycKybContractClient::new(&env, &contract_id);

    let kyc_id = String::from_str(&env, "user123");
    let data_hash = String::from_str(&env, "sha256_hash_example");
    let status = String::from_str(&env, "approved");

    // Register a KYC record
    client.register_kyc(&kyc_id, &data_hash, &status);

    // Retrieve the status
    let retrieved_status = client.get_kyc_status(&kyc_id);
    assert_eq!(retrieved_status, Some(status));
}

#[test]
fn test_update_existing_record() {
    let env = Env::default();
    let contract_id = env.register(KycKybContract, ());
    let client = KycKybContractClient::new(&env, &contract_id);

    let kyc_id = String::from_str(&env, "user456");
    let original_hash = String::from_str(&env, "original_hash");
    let updated_hash = String::from_str(&env, "updated_hash");
    let original_status = String::from_str(&env, "pending");
    let updated_status = String::from_str(&env, "approved");

    // Register initial record
    client.register_kyc(&kyc_id, &original_hash, &original_status);
    
    // Verify initial status
    let status1 = client.get_kyc_status(&kyc_id);
    assert_eq!(status1, Some(original_status.clone()));

    // Update the record (idempotent operation)
    client.register_kyc(&kyc_id, &updated_hash, &updated_status);
    
    // Verify updated status
    let status2 = client.get_kyc_status(&kyc_id);
    assert_eq!(status2, Some(updated_status));
}

#[test]
fn test_get_nonexistent_record() {
    let env = Env::default();
    let contract_id = env.register(KycKybContract, ());
    let client = KycKybContractClient::new(&env, &contract_id);

    let nonexistent_id = String::from_str(&env, "nonexistent");

    // Try to get status for non-existent record
    let result = client.get_kyc_status(&nonexistent_id);
    assert_eq!(result, None);
}

#[test]
fn test_empty_strings() {
    let env = Env::default();
    let contract_id = env.register(KycKybContract, ());
    let client = KycKybContractClient::new(&env, &contract_id);

    let empty_id = String::from_str(&env, "");
    let empty_hash = String::from_str(&env, "");
    let empty_status = String::from_str(&env, "");

    // Register with empty strings (should work - no validation in current impl)
    client.register_kyc(&empty_id, &empty_hash, &empty_status);

    // Retrieve status
    let result = client.get_kyc_status(&empty_id);
    assert_eq!(result, Some(empty_status));
}

#[test]
fn test_multiple_records() {
    let env = Env::default();
    let contract_id = env.register(KycKybContract, ());
    let client = KycKybContractClient::new(&env, &contract_id);

    // Create multiple different records
    let records = [
        ("user1", "hash1", "approved"),
        ("user2", "hash2", "rejected"), 
        ("user3", "hash3", "pending"),
    ];

    // Register all records
    for (id, hash, status) in &records {
        let kyc_id = String::from_str(&env, id);
        let data_hash = String::from_str(&env, hash);
        let kyc_status = String::from_str(&env, status);
        client.register_kyc(&kyc_id, &data_hash, &kyc_status);
    }

    // Verify all records exist and have correct status
    for (id, _hash, expected_status) in &records {
        let kyc_id = String::from_str(&env, id);
        let expected = String::from_str(&env, expected_status);
        let result = client.get_kyc_status(&kyc_id);
        assert_eq!(result, Some(expected));
    }
}

#[test]
fn test_event_emission() {
    let env = Env::default();
    let contract_id = env.register(KycKybContract, ());
    let client = KycKybContractClient::new(&env, &contract_id);

    let kyc_id = String::from_str(&env, "event_test");
    let data_hash = String::from_str(&env, "test_hash");
    let status = String::from_str(&env, "approved");

    // Register KYC record (should emit event)
    client.register_kyc(&kyc_id, &data_hash, &status);

    // Verify event was emitted
    let events = env.events().all();
    assert!(!events.is_empty());
    
    // Check that at least one event was emitted (basic verification)
    // In a real implementation, we could check event content more thoroughly
    let has_events = events.len() > 0;
    assert!(has_events);
}

#[test]
fn test_long_strings() {
    let env = Env::default();
    let contract_id = env.register(KycKybContract, ());
    let client = KycKybContractClient::new(&env, &contract_id);

    // Test with reasonably long strings
    let long_id = String::from_str(&env, "very_long_user_identifier_with_many_characters_12345");
    let long_hash = String::from_str(&env, "sha256_1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef");
    let status = String::from_str(&env, "approved");

    // Should handle long strings without issues
    client.register_kyc(&long_id, &long_hash, &status);

    let result = client.get_kyc_status(&long_id);
    assert_eq!(result, Some(status));
}

#[test]
fn test_special_characters() {
    let env = Env::default();
    let contract_id = env.register(KycKybContract, ());
    let client = KycKybContractClient::new(&env, &contract_id);

    let special_id = String::from_str(&env, "user@domain.com");
    let hash_with_chars = String::from_str(&env, "0x1234abcd");
    let status = String::from_str(&env, "pending-review");

    // Should handle special characters
    client.register_kyc(&special_id, &hash_with_chars, &status);

    let result = client.get_kyc_status(&special_id);
    assert_eq!(result, Some(status));
}

#[test] 
fn test_case_sensitivity() {
    let env = Env::default();
    let contract_id = env.register(KycKybContract, ());
    let client = KycKybContractClient::new(&env, &contract_id);

    let id1 = String::from_str(&env, "User123");
    let id2 = String::from_str(&env, "user123");
    let hash = String::from_str(&env, "test_hash");
    let status1 = String::from_str(&env, "approved");
    let status2 = String::from_str(&env, "rejected");

    // Register both (should be treated as different records)
    client.register_kyc(&id1, &hash, &status1);
    client.register_kyc(&id2, &hash, &status2);

    // Verify they're stored separately
    let result1 = client.get_kyc_status(&id1);
    let result2 = client.get_kyc_status(&id2);
    
    assert_eq!(result1, Some(status1));
    assert_eq!(result2, Some(status2));
}