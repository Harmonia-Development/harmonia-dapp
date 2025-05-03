#![cfg(test)]

use soroban_sdk::{
    testutils::{Address as _, Ledger, Events},
    Address, Env, Symbol, symbol_short, String, IntoVal, vec,
};
use crate::{ProposalContract, ProposalContractClient};
use crate::datatypes::ProposalStatus;

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

// Helper to compare status with symbol
fn status_eq(a: &ProposalStatus, s: &str, env: &Env) -> bool {
    match a {
        ProposalStatus::Open => symbol_short!("open") == Symbol::new(env, s),
        ProposalStatus::Closed => symbol_short!("closed") == Symbol::new(env, s),
        ProposalStatus::Accepted => symbol_short!("accepted") == Symbol::new(env, s),
        ProposalStatus::Rejected => symbol_short!("rejected") == Symbol::new(env, s),
    }
}

#[test]
fn test_create_and_get_proposal() {
    let env = Env::default();
    let contract_id = env.register(ProposalContract, ());
    let client = ProposalContractClient::new(&env, &contract_id);

    let user = Address::generate(&env);
    env.mock_all_auths();

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

#[test]
#[should_panic(expected = "Already voted")]
fn test_prevent_double_vote() {
    let env = Env::default();
    let contract_id = env.register(ProposalContract, ());
    let client = ProposalContractClient::new(&env, &contract_id);

    let user = Address::generate(&env);
    env.mock_all_auths();

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

#[test]
fn test_finalize_accepted_when_quorum_met() {
    let env = Env::default();
    let contract_id = env.register(ProposalContract, ());
    let client = ProposalContractClient::new(&env, &contract_id);

    let user1 = Address::generate(&env);
    let user2 = Address::generate(&env);
    let user3 = Address::generate(&env);
    env.mock_all_auths();

    let now = env.ledger().timestamp();

    client.create_proposal(
        &user1,
        &String::from_str(&env, "Majority For"),
        &String::from_str(&env, "Accepted 1"),
        &(now + 10),
        &Symbol::new(&env, "system"),
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

#[test]
fn test_finalize_closed_when_quorum_not_met() {
    let env = Env::default();
    let contract_id = env.register(ProposalContract, ());
    let client = ProposalContractClient::new(&env, &contract_id);

    let user = Address::generate(&env);
    env.mock_all_auths();

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

#[test]
fn test_finalize_without_quorum_majority_against() {
    let env = Env::default();
    let contract_id = env.register(ProposalContract, ());
    let client = ProposalContractClient::new(&env, &contract_id);

    let user1 = Address::generate(&env);
    let user2 = Address::generate(&env);
    env.mock_all_auths();

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

#[test]
fn test_finalize_rejected_on_for_against_tie() {
    let env = Env::default();
    let contract_id = env.register(ProposalContract, ());
    let client = ProposalContractClient::new(&env, &contract_id);

    let user1 = Address::generate(&env);
    let user2 = Address::generate(&env);
    env.mock_all_auths();

    client.create_proposal(
        &user1,
        &String::from_str(&env, "Tie"),
        &String::from_str(&env, "Tie Votes"),
        &(env.ledger().timestamp() + 10),
        &Symbol::new(&env, "system"),
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

#[test]
fn test_finalize_rejected_when_only_abstain() {
    let env = Env::default();
    let contract_id = env.register(ProposalContract, ());
    let client = ProposalContractClient::new(&env, &contract_id);

    let user1 = Address::generate(&env);
    let user2 = Address::generate(&env);
    env.mock_all_auths();

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

#[test]
#[should_panic(expected = "Deadline not reached")]
fn test_finalize_panics_before_deadline() {
    let env = Env::default();
    let contract_id = env.register(ProposalContract, ());
    let client = ProposalContractClient::new(&env, &contract_id);

    let user = Address::generate(&env);
    env.mock_all_auths();

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

#[test]
#[should_panic(expected = "Proposal not found")]
fn test_vote_on_nonexistent_proposal() {
    let env = Env::default();
    let contract_id = env.register(ProposalContract, ());
    let client = ProposalContractClient::new(&env, &contract_id);
    let user = Address::generate(&env);
    env.mock_all_auths();
    client.vote(&user, &99, &symbol_short!("For"));
}

#[test]
#[should_panic(expected = "Invalid proposal type")]
fn test_invalid_proposal_type() {
    let env = Env::default();
    let contract_id = env.register(ProposalContract, ());
    let client = ProposalContractClient::new(&env, &contract_id);
    let user = Address::generate(&env);
    env.mock_all_auths();
    client.create_proposal(
        &user,
        &String::from_str(&env, "Invalid Type"),
        &String::from_str(&env, "Invalid"),
        &(env.ledger().timestamp() + 50),
        &Symbol::new(&env, "invalid_type"),
        &None,
    );
}

#[test]
#[should_panic(expected = "Voting closed")]
fn test_vote_after_deadline() {
    let env = Env::default();
    let contract_id = env.register(ProposalContract, ());
    let client = ProposalContractClient::new(&env, &contract_id);
    let user = Address::generate(&env);
    env.mock_all_auths();
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

#[test]
#[should_panic(expected = "Proposal not open")]
fn test_vote_on_closed_proposal() {
    let env = Env::default();
    let contract_id = env.register(ProposalContract, ());
    let client = ProposalContractClient::new(&env, &contract_id);
    let user = Address::generate(&env);
    env.mock_all_auths();
    client.create_proposal(
        &user,
        &String::from_str(&env, "Closed Test"),
        &String::from_str(&env, "Closed"),
        &(env.ledger().timestamp() + 10),
        &Symbol::new(&env, "system"),
        &None,
    );
    assert_event!(env, contract_id, "proposal_created", 1u32);
    env.ledger().set_timestamp(env.ledger().timestamp() + 20);
    client.finalize(&1);
    assert_event!(env, contract_id, "proposal_finalized", (1u32, symbol_short!("rejected")));
    client.vote(&user, &1, &symbol_short!("For"));
}

#[test]
#[should_panic(expected = "Invalid vote choice")]
fn test_invalid_vote_choice() {
    let env = Env::default();
    let contract_id = env.register(ProposalContract, ());
    let client = ProposalContractClient::new(&env, &contract_id);
    let user = Address::generate(&env);
    env.mock_all_auths();
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

#[test]
fn test_finalize_closed_with_quorum_and_no_votes() {
    let env = Env::default();
    let contract_id = env.register(ProposalContract, ());
    let client = ProposalContractClient::new(&env, &contract_id);

    let user = Address::generate(&env);
    env.mock_all_auths();

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

#[test]
fn test_finalize_rejected_without_quorum_and_no_votes() {
    let env = Env::default();
    let contract_id = env.register(ProposalContract, ());
    let client = ProposalContractClient::new(&env, &contract_id);

    let user = Address::generate(&env);
    env.mock_all_auths();

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
