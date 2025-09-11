# KYC/KYB Smart Contract

A Soroban smart contract for managing KYC/KYB (Know Your Customer/Know Your Business) data on the Stellar network. This contract stores cryptographic hashes of user identity data along with verification status, ensuring transparency and immutability.

## Overview

The KYC/KYB contract provides a secure way to store and retrieve verification status for users in the Stellar wallet ecosystem. It uses persistent storage to maintain data across contract invocations and emits events for transparency.

## Contract Functions

### `register_kyc(kyc_id: String, data_hash: String, status: String)`

Stores or updates a KYC/KYB record with the provided information.

**Parameters:**

- `kyc_id`: Unique identifier for the KYC/KYB record (e.g., user ID hash, UUID)
- `data_hash`: Cryptographic hash of the KYC/KYB data
- `status`: Verification status (e.g., "approved", "rejected", "pending")

**Behavior:**

- Idempotent operation: overwrites existing records with the same `kyc_id`
- Emits a `kyc_reg` event with the kyc_id and status
- Uses persistent storage for data durability

**Example:**

```rust
contract.register_kyc(
    "user_123_hash".to_string(),
    "sha256_hash_of_kyc_data".to_string(),
    "approved".to_string()
);
```

### `get_kyc_status(kyc_id: String) -> Option<String>`

Retrieves the verification status for a given KYC/KYB record.

**Parameters:**

- `kyc_id`: The unique identifier to look up

**Returns:**

- `Some(String)`: The verification status if the record exists
- `None`: If no record exists for the given kyc_id

**Example:**

```rust
let status = contract.get_kyc_status("user_123_hash".to_string());
match status {
    Some(s) => println!("Status: {}", s),
    None => println!("Record not found"),
}
```

## Data Structures

### KycRecord

```rust
pub struct KycRecord {
    pub kyc_id: String,     // Unique identifier
    pub data_hash: String,  // Cryptographic hash of KYC/KYB data
    pub status: String,     // Verification status
}
```

## Building the Contract

### Prerequisites

- Rust toolchain
- Stellar CLI (`stellar` command)
- Soroban SDK

### Build Commands

```bash
# Build the contract
make build

# Or directly with stellar CLI
stellar contract build

# Clean build artifacts
make clean
```

## Usage Instructions

1. **Deploy the contract** to Stellar testnet or mainnet
2. **Register KYC data** using the `register_kyc` function
3. **Query verification status** using the `get_kyc_status` function

## Security Considerations

- **Data Privacy**: Only cryptographic hashes of KYC data are stored, not the raw data
- **Access Control**: Consider implementing authorization mechanisms in future versions
- **Immutability**: Records are stored on-chain and cannot be deleted, only updated
- **Gas Optimization**: Simple data structures minimize transaction costs

## Integration

This contract is designed for integration with:

- Stellar wallet services
- KYC/KYB verification systems
- Identity management platforms
- Compliance monitoring tools

## Future Enhancements

- Role-based access control for record management
- Batch operations for multiple records
- Integration with external identity verification services
- Event-based notifications for status changes

## Testing

Unit tests are implemented in JavaScript and located in:
`services/stellar-wallet/tests/soroban/client.test.js`

## License

This contract is part of the Harmonia DApp project.
