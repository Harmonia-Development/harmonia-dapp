#![no_std]
use crate::datatypes::{ContractError, DataKey,  VotingNFT};
use soroban_sdk::{contract, contractimpl,  Address, Env, String, Symbol, Vec};
use stellar_access_control::{set_admin, AccessControl};
use stellar_access_control_macros:: only_admin;
use stellar_default_impl_macro::default_impl;
use stellar_non_fungible::{Base, NonFungibleToken};

#[contract]
pub struct VotingNFTContract;


#[contractimpl]
impl VotingNFTContract {
    pub fn __constructor(e: &Env, admin : Address) {
        Base::set_metadata(
            e,
            String::from_str(e, "ipfs://harmonia-nfts"),
            String::from_str(e, "Harmonia Voting NFTs"),
            String::from_str(e, "HARM"),
        );
        set_admin(e, &admin);
    }

    #[only_admin]
    pub fn mint_nft(
        e: Env,
       
        to: Address,
        category: Symbol,
        metadata: Symbol,
    ) -> Result<VotingNFT, ContractError> {
        let minted_category_key = DataKey::MintedCategory(to.clone(), category.clone());
        let owner_key = DataKey::OwnedBy(to.clone());

        let already_minted = e
            .storage()
            .persistent()
            .get(&minted_category_key)
            .unwrap_or(false);

        if already_minted {
            return Err(ContractError::CategoryAlreadyMinted);
        }

        let token_id = Base::sequential_mint(&e, &to);

        let nft = VotingNFT {
            token_id: token_id.clone(),
            category: category.clone(),
            metadata: metadata.clone(),
            owner: to.clone(),
            issued_at: e.ledger().timestamp(),
        };

        e.storage().persistent().set(&minted_category_key, &true);

        let mut owned_ids: Vec<u32> = e
            .storage()
            .persistent()
            .get(&owner_key)
            .unwrap_or_else(|| Vec::new(&e));
        owned_ids.push_back(token_id);
        e.storage().persistent().set(&owner_key, &owned_ids);

        let nft_key = DataKey::Nft(token_id);

        e.storage().persistent().set(&nft_key, &nft);

        Ok(nft)
    }

    pub fn get_nft(e: Env, token_id: u32) -> Result<VotingNFT, ContractError> {
        let nft_key = DataKey::Nft(token_id);
        match e.storage().persistent().get(&nft_key) {
            Some(nft) => Ok(nft),
            None => Err(ContractError::NftNotFound),
        }
    }

    pub fn get_nfts_by_owner(e: Env, owner: Address) -> Vec<VotingNFT> {
        let owner_key = DataKey::OwnedBy(owner.clone());
        let token_ids: Vec<u32> = e
            .storage()
            .persistent()
            .get(&owner_key)
            .unwrap_or_else(|| Vec::new(&e));

        let mut nfts = Vec::new(&e);
        for id in token_ids.iter() {
            if let Some(nft) = e.storage().persistent().get(&DataKey::Nft(id)) {
                nfts.push_back(nft);
            }
        }

        nfts
    }
}

#[default_impl]
#[contractimpl]
impl NonFungibleToken for VotingNFTContract {
    type ContractType = Base;
}

#[default_impl]
#[contractimpl]
impl AccessControl for VotingNFTContract {}
