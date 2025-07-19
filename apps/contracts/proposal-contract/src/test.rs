#![cfg(test)]

use soroban_sdk::{
    testutils::{Address as _, Ledger, Events},
    Address, Env, Symbol, symbol_short, String, IntoVal, vec,
};
use crate::{ProposalContract, ProposalContractClient};
use crate::datatypes::ProposalStatus;

// Macro to simplify event assertion across tests
macro_rules! assert_event {
    ($env:expr, $contract_id:expr, $topic:expr, $data:expr) => {
        assert_eq!(
            $env.events().all(),
            vec![
                &$env,
                (
                    $contract_id.clone(),
                    (Symbol::new(&$env, $topic),).into_val(&$env),
                    $data.into_val(&$env)
                )
            ]
        );
    };
}

// Converts a ProposalStatus into a short Symbol and compares with expected label
fn status_eq(a: &ProposalStatus, s: &str, env: &Env) -> bool {
    match a {
        ProposalStatus::Open => symbol_short!("open") == Symbol::new(env, s),
        ProposalStatus::Closed => symbol_short!("closed") == Symbol::new(env, s),
        ProposalStatus::Accepted => symbol_short!("accepted") == Symbol::new(env, s),
        ProposalStatus::Rejected => symbol_short!("rejected") == Symbol::new(env, s),
    }
}

// Common setup function to initialize Env, Contract, a test user, and client
fn setup<'a>() -> (Env, Address, Address, ProposalContractClient<'a>) {
    let env = Env::default();
    let contract_id = env.register(ProposalContract, ());
    let client = ProposalContractClient::new(&env, &contract_id);
    let user = Address::generate(&env);
    env.mock_all_auths();
    (env, user, contract_id, client)
}

// Checks proposal creation and retrieval
#[test]
fn test_create_and_get_proposal() {
    let (env, user, contract_id, client) = setup();

    client.create_proposal(
        &user,
        &String::from_str(&env, "Title"),
        &String::from_str(&env, "Description"),
        &(env.ledger().timestamp() + 100),
        &Symbol::new(&env, "governance"),
        &Some(3),
    );
    assert_event!(env, contract_id, "proposal_created", 1u32);

    let proposal = client.get_proposal(&1);
    assert_eq!(proposal.title, String::from_str(&env, "Title"));
    assert!(status_eq(&proposal.status, "open", &env));
}

// Ensures a user cannot vote more than once on the same proposal
#[test]
#[should_panic(expected = "HostError: Error(Contract, #4)")]
fn test_prevent_double_vote() {
    let (env, user, contract_id, client) = setup();

    client.create_proposal(
        &user,
        &String::from_str(&env, "Proposal"),
        &String::from_str(&env, "Test"),
        &(env.ledger().timestamp() + 100),
        &Symbol::new(&env, "governance"),
        &None,
    );
    assert_event!(env, contract_id, "proposal_created", 1u32);

    client.vote(&user, &1, &symbol_short!("For"));
    assert_event!(env, contract_id, "vote_cast", (1u32, user.clone(), symbol_short!("For")));
    client.vote(&user, &1, &symbol_short!("For"));
}

// Verifies that a proposal is accepted if quorum is met and majority votes are in favor
#[test]
fn test_finalize_accepted_when_quorum_met() {
    let (env, user1, contract_id, client) = setup();
    let user2 = Address::generate(&env);
    let user3 = Address::generate(&env);

    let now = env.ledger().timestamp();

    client.create_proposal(
        &user1,
        &String::from_str(&env, "Majority For"),
        &String::from_str(&env, "Accepted 1"),
        &(now + 10),
        &Symbol::new(&env, "community"),
        &Some(3),
    );
    assert_event!(env, contract_id, "proposal_created", 1u32);    

    client.vote(&user1, &1, &symbol_short!("For"));
    assert_event!(env, contract_id, "vote_cast", (1u32, user1.clone(), symbol_short!("For")));
    client.vote(&user2, &1, &symbol_short!("For"));
    assert_event!(env, contract_id, "vote_cast", (1u32, user2.clone(), symbol_short!("For")));
    client.vote(&user3, &1, &symbol_short!("Abstain"));
    assert_event!(env, contract_id, "vote_cast", (1u32, user3.clone(), symbol_short!("Abstain")));

    env.ledger().set_timestamp(now + 20);
    client.finalize(&1);
    assert_event!(env, contract_id, "proposal_finalized", (1u32, symbol_short!("accepted")));

    let proposal = client.get_proposal(&1);
    assert!(status_eq(&proposal.status, "accepted", &env));
}

// Verifies that a proposal is closed if quorum is not met
#[test]
fn test_finalize_closed_when_quorum_not_met() {
    let (env, user, contract_id, client) = setup();

    client.create_proposal(
        &user,
        &String::from_str(&env, "Low Votes"),
        &String::from_str(&env, "Will Close"),
        &(env.ledger().timestamp() + 5),
        &Symbol::new(&env, "governance"),
        &Some(5),
    );
    assert_event!(env, contract_id, "proposal_created", 1u32);

    client.vote(&user, &1, &symbol_short!("For"));
    assert_event!(env, contract_id, "vote_cast", (1u32, user.clone(), symbol_short!("For")));

    env.ledger().set_timestamp(env.ledger().timestamp() + 10);
    client.finalize(&1);
    assert_event!(env, contract_id, "proposal_finalized", (1u32, symbol_short!("closed")));

    let proposal = client.get_proposal(&1);
    assert!(status_eq(&proposal.status, "closed", &env));
}

// Checks rejection when majority of effective votes are against, and no quorum is required
#[test]
fn test_finalize_without_quorum_majority_against() {
    let (env, user1, contract_id, client) = setup();
    let user2 = Address::generate(&env);

    let deadline = env.ledger().timestamp() + 10;

    client.create_proposal(
        &user1,
        &String::from_str(&env, "No Quorum"),
        &String::from_str(&env, "Majority Against"),
        &deadline,
        &Symbol::new(&env, "treasury"),
        &None,
    );
    assert_event!(env, contract_id, "proposal_created", 1u32);

    client.vote(&user1, &1, &symbol_short!("Against"));
    assert_event!(env, contract_id, "vote_cast", (1u32, user1.clone(), symbol_short!("Against")));

    client.vote(&user2, &1, &symbol_short!("Abstain"));
    assert_event!(env, contract_id, "vote_cast", (1u32, user2.clone(), symbol_short!("Abstain")));

    env.ledger().set_timestamp(deadline + 5);
    client.finalize(&1);
    assert_event!(env, contract_id, "proposal_finalized", (1u32, symbol_short!("rejected")));

    let proposal = client.get_proposal(&1);
    assert!(status_eq(&proposal.status, "rejected", &env));
}

// Validates tie results in rejection (equal For and Against votes)
#[test]
fn test_finalize_rejected_on_for_against_tie() {
    let (env, user1, contract_id, client) = setup();
    let user2 = Address::generate(&env);

    client.create_proposal(
        &user1,
        &String::from_str(&env, "Tie"),
        &String::from_str(&env, "Tie Votes"),
        &(env.ledger().timestamp() + 10),
        &Symbol::new(&env, "technical"),
        &None,
    );
    assert_event!(env, contract_id, "proposal_created", 1u32);

    client.vote(&user1, &1, &symbol_short!("For"));
    assert_event!(env, contract_id, "vote_cast", (1u32, user1.clone(), symbol_short!("For")));

    client.vote(&user2, &1, &symbol_short!("Against"));
    assert_event!(env, contract_id, "vote_cast", (1u32, user2.clone(), symbol_short!("Against")));

    env.ledger().set_timestamp(env.ledger().timestamp() + 20);
    client.finalize(&1);
    assert_event!(env, contract_id, "proposal_finalized", (1u32, symbol_short!("rejected")));

    let proposal = client.get_proposal(&1);
    assert!(status_eq(&proposal.status, "rejected", &env));
}

// Ensures that proposals with only Abstain votes are rejected
#[test]
fn test_finalize_rejected_when_only_abstain() {
    let (env, user1, contract_id, client) = setup();
    let user2 = Address::generate(&env);

    let deadline = env.ledger().timestamp() + 10;

    client.create_proposal(
        &user1,
        &String::from_str(&env, "Only Abstain"),
        &String::from_str(&env, "No Effective Votes"),
        &deadline,
        &Symbol::new(&env, "treasury"),
        &None,
    );
    assert_event!(env, contract_id, "proposal_created", 1u32);

    client.vote(&user1, &1, &symbol_short!("Abstain"));
    assert_event!(env, contract_id, "vote_cast", (1u32, user1.clone(), symbol_short!("Abstain")));

    client.vote(&user2, &1, &symbol_short!("Abstain"));
    assert_event!(env, contract_id, "vote_cast", (1u32, user2.clone(), symbol_short!("Abstain")));

    env.ledger().set_timestamp(deadline + 1);
    client.finalize(&1);
    assert_event!(env, contract_id, "proposal_finalized", (1u32, symbol_short!("rejected")));

    let proposal = client.get_proposal(&1);
    assert!(status_eq(&proposal.status, "rejected", &env));
}

// Confirms panic if trying to finalize before deadline
#[test]
#[should_panic(expected = "HostError: Error(Contract, #10)")]
fn test_finalize_panics_before_deadline() {
    let (env, user, contract_id, client) = setup();

    client.create_proposal(
        &user,
        &String::from_str(&env, "Too Early"),
        &String::from_str(&env, "Panic Test"),
        &(env.ledger().timestamp() + 100),
        &Symbol::new(&env, "governance"),
        &None,
    );
    assert_event!(env, contract_id, "proposal_created", 1u32);

    client.finalize(&1);
}

// Validates panic on voting for nonexistent proposal
#[test]
#[should_panic(expected = "HostError: Error(Contract, #5)")]
fn test_vote_on_nonexistent_proposal() {
    let (_, user, _, client) = setup();
    client.vote(&user, &99, &symbol_short!("For"));
}

// Ensures invalid proposal type is rejected
#[test]
#[should_panic(expected = "HostError: Error(Contract, #3)")]
fn test_invalid_proposal_type() {
    let (env, user, _, client) = setup();
    client.create_proposal(
        &user,
        &String::from_str(&env, "Invalid Type"),
        &String::from_str(&env, "Invalid"),
        &(env.ledger().timestamp() + 50),
        &Symbol::new(&env, "invalid_type"),
        &None,
    );
}

// Ensures voting fails if deadline has passed
#[test]
#[should_panic(expected = "HostError: Error(Contract, #7)")]
fn test_vote_after_deadline() {
    let (env, user, contract_id, client) = setup();
    let deadline = env.ledger().timestamp() + 10;
    client.create_proposal(
        &user,
        &String::from_str(&env, "Late Vote"),
        &String::from_str(&env, "Closed"),
        &deadline,
        &Symbol::new(&env, "treasury"),
        &None,
    );
    assert_event!(env, contract_id, "proposal_created", 1u32);
    env.ledger().set_timestamp(deadline + 5);
    client.vote(&user, &1, &symbol_short!("For"));
}

// Ensures voting fails on a proposal that's already finalized
#[test]
#[should_panic(expected = "HostError: Error(Contract, #6)")]
fn test_vote_on_closed_proposal() {
    let (env, user, contract_id, client) = setup();
    client.create_proposal(
        &user,
        &String::from_str(&env, "Closed Test"),
        &String::from_str(&env, "Closed"),
        &(env.ledger().timestamp() + 10),
        &Symbol::new(&env, "community"),
        &None,
    );
    assert_event!(env, contract_id, "proposal_created", 1u32);
    env.ledger().set_timestamp(env.ledger().timestamp() + 20);
    client.finalize(&1);
    assert_event!(env, contract_id, "proposal_finalized", (1u32, symbol_short!("rejected")));
    client.vote(&user, &1, &symbol_short!("For"));
}

// Ensures voting fails with invalid vote choice symbol
#[test]
#[should_panic(expected = "HostError: Error(Contract, #8)")]
fn test_invalid_vote_choice() {
    let (env, user, contract_id, client) = setup();
    client.create_proposal(
        &user,
        &String::from_str(&env, "Bad Vote"),
        &String::from_str(&env, "Invalid Choice"),
        &(env.ledger().timestamp() + 100),
        &Symbol::new(&env, "governance"),
        &None,
    );
    assert_event!(env, contract_id, "proposal_created", 1u32);
    client.vote(&user, &1, &Symbol::new(&env, "Bad"));
}

// Validates proposal is closed (not accepted) when quorum is required but no votes were cast
#[test]
fn test_finalize_closed_with_quorum_and_no_votes() {
    let (env, user, contract_id, client) = setup();

    let deadline = env.ledger().timestamp() + 10;

    client.create_proposal(
        &user,
        &String::from_str(&env, "No Votes With Quorum"),
        &String::from_str(&env, "Should Be Closed"),
        &deadline,
        &Symbol::new(&env, "treasury"),
        &Some(3),
    );
    assert_event!(env, contract_id, "proposal_created", 1u32);

    env.ledger().set_timestamp(deadline + 1);
    client.finalize(&1);
    assert_event!(env, contract_id, "proposal_finalized", (1u32, symbol_short!("closed")));

    let proposal = client.get_proposal(&1);
    assert!(status_eq(&proposal.status, "closed", &env));
}

// Validates rejection when no quorum is set and no votes are cast
#[test]
fn test_finalize_rejected_without_quorum_and_no_votes() {
    let (env, user, contract_id, client) = setup();

    let deadline = env.ledger().timestamp() + 10;

    client.create_proposal(
        &user,
        &String::from_str(&env, "No Votes No Quorum"),
        &String::from_str(&env, "Should Be Rejected"),
        &deadline,
        &Symbol::new(&env, "treasury"),
        &None,
    );
    assert_event!(env, contract_id, "proposal_created", 1u32);

    env.ledger().set_timestamp(deadline + 1);
    client.finalize(&1);
    assert_event!(env, contract_id, "proposal_finalized", (1u32, symbol_short!("rejected")));

    let proposal = client.get_proposal(&1);
    assert!(status_eq(&proposal.status, "rejected", &env));
}

// Confirms proposals cannot be created without proper authorization
#[test]
#[should_panic(expected = "HostError")]
fn test_create_proposal_without_auth_should_fail() {
    let env = Env::default();
    let contract_id = env.register(ProposalContract, ());
    let client = ProposalContractClient::new(&env, &contract_id);

    let unauth_user = Address::generate(&env);

    client.create_proposal(
        &unauth_user,
        &String::from_str(&env, "Unauthorized"),
        &String::from_str(&env, "Fail"),
        &(env.ledger().timestamp() + 100),
        &Symbol::new(&env, "governance"),
        &None,
    );
}

// Verifies that `get_all_proposals` returns all created proposals in order
#[test]
fn test_get_all_proposals_returns_all() {
    let (env, user, _contract_id, client) = setup();

    client.create_proposal(
        &user,
        &String::from_str(&env, "Proposal 1"),
        &String::from_str(&env, "Description 1"),
        &(env.ledger().timestamp() + 100),
        &Symbol::new(&env, "governance"),
        &Some(2),
    );

    client.create_proposal(
        &user,
        &String::from_str(&env, "Proposal 2"),
        &String::from_str(&env, "Description 2"),
        &(env.ledger().timestamp() + 200),
        &Symbol::new(&env, "technical"),
        &None,
    );

    let proposals = client.get_all_proposals();

    assert_eq!(proposals.len(), 2);
    assert_eq!(proposals.get(0).unwrap().title, String::from_str(&env, "Proposal 1"));
    assert_eq!(proposals.get(1).unwrap().title, String::from_str(&env, "Proposal 2"));
}
