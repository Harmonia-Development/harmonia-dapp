#![cfg(test)]

use super::*;
use crate::{VotingNFTContract, VotingNFTContractClient};
use soroban_sdk::{
    testutils::{Address as _, MockAuth, MockAuthInvoke},
    IntoVal,
};

fn create_client<'a>(e: &Env, admin: &Address) -> VotingNFTContractClient<'a> {
    let address = e.register(VotingNFTContract, (admin,));
    VotingNFTContractClient::new(e, &address)
}

#[test]
fn test_initialization() {
    let env = Env::default();
    let admin = Address::generate(&env);
    let client = create_client(&env, &admin);

    assert_eq!(
        client.name(),
        String::from_str(&env, "Harmonia Voting NFTs")
    );
    assert_eq!(client.symbol(), String::from_str(&env, "HARM"));
    assert_eq!(client.get_admin(), admin);
}

#[test]
fn test_mint_nft_success() {
    let env = Env::default();
    let admin = Address::generate(&env);
    let client = create_client(&env, &admin);

    let user1 = Address::generate(&env);
    let minter = Address::generate(&env);
    let category = Symbol::new(&env, "participation");
    let metadata = Symbol::new(&env, "voted_5_proposals");

    env.mock_auths(&[MockAuth {
        address: &admin,
        invoke: &MockAuthInvoke {
            contract: &client.address,
            fn_name: "add_minter",
            args: (admin.clone(), minter.clone()).into_val(&env),
            sub_invokes: &[],
        },
    }]);

    client.add_minter(&admin, &minter);

    env.mock_auths(&[MockAuth {
        address: &minter,
        invoke: &MockAuthInvoke {
            contract: &client.address,
            fn_name: "mint_nft",
            args: (
                minter.clone(),
                user1.clone(),
                category.clone(),
                metadata.clone(),
            )
                .into_val(&env),
            sub_invokes: &[],
        },
    }]);

    let minted_nft_1 = client.mint_nft(&minter, &user1, &category, &metadata);

    env.mock_auths(&[MockAuth {
        address: &minter,
        invoke: &MockAuthInvoke {
            contract: &client.address,
            fn_name: "mint_nft",
            args: (
                user1.clone(),
                Symbol::new(&env, "partici"),
                metadata.clone(),
            )
                .into_val(&env),
            sub_invokes: &[],
        },
    }]);

    let minted_nft_2 = client.mint_nft(&minter, &user1, &Symbol::new(&env, "partici"), &metadata);

    let initial_timestamp = env.ledger().timestamp();

    assert_eq!(minted_nft_2.token_id, 1);
    assert_eq!(minted_nft_2.category, Symbol::new(&env, "partici"));
    assert_eq!(minted_nft_2.metadata, metadata);
    assert_eq!(minted_nft_2.owner, user1);
    assert!(minted_nft_2.issued_at >= initial_timestamp);

    // Verify NFT can be retrieved by token ID
    let retrieved_nft = client.get_nft(&0);
    let retrieved_nft_2 = client.get_nft(&1);
    assert_eq!(retrieved_nft, minted_nft_1);
    assert_eq!(retrieved_nft_2, minted_nft_2);

    // Verify NFT is in owner's list
    let owner_nfts = client.get_nfts_by_owner(&user1);
    assert_eq!(owner_nfts.len(), 2);
    assert_eq!(owner_nfts.get(0).unwrap(), minted_nft_1);
    assert_eq!(owner_nfts.get(1).unwrap(), minted_nft_2);

    // Verify base NFT ownership (Base::owner_of)
    assert_eq!(client.owner_of(&1), user1);
    assert_eq!(client.owner_of(&0), user1);
}

#[test]
#[should_panic(expected = "Error(Contract, #2)")]
fn test_get_nft_not_found() {
    let env = Env::default();
    let admin = Address::generate(&env);
    let client = create_client(&env, &admin);

    let _res = client.get_nft(&999);
}

#[test]
fn test_get_nfts_by_owner_multiple() {
    let env = Env::default();
    let admin = Address::generate(&env);
    let client = create_client(&env, &admin);

    let user1 = Address::generate(&env);
    let user2 = Address::generate(&env);
    let minter = Address::generate(&env);

    env.mock_auths(&[MockAuth {
        address: &admin,
        invoke: &MockAuthInvoke {
            contract: &client.address,
            fn_name: "add_minter",
            args: (admin.clone(), minter.clone()).into_val(&env),
            sub_invokes: &[],
        },
    }]);

    client.add_minter(&admin, &minter);

    // Mock auths for admin for all mint operations
    env.mock_auths(&[MockAuth {
        address: &minter,
        invoke: &MockAuthInvoke {
            contract: &client.address,
            fn_name: "mint_nft",
            args: (
                user1.clone(),
                Symbol::new(&env, "participation"),
                Symbol::new(&env, "voted_5"),
            )
                .into_val(&env),
            sub_invokes: &[],
        },
    }]);
    let nft1_user1 = client.mint_nft(
        &minter,
        &user1,
        &Symbol::new(&env, "participation"),
        &Symbol::new(&env, "voted_5"),
    );

    env.mock_auths(&[MockAuth {
        address: &minter,
        invoke: &MockAuthInvoke {
            contract: &client.address,
            fn_name: "mint_nft",
            args: (
                user1.clone(),
                Symbol::new(&env, "referral"),
                Symbol::new(&env, "referred_1"),
            )
                .into_val(&env),
            sub_invokes: &[],
        },
    }]);
    let nft2_user1 = client.mint_nft(
        &minter,
        &user1,
        &Symbol::new(&env, "referral"),
        &Symbol::new(&env, "referred_1"),
    );

    env.mock_auths(&[MockAuth {
        address: &minter,
        invoke: &MockAuthInvoke {
            contract: &client.address,
            fn_name: "mint_nft",
            args: (
                user2.clone(),
                Symbol::new(&env, "participation"),
                Symbol::new(&env, "voted_5"),
            )
                .into_val(&env),
            sub_invokes: &[],
        },
    }]);
    let nft1_user2 = client.mint_nft(
        &minter,
        &user2,
        &Symbol::new(&env, "participation"),
        &Symbol::new(&env, "voted_5"),
    );

    let user1_nfts = client.get_nfts_by_owner(&user1);
    assert_eq!(user1_nfts.len(), 2);
    assert!(user1_nfts.contains(&nft1_user1));
    assert!(user1_nfts.contains(&nft2_user1));

    let user2_nfts = client.get_nfts_by_owner(&user2);
    assert_eq!(user2_nfts.len(), 1);
    assert!(user2_nfts.contains(&nft1_user2));

    let empty_nfts = client.get_nfts_by_owner(&Address::generate(&env));
    assert!(empty_nfts.is_empty());
}

#[test]
#[should_panic(expected = "Error(Contract, #1210)")]
fn test_mint_nft_unauthorized() {
    let env = Env::default();
    let admin = Address::generate(&env);
    let client = create_client(&env, &admin);

    let unauthorized_user = Address::generate(&env);
    let to_address = Address::generate(&env);
    let minter = Address::generate(&env);

    let category = Symbol::new(&env, "referral");
    let metadata = Symbol::new(&env, "referred_3_members");

    env.mock_auths(&[MockAuth {
        address: &unauthorized_user,
        invoke: &MockAuthInvoke {
            contract: &client.address,
            fn_name: "mint_nft",
            args: (to_address.clone(), category.clone(), metadata.clone()).into_val(&env),
            sub_invokes: &[],
        },
    }]);

    client.mint_nft(&minter, &to_address, &category, &metadata);
}

#[test]
#[should_panic(expected = "Error(Contract, #1)")]
fn test_mint_nft_duplicate_category_fails() {
    let env = Env::default();
    let admin = Address::generate(&env);
    let client = create_client(&env, &admin);

    let user1 = Address::generate(&env);
    let minter = Address::generate(&env);
    let category = Symbol::new(&env, "participation");
    let metadata1 = Symbol::new(&env, "voted_5_proposals");
    let metadata2 = Symbol::new(&env, "voted_10_proposals");

    env.mock_auths(&[MockAuth {
        address: &admin,
        invoke: &MockAuthInvoke {
            contract: &client.address,
            fn_name: "add_minter",
            args: (admin.clone(), minter.clone()).into_val(&env),
            sub_invokes: &[],
        },
    }]);

    client.add_minter(&admin, &minter);

    // Mint the first NFT for the category
    env.mock_auths(&[MockAuth {
        address: &minter,
        invoke: &MockAuthInvoke {
            contract: &client.address,
            fn_name: "mint_nft",
            args: (user1.clone(), category.clone(), metadata1.clone()).into_val(&env),
            sub_invokes: &[],
        },
    }]);
    client.mint_nft(&minter, &user1, &category, &metadata1);

    // Attempt to mint the same category to the same user again
    env.mock_auths(&[MockAuth {
        address: &minter,
        invoke: &MockAuthInvoke {
            contract: &client.address,
            fn_name: "mint_nft",
            args: (user1.clone(), category.clone(), metadata2.clone()).into_val(&env),
            sub_invokes: &[],
        },
    }]);
    client.mint_nft(&minter, &user1, &category, &metadata2);

    let owner_nfts = client.get_nfts_by_owner(&user1);
    assert_eq!(owner_nfts.len(), 1);
}

#[test]
#[should_panic(expected = "Error(Contract, #1210)")]
fn test_add_and_remove_minter() {
    let env = Env::default();
    let admin = Address::generate(&env);
    let client = create_client(&env, &admin);

    let new_minter = Address::generate(&env);
    let recipient = Address::generate(&env);
    let category = Symbol::new(&env, "referral");
    let metadata = Symbol::new(&env, "referred_2_members");

    // Admin adds new minter
    env.mock_auths(&[MockAuth {
        address: &admin,
        invoke: &MockAuthInvoke {
            contract: &client.address,
            fn_name: "add_minter",
            args: (admin.clone(), new_minter.clone()).into_val(&env),
            sub_invokes: &[],
        },
    }]);
    client.add_minter(&admin, &new_minter);

    // New minter mints NFT
    env.mock_auths(&[MockAuth {
        address: &new_minter,
        invoke: &MockAuthInvoke {
            contract: &client.address,
            fn_name: "mint_nft",
            args: (recipient.clone(), category.clone(), metadata.clone()).into_val(&env),
            sub_invokes: &[],
        },
    }]);
    let nft = client.mint_nft(&new_minter, &recipient, &category, &metadata);
    assert_eq!(nft.owner, recipient);

    // Admin removes the minter
    env.mock_auths(&[MockAuth {
        address: &admin,
        invoke: &MockAuthInvoke {
            contract: &client.address,
            fn_name: "remove_minter",
            args: (admin.clone(), new_minter.clone()).into_val(&env),
            sub_invokes: &[],
        },
    }]);
    client.remove_minter(&admin, &new_minter);

    // Minter tries again (should panic)
    env.mock_auths(&[MockAuth {
        address: &new_minter,
        invoke: &MockAuthInvoke {
            contract: &client.address,
            fn_name: "mint_nft",
            args: (recipient.clone(), category.clone(), metadata.clone()).into_val(&env),
            sub_invokes: &[],
        },
    }]);

    // This should fail since the minter was removed
    client.mint_nft(&new_minter, &recipient, &category, &metadata);
}
