use soroban_sdk::contracterror;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum TreasuryError {
    InvalidAmount = 1,
    InsufficientFunds = 2,
    InvalidUnlockTime = 3,
    TransactionNotFound = 4,
    UnlockTimeNotReached = 5,
    AssetNotFound = 6,
}
