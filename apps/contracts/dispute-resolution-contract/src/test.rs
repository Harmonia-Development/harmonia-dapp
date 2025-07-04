#[cfg(test)]
mod tests {
    use soroban_sdk::{testutils::Address as _, Env, String};
    use crate::{
        DisputeResolutionContract,
        DisputeError,
        DisputeStatus,
        Resolution,
        Dispute,
    };

    // Helper function to setup test environment
    fn setup() -> (Env, Address, Address, Address) {
        let env = Env::default();
        let admin = Address::generate(&env);
        let member_registry = Address::generate(&env);
        let treasury = Address::generate(&env);

        // Initialize contract
        DisputeResolutionContract::initialize(
            env.clone(),
            admin.clone(),
            member_registry.clone(),
            treasury.clone(),
        ).unwrap();

        (env, admin, member_registry, treasury)
    }

    #[test]
    fn test_dispute_lifecycle() {
        let (env, _, _, _) = setup();
        let plaintiff = Address::generate(&env);
        let defendant = Address::generate(&env);
        let arbitrator = Address::generate(&env);

        // 1. Create dispute
        let description = String::from_str(&env, "Test dispute description");
        let dispute_id = DisputeResolutionContract::raise_dispute(
            env.clone(),
            plaintiff.clone(),
            defendant.clone(),
            description.clone(),
        ).unwrap();

        // Verify dispute creation
        let dispute = DisputeResolutionContract::get_dispute(env.clone(), dispute_id).unwrap();
        assert_eq!(dispute.plaintiff, plaintiff);
        assert_eq!(dispute.defendant, defendant);
        assert_eq!(dispute.description, description);
        assert_eq!(dispute.status, DisputeStatus::Open);
        assert_eq!(dispute.arbitrator_count(), 0);

        // 2. Volunteer as arbitrator
        DisputeResolutionContract::volunteer_as_arbitrator(
            env.clone(),
            arbitrator.clone(),
            dispute_id,
        ).unwrap();

        // Verify arbitrator assignment
        let dispute = DisputeResolutionContract::get_dispute(env.clone(), dispute_id).unwrap();
        assert!(dispute.has_arbitrator(&arbitrator));
        assert_eq!(dispute.arbitrator_count(), 1);

        // 3. Resolve dispute
        let resolution_text = String::from_str(&env, "Resolution with compensation");
        let penalty = Some(-500); // Compensation to plaintiff
        DisputeResolutionContract::resolve_dispute(
            env.clone(),
            dispute_id,
            arbitrator.clone(),
            resolution_text.clone(),
            penalty,
        ).unwrap();

        // Verify resolution
        let dispute = DisputeResolutionContract::get_dispute(env.clone(), dispute_id).unwrap();
        assert_eq!(dispute.status, DisputeStatus::Resolved);

        let resolution = DisputeResolutionContract::get_resolution(env.clone(), dispute_id).unwrap();
        assert_eq!(resolution.arbitrator, arbitrator);
        assert_eq!(resolution.resolution_text, resolution_text);
        assert_eq!(resolution.penalty, penalty);
    }

    #[test]
    fn test_dispute_validation() {
        let (env, _, _, _) = setup();
        let plaintiff = Address::generate(&env);
        let defendant = Address::generate(&env);

        // Test self-dispute prevention
        let result = DisputeResolutionContract::raise_dispute(
            env.clone(),
            plaintiff.clone(),
            plaintiff.clone(),
            String::from_str(&env, "Invalid self-dispute"),
        );
        assert_eq!(result, Err(DisputeError::SelfDispute));

        // Test empty description
        let result = DisputeResolutionContract::raise_dispute(
            env.clone(),
            plaintiff.clone(),
            defendant.clone(),
            String::from_str(&env, ""),
        );
        assert_eq!(result, Err(DisputeError::InvalidDescription));

        // Test valid dispute creation
        let result = DisputeResolutionContract::raise_dispute(
            env.clone(),
            plaintiff.clone(),
            defendant.clone(),
            String::from_str(&env, "Valid dispute"),
        );
        assert!(result.is_ok());
    }

    #[test]
    fn test_arbitrator_restrictions() {
        let (env, _, _, _) = setup();
        let plaintiff = Address::generate(&env);
        let defendant = Address::generate(&env);
        let arbitrator = Address::generate(&env);

        // Create dispute
        let dispute_id = DisputeResolutionContract::raise_dispute(
            env.clone(),
            plaintiff.clone(),
            defendant.clone(),
            String::from_str(&env, "Test dispute"),
        ).unwrap();

        // Test plaintiff cannot be arbitrator
        let result = DisputeResolutionContract::volunteer_as_arbitrator(
            env.clone(),
            plaintiff.clone(),
            dispute_id,
        );
        assert_eq!(result, Err(DisputeError::ConflictOfInterest));

        // Test valid arbitrator volunteering
        let result = DisputeResolutionContract::volunteer_as_arbitrator(
            env.clone(),
            arbitrator.clone(),
            dispute_id,
        );
        assert!(result.is_ok());

        // Test duplicate volunteering prevention
        let result = DisputeResolutionContract::volunteer_as_arbitrator(
            env.clone(),
            arbitrator.clone(),
            dispute_id,
        );
        assert_eq!(result, Err(DisputeError::AlreadyVolunteered));
    }

    #[test]
    fn test_resolution_immutability() {
        let (env, _, _, _) = setup();
        let plaintiff = Address::generate(&env);
        let defendant = Address::generate(&env);
        let arbitrator = Address::generate(&env);

        // Create and resolve dispute
        let dispute_id = DisputeResolutionContract::raise_dispute(
            env.clone(),
            plaintiff.clone(),
            defendant.clone(),
            String::from_str(&env, "Test dispute"),
        ).unwrap();

        DisputeResolutionContract::volunteer_as_arbitrator(
            env.clone(),
            arbitrator.clone(),
            dispute_id,
        ).unwrap();

        DisputeResolutionContract::resolve_dispute(
            env.clone(),
            dispute_id,
            arbitrator.clone(),
            String::from_str(&env, "Initial resolution"),
            Some(100),
        ).unwrap();

        // Attempt to modify resolved dispute
        let result = DisputeResolutionContract::resolve_dispute(
            env.clone(),
            dispute_id,
            arbitrator.clone(),
            String::from_str(&env, "Modified resolution"),
            Some(200),
        );
        assert_eq!(result, Err(DisputeError::DisputeAlreadyResolved));

        // Verify original resolution remains unchanged
        let resolution = DisputeResolutionContract::get_resolution(env.clone(), dispute_id).unwrap();
        assert_eq!(resolution.resolution_text, String::from_str(&env, "Initial resolution"));
        assert_eq!(resolution.penalty, Some(100));
    }
} 