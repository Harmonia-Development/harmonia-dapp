#![cfg(test)]

use soroban_sdk::{
    testutils::{Address as _, Ledger, LedgerInfo},
    Address, Env, String, Vec, symbol_short,
};

use crate::{
    DisputeResolutionContract, DisputeResolutionContractClient,
    Dispute, DisputeStatus, Resolution, DisputeError,
    EventType, constants,
    DataKey,
};

/// Test utilities for dispute resolution contract
mod test_utils {
    use super::*;

    /// Create a test environment with proper ledger setup
    pub fn create_test_env() -> Env {
        let env = Env::default();
        env.ledger().set(LedgerInfo {
            timestamp: 1000,
            protocol_version: 20,
            sequence_number: 1,
            network_id: Default::default(),
            base_reserve: 10,
            min_temp_entry_ttl: 10,
            min_persistent_entry_ttl: 10,
            max_entry_ttl: 2000000,
        });
        env
    }

    /// Generate test addresses for parties
    pub fn generate_test_parties(env: &Env) -> (Address, Address, Address, Address) {
        let admin = Address::generate(env);
        let plaintiff = Address::generate(env);
        let defendant = Address::generate(env);
        let arbitrator = Address::generate(env);
        (admin, plaintiff, defendant, arbitrator)
    }

    /// Initialize a test contract instance
    pub fn initialize_test_contract(env: &Env) -> (DisputeResolutionContractClient, Address, Address, Address) {
        let contract_id = env.register_contract(None, DisputeResolutionContract);
        let client = DisputeResolutionContractClient::new(env, &contract_id);
        
        let (admin, _, _, _) = generate_test_parties(env);
        let member_registry = Address::generate(env);
        let treasury = Address::generate(env);
        
        client.initialize(&admin, &member_registry, &treasury);
        
        (client, admin, member_registry, treasury)
    }

    /// Create a valid dispute description
    pub fn create_valid_description(env: &Env) -> String {
        String::from_str(env, "This is a valid dispute description for testing purposes.")
    }

    /// Create a valid resolution text
    pub fn create_valid_resolution(env: &Env) -> String {
        String::from_str(env, "This dispute has been resolved in favor of the plaintiff with a penalty of 500 units.")
    }
}

/// Test dispute creation functionality
#[test]
fn test_dispute_creation() {
    let env = test_utils::create_test_env();
    let (client, admin, _, _) = test_utils::initialize_test_contract(&env);
    let (_, plaintiff, defendant, _) = test_utils::generate_test_parties(&env);
    let description = test_utils::create_valid_description(&env);

    // Test successful dispute creation
    let dispute_id = client.with_source_account(&plaintiff).raise_dispute(&plaintiff, &defendant, &description);
    assert_eq!(dispute_id, 1);

    // Verify dispute details
    let dispute = client.get_dispute(&dispute_id);
    assert_eq!(dispute.id, 1);
    assert_eq!(dispute.plaintiff, plaintiff);
    assert_eq!(dispute.defendant, defendant);
    assert_eq!(dispute.description, description);
    assert_eq!(dispute.status, DisputeStatus::Open);
    assert_eq!(dispute.arbitrators.len(), 0);

    // Test dispute counter increment
    let total_disputes = client.get_total_disputes();
    assert_eq!(total_disputes, 1);
}

/// Test dispute creation validation
#[test]
fn test_dispute_creation_validation() {
    let env = test_utils::create_test_env();
    let (client, admin, _, _) = test_utils::initialize_test_contract(&env);
    let (_, plaintiff, defendant, _) = test_utils::generate_test_parties(&env);

    // Test empty description
    let empty_description = String::from_str(&env, "");
    let result = client.with_source_account(&plaintiff).raise_dispute(&plaintiff, &defendant, &empty_description);
    assert_eq!(result, Err(DisputeError::InvalidDescription));

    // Test description too long
    let long_description = String::from_str(&env, &"a".repeat(constants::MAX_DESCRIPTION_LENGTH + 1));
    let result = client.with_source_account(&plaintiff).raise_dispute(&plaintiff, &defendant, &long_description);
    assert_eq!(result, Err(DisputeError::InvalidDescription));

    // Test self-dispute
    let valid_description = test_utils::create_valid_description(&env);
    let result = client.with_source_account(&plaintiff).raise_dispute(&plaintiff, &plaintiff, &valid_description);
    assert_eq!(result, Err(DisputeError::SelfDispute));
}

/// Test arbitrator volunteering functionality
#[test]
fn test_arbitrator_volunteering() {
    let env = test_utils::create_test_env();
    let (client, admin, _, _) = test_utils::initialize_test_contract(&env);
    let (_, plaintiff, defendant, arbitrator) = test_utils::generate_test_parties(&env);
    let description = test_utils::create_valid_description(&env);

    // Create a dispute
    let dispute_id = client.with_source_account(&plaintiff).raise_dispute(&plaintiff, &defendant, &description);

    // Test successful arbitrator volunteering
    let result = client.with_source_account(&arbitrator).volunteer_as_arbitrator(&arbitrator, &dispute_id);
    assert!(result.is_ok());

    // Verify arbitrator was added
    let dispute = client.get_dispute(&dispute_id);
    assert_eq!(dispute.arbitrators.len(), 1);
    assert_eq!(dispute.arbitrators.get(0), Some(arbitrator.clone()));

    // Test duplicate volunteering
    let result = client.with_source_account(&arbitrator).volunteer_as_arbitrator(&arbitrator, &dispute_id);
    assert_eq!(result, Err(DisputeError::AlreadyVolunteered));

    // Test plaintiff trying to volunteer (conflict of interest)
    let result = client.with_source_account(&plaintiff).volunteer_as_arbitrator(&plaintiff, &dispute_id);
    assert_eq!(result, Err(DisputeError::ConflictOfInterest));

    // Test defendant trying to volunteer (conflict of interest)
    let result = client.with_source_account(&defendant).volunteer_as_arbitrator(&defendant, &dispute_id);
    assert_eq!(result, Err(DisputeError::ConflictOfInterest));
}

/// Test dispute resolution functionality
#[test]
fn test_dispute_resolution() {
    let env = test_utils::create_test_env();
    let (client, admin, _, _) = test_utils::initialize_test_contract(&env);
    let (_, plaintiff, defendant, arbitrator) = test_utils::generate_test_parties(&env);
    let description = test_utils::create_valid_description(&env);
    let resolution_text = test_utils::create_valid_resolution(&env);

    // Create a dispute
    let dispute_id = client.with_source_account(&plaintiff).raise_dispute(&plaintiff, &defendant, &description);

    // Volunteer as arbitrator
    client.with_source_account(&arbitrator).volunteer_as_arbitrator(&arbitrator, &dispute_id);

    // Test successful resolution
    let result = client.with_source_account(&arbitrator).resolve_dispute(
        &dispute_id,
        &arbitrator,
        &resolution_text,
        &Some(500)
    );
    assert!(result.is_ok());

    // Verify dispute status changed
    let dispute = client.get_dispute(&dispute_id);
    assert_eq!(dispute.status, DisputeStatus::Resolved);

    // Verify resolution was stored
    let resolution = client.get_resolution(&dispute_id);
    assert_eq!(resolution.arbitrator, arbitrator);
    assert_eq!(resolution.resolution_text, resolution_text);
    assert_eq!(resolution.penalty, Some(500));
    assert!(resolution.resolved_at > 0);
}

/// Test resolution validation
#[test]
fn test_resolution_validation() {
    let env = test_utils::create_test_env();
    let (client, admin, _, _) = test_utils::initialize_test_contract(&env);
    let (_, plaintiff, defendant, arbitrator) = test_utils::generate_test_parties(&env);
    let description = test_utils::create_valid_description(&env);

    // Create a dispute
    let dispute_id = client.with_source_account(&plaintiff).raise_dispute(&plaintiff, &defendant, &description);

    // Volunteer as arbitrator
    client.with_source_account(&arbitrator).volunteer_as_arbitrator(&arbitrator, &dispute_id);

    // Test empty resolution text
    let empty_resolution = String::from_str(&env, "");
    let result = client.with_source_account(&arbitrator).resolve_dispute(
        &dispute_id,
        &arbitrator,
        &empty_resolution,
        &Some(500)
    );
    assert_eq!(result, Err(DisputeError::InvalidResolution));

    // Test resolution text too long
    let long_resolution = String::from_str(&env, &"a".repeat(constants::MAX_RESOLUTION_LENGTH + 1));
    let valid_resolution = test_utils::create_valid_resolution(&env);
    let result = client.with_source_account(&arbitrator).resolve_dispute(
        &dispute_id,
        &arbitrator,
        &long_resolution,
        &Some(500)
    );
    assert_eq!(result, Err(DisputeError::InvalidResolution));

    // Test unauthorized arbitrator
    let unauthorized_arbitrator = Address::generate(&env);
    let result = client.with_source_account(&unauthorized_arbitrator).resolve_dispute(
        &dispute_id,
        &unauthorized_arbitrator,
        &valid_resolution,
        &Some(500)
    );
    assert_eq!(result, Err(DisputeError::UnauthorizedArbitrator));
}

/// Test resolution with different penalty types
#[test]
fn test_resolution_penalty_types() {
    let env = test_utils::create_test_env();
    let (client, admin, _, _) = test_utils::initialize_test_contract(&env);
    let (_, plaintiff, defendant, arbitrator) = test_utils::generate_test_parties(&env);
    let description = test_utils::create_valid_description(&env);
    let resolution_text = test_utils::create_valid_resolution(&env);

    // Create a dispute
    let dispute_id = client.with_source_account(&plaintiff).raise_dispute(&plaintiff, &defendant, &description);
    client.with_source_account(&arbitrator).volunteer_as_arbitrator(&arbitrator, &dispute_id);

    // Test resolution with fine (positive penalty)
    let result = client.with_source_account(&arbitrator).resolve_dispute(
        &dispute_id,
        &arbitrator,
        &resolution_text,
        &Some(1000)
    );
    assert!(result.is_ok());

    let resolution = client.get_resolution(&dispute_id);
    assert_eq!(resolution.penalty, Some(1000));

    // Create another dispute for compensation test
    let dispute_id2 = client.with_source_account(&plaintiff).raise_dispute(&plaintiff, &defendant, &description);
    client.with_source_account(&arbitrator).volunteer_as_arbitrator(&arbitrator, &dispute_id2);

    // Test resolution with compensation (negative penalty)
    let result = client.with_source_account(&arbitrator).resolve_dispute(
        &dispute_id2,
        &arbitrator,
        &resolution_text,
        &Some(-500)
    );
    assert!(result.is_ok());

    let resolution2 = client.get_resolution(&dispute_id2);
    assert_eq!(resolution2.penalty, Some(-500));

    // Test resolution with no penalty
    let dispute_id3 = client.with_source_account(&plaintiff).raise_dispute(&plaintiff, &defendant, &description);
    client.with_source_account(&arbitrator).volunteer_as_arbitrator(&arbitrator, &dispute_id3);

    let result = client.with_source_account(&arbitrator).resolve_dispute(
        &dispute_id3,
        &arbitrator,
        &resolution_text,
        &None
    );
    assert!(result.is_ok());

    let resolution3 = client.get_resolution(&dispute_id3);
    assert_eq!(resolution3.penalty, None);
}

/// Test dispute immutability after resolution
#[test]
fn test_dispute_immutability() {
    let env = test_utils::create_test_env();
    let (client, admin, _, _) = test_utils::initialize_test_contract(&env);
    let (_, plaintiff, defendant, arbitrator) = test_utils::generate_test_parties(&env);
    let description = test_utils::create_valid_description(&env);
    let resolution_text = test_utils::create_valid_resolution(&env);

    // Create and resolve a dispute
    let dispute_id = client.with_source_account(&plaintiff).raise_dispute(&plaintiff, &defendant, &description);
    client.with_source_account(&arbitrator).volunteer_as_arbitrator(&arbitrator, &dispute_id);
    client.with_source_account(&arbitrator).resolve_dispute(&dispute_id, &arbitrator, &resolution_text, &Some(500));

    // Test that resolved dispute cannot be modified
    let new_arbitrator = Address::generate(&env);
    let result = client.with_source_account(&new_arbitrator).volunteer_as_arbitrator(&new_arbitrator, &dispute_id);
    assert_eq!(result, Err(DisputeError::DisputeAlreadyResolved));

    // Test that resolved dispute cannot be resolved again
    let result = client.with_source_account(&arbitrator).resolve_dispute(
        &dispute_id,
        &arbitrator,
        &resolution_text,
        &Some(1000)
    );
    assert_eq!(result, Err(DisputeError::DisputeAlreadyResolved));
}

/// Test multiple arbitrators scenario
#[test]
fn test_multiple_arbitrators() {
    let env = test_utils::create_test_env();
    let (client, admin, _, _) = test_utils::initialize_test_contract(&env);
    let (_, plaintiff, defendant, arbitrator1) = test_utils::generate_test_parties(&env);
    let arbitrator2 = Address::generate(&env);
    let arbitrator3 = Address::generate(&env);
    let description = test_utils::create_valid_description(&env);

    // Create a dispute
    let dispute_id = client.with_source_account(&plaintiff).raise_dispute(&plaintiff, &defendant, &description);

    // Multiple arbitrators volunteer
    client.with_source_account(&arbitrator1).volunteer_as_arbitrator(&arbitrator1, &dispute_id);
    client.with_source_account(&arbitrator2).volunteer_as_arbitrator(&arbitrator2, &dispute_id);
    client.with_source_account(&arbitrator3).volunteer_as_arbitrator(&arbitrator3, &dispute_id);

    // Verify all arbitrators were added
    let dispute = client.get_dispute(&dispute_id);
    assert_eq!(dispute.arbitrators.len(), 3);
    assert!(dispute.arbitrators.contains(&arbitrator1));
    assert!(dispute.arbitrators.contains(&arbitrator2));
    assert!(dispute.arbitrators.contains(&arbitrator3));

    // Test that any arbitrator can resolve the dispute
    let resolution_text = test_utils::create_valid_resolution(&env);
    let result = client.with_source_account(&arbitrator2).resolve_dispute(
        &dispute_id,
        &arbitrator2,
        &resolution_text,
        &Some(300)
    );
    assert!(result.is_ok());

    // Verify resolution was stored with the correct arbitrator
    let resolution = client.get_resolution(&dispute_id);
    assert_eq!(resolution.arbitrator, arbitrator2);
}

/// Test open disputes listing
#[test]
fn test_open_disputes_listing() {
    let env = test_utils::create_test_env();
    let (client, admin, _, _) = test_utils::initialize_test_contract(&env);
    let (_, plaintiff1, defendant1, _) = test_utils::generate_test_parties(&env);
    let plaintiff2 = Address::generate(&env);
    let defendant2 = Address::generate(&env);
    let plaintiff3 = Address::generate(&env);
    let defendant3 = Address::generate(&env);
    let description = test_utils::create_valid_description(&env);

    // Create multiple disputes
    let dispute_id1 = client.with_source_account(&plaintiff1).raise_dispute(&plaintiff1, &defendant1, &description);
    let dispute_id2 = client.with_source_account(&plaintiff2).raise_dispute(&plaintiff2, &defendant2, &description);
    let dispute_id3 = client.with_source_account(&plaintiff3).raise_dispute(&plaintiff3, &defendant3, &description);

    // List open disputes
    let open_disputes = client.list_open_disputes(&0, &10);
    assert_eq!(open_disputes.len(), 3);
    assert!(open_disputes.contains(&dispute_id1));
    assert!(open_disputes.contains(&dispute_id2));
    assert!(open_disputes.contains(&dispute_id3));

    // Resolve one dispute
    let arbitrator = Address::generate(&env);
    let resolution_text = test_utils::create_valid_resolution(&env);
    client.with_source_account(&arbitrator).volunteer_as_arbitrator(&arbitrator, &dispute_id1);
    client.with_source_account(&arbitrator).resolve_dispute(&dispute_id1, &arbitrator, &resolution_text, &Some(500));

    // Verify only 2 disputes remain open
    let open_disputes_after = client.list_open_disputes(&0, &10);
    assert_eq!(open_disputes_after.len(), 2);
    assert!(!open_disputes_after.contains(&dispute_id1));
    assert!(open_disputes_after.contains(&dispute_id2));
    assert!(open_disputes_after.contains(&dispute_id3));
}

/// Test emergency mode functionality
#[test]
fn test_emergency_mode() {
    let env = test_utils::create_test_env();
    let (client, admin, _, _) = test_utils::initialize_test_contract(&env);
    let (_, plaintiff, defendant, arbitrator) = test_utils::generate_test_parties(&env);
    let description = test_utils::create_valid_description(&env);

    // Enable emergency mode
    client.with_source_account(&admin).set_emergency_state(&admin, &true);
    assert!(client.is_emergency());

    // Test that operations are blocked in emergency mode
    let result = client.with_source_account(&plaintiff).raise_dispute(&plaintiff, &defendant, &description);
    assert_eq!(result, Err(DisputeError::EmergencyMode));

    // Disable emergency mode
    client.with_source_account(&admin).set_emergency_state(&admin, &false);
    assert!(!client.is_emergency());

    // Test that operations work again
    let dispute_id = client.with_source_account(&plaintiff).raise_dispute(&plaintiff, &defendant, &description);
    assert_eq!(dispute_id, 1);
}

/// Test edge cases and error conditions
#[test]
fn test_edge_cases() {
    let env = test_utils::create_test_env();
    let (client, admin, _, _) = test_utils::initialize_test_contract(&env);
    let (_, plaintiff, defendant, arbitrator) = test_utils::generate_test_parties(&env);
    let description = test_utils::create_valid_description(&env);

    // Test non-existent dispute
    let result = client.get_dispute(&999);
    assert_eq!(result, Err(DisputeError::DisputeNotFound));

    let result = client.get_resolution(&999);
    assert_eq!(result, Err(DisputeError::DisputeNotFound));

    let result = client.get_dispute_status(&999);
    assert_eq!(result, Err(DisputeError::DisputeNotFound));

    // Test unauthorized admin operations
    let unauthorized_admin = Address::generate(&env);
    let result = client.with_source_account(&unauthorized_admin).set_emergency_state(&unauthorized_admin, &true);
    assert_eq!(result, Err(DisputeError::Unauthorized));

    // Test penalty limits
    let dispute_id = client.with_source_account(&plaintiff).raise_dispute(&plaintiff, &defendant, &description);
    client.with_source_account(&arbitrator).volunteer_as_arbitrator(&arbitrator, &dispute_id);
    let resolution_text = test_utils::create_valid_resolution(&env);

    // Test penalty within limits
    let result = client.with_source_account(&arbitrator).resolve_dispute(
        &dispute_id,
        &arbitrator,
        &resolution_text,
        &Some(constants::MAX_PENALTY_AMOUNT)
    );
    assert!(result.is_ok());

    // Test penalty at minimum limit
    let dispute_id2 = client.with_source_account(&plaintiff).raise_dispute(&plaintiff, &defendant, &description);
    client.with_source_account(&arbitrator).volunteer_as_arbitrator(&arbitrator, &dispute_id2);
    let result = client.with_source_account(&arbitrator).resolve_dispute(
        &dispute_id2,
        &arbitrator,
        &resolution_text,
        &Some(constants::MIN_PENALTY_AMOUNT)
    );
    assert!(result.is_ok());
}

/// Test DAO context with multiple disputes and arbitrators
#[test]
fn test_dao_context_scenarios() {
    let env = test_utils::create_test_env();
    let (client, admin, _, _) = test_utils::initialize_test_contract(&env);
    
    // Generate multiple DAO members
    let members: Vec<Address> = (0..10).map(|_| Address::generate(&env)).collect();
    let description = test_utils::create_valid_description(&env);

    // Create multiple disputes between different members
    let mut dispute_ids = Vec::new(&env);
    for i in 0..5 {
        let plaintiff = &members[i];
        let defendant = &members[i + 5];
        let dispute_id = client.with_source_account(plaintiff).raise_dispute(plaintiff, defendant, &description);
        dispute_ids.push_back(dispute_id);
    }

    // Verify all disputes were created
    assert_eq!(client.get_total_disputes(), 5);
    let open_disputes = client.list_open_disputes(&0, &10);
    assert_eq!(open_disputes.len(), 5);

    // Multiple arbitrators volunteer for different disputes
    let arbitrators: Vec<Address> = (0..3).map(|_| Address::generate(&env)).collect();
    
    for (i, dispute_id) in dispute_ids.iter().enumerate() {
        let arbitrator = &arbitrators[i % arbitrators.len()];
        let result = client.with_source_account(arbitrator).volunteer_as_arbitrator(arbitrator, dispute_id);
        assert!(result.is_ok());
    }

    // Resolve some disputes
    let resolution_text = test_utils::create_valid_resolution(&env);
    for (i, dispute_id) in dispute_ids.iter().enumerate() {
        if i < 3 { // Resolve first 3 disputes
            let arbitrator = &arbitrators[i % arbitrators.len()];
            let result = client.with_source_account(arbitrator).resolve_dispute(
                dispute_id,
                arbitrator,
                &resolution_text,
                &Some(100 * (i as i128 + 1))
            );
            assert!(result.is_ok());
        }
    }

    // Verify final state
    let final_open_disputes = client.list_open_disputes(&0, &10);
    assert_eq!(final_open_disputes.len(), 2); // 2 disputes remain open

    // Verify resolved disputes cannot be modified
    for i in 0..3 {
        let dispute_id = dispute_ids.get(i);
        let new_arbitrator = Address::generate(&env);
        let result = client.with_source_account(&new_arbitrator).volunteer_as_arbitrator(&new_arbitrator, &dispute_id);
        assert_eq!(result, Err(DisputeError::DisputeAlreadyResolved));
    }
}

/// Test dispute lifecycle integrity
#[test]
fn test_dispute_lifecycle_integrity() {
    let env = test_utils::create_test_env();
    let (client, admin, _, _) = test_utils::initialize_test_contract(&env);
    let (_, plaintiff, defendant, arbitrator) = test_utils::generate_test_parties(&env);
    let description = test_utils::create_valid_description(&env);
    let resolution_text = test_utils::create_valid_resolution(&env);

    // Step 1: Create dispute
    let dispute_id = client.with_source_account(&plaintiff).raise_dispute(&plaintiff, &defendant, &description);
    let initial_dispute = client.get_dispute(&dispute_id);
    assert_eq!(initial_dispute.status, DisputeStatus::Open);
    assert_eq!(initial_dispute.arbitrators.len(), 0);

    // Step 2: Arbitrator volunteers
    client.with_source_account(&arbitrator).volunteer_as_arbitrator(&arbitrator, &dispute_id);
    let dispute_with_arbitrator = client.get_dispute(&dispute_id);
    assert_eq!(dispute_with_arbitrator.status, DisputeStatus::Open);
    assert_eq!(dispute_with_arbitrator.arbitrators.len(), 1);
    assert_eq!(dispute_with_arbitrator.arbitrators.get(0), Some(arbitrator.clone()));

    // Step 3: Resolve dispute
    client.with_source_account(&arbitrator).resolve_dispute(&dispute_id, &arbitrator, &resolution_text, &Some(500));
    let resolved_dispute = client.get_dispute(&dispute_id);
    assert_eq!(resolved_dispute.status, DisputeStatus::Resolved);

    // Step 4: Verify resolution is immutable
    let resolution = client.get_resolution(&dispute_id);
    assert_eq!(resolution.arbitrator, arbitrator);
    assert_eq!(resolution.resolution_text, resolution_text);
    assert_eq!(resolution.penalty, Some(500));

    // Step 5: Verify no further modifications possible
    let new_arbitrator = Address::generate(&env);
    let result = client.with_source_account(&new_arbitrator).volunteer_as_arbitrator(&new_arbitrator, &dispute_id);
    assert_eq!(result, Err(DisputeError::DisputeAlreadyResolved));

    let result = client.with_source_account(&arbitrator).resolve_dispute(
        &dispute_id,
        &arbitrator,
        &resolution_text,
        &Some(1000)
    );
    assert_eq!(result, Err(DisputeError::DisputeAlreadyResolved));
}

/// Test fairness and immutability principles
#[test]
fn test_fairness_and_immutability() {
    let env = test_utils::create_test_env();
    let (client, admin, _, _) = test_utils::initialize_test_contract(&env);
    let (_, plaintiff, defendant, arbitrator) = test_utils::generate_test_parties(&env);
    let description = test_utils::create_valid_description(&env);
    let resolution_text = test_utils::create_valid_resolution(&env);

    // Create dispute
    let dispute_id = client.with_source_account(&plaintiff).raise_dispute(&plaintiff, &defendant, &description);
    
    // Verify parties cannot arbitrate their own dispute (fairness)
    let result = client.with_source_account(&plaintiff).volunteer_as_arbitrator(&plaintiff, &dispute_id);
    assert_eq!(result, Err(DisputeError::ConflictOfInterest));

    let result = client.with_source_account(&defendant).volunteer_as_arbitrator(&defendant, &dispute_id);
    assert_eq!(result, Err(DisputeError::ConflictOfInterest));

    // Third party can volunteer
    client.with_source_account(&arbitrator).volunteer_as_arbitrator(&arbitrator, &dispute_id);
    
    // Resolve dispute
    client.with_source_account(&arbitrator).resolve_dispute(&dispute_id, &arbitrator, &resolution_text, &Some(500));

    // Verify resolution is immutable (integrity)
    let resolution = client.get_resolution(&dispute_id);
    let original_arbitrator = resolution.arbitrator.clone();
    let original_text = resolution.resolution_text.clone();
    let original_penalty = resolution.penalty;

    // Attempt to modify through new resolution (should fail)
    let new_arbitrator = Address::generate(&env);
    let new_resolution_text = String::from_str(&env, "Attempted modification");
    let result = client.with_source_account(&new_arbitrator).resolve_dispute(
        &dispute_id,
        &new_arbitrator,
        &new_resolution_text,
        &Some(1000)
    );
    assert_eq!(result, Err(DisputeError::DisputeAlreadyResolved));

    // Verify original resolution unchanged
    let resolution_after_attempt = client.get_resolution(&dispute_id);
    assert_eq!(resolution_after_attempt.arbitrator, original_arbitrator);
    assert_eq!(resolution_after_attempt.resolution_text, original_text);
    assert_eq!(resolution_after_attempt.penalty, original_penalty);
} 