# Notification Router Contract

A Soroban smart contract for Harmonia DAO that emits structured logs/events on-chain when meaningful actions happen in other Harmonia contracts.

## Purpose

This contract serves as a central notification hub that other Harmonia contracts can call into when important events occur, such as:
- Governance actions (votes, proposals)
- Treasury activities (fund releases)
- Member actions (joins, departures)
- System events (upgrades, maintenance)

These events power the `/notifications` UI section in the frontend.

## Features

- Emits indexed events from a central contract
- Supports category tagging for UI filtering
- Supports severity levels (low, medium, high)
- Structured event format for easy frontend consumption
- Batch emit support for efficient processing
- Professional error handling with custom error types
- Comprehensive test coverage

## Implementation Details

- **Modular Structure**: 
  - `constants`: Severity levels and category constants
  - `errors`: Custom error types and handling
  - `types`: Event and notification data structures
  - `contract`: Core contract implementation
  - `test`: Comprehensive test suite
- **Standards Compliance**: Follows Soroban best practices
- **Documentation**: Complete inline documentation with rustdoc comments
- **Error Handling**: Custom error types with descriptive messages
- **Test Coverage**: Comprehensive tests for all functionality

## Contract Functions

### Logging Events

- `log_governance_event(env: Env, title: Symbol, message: Symbol, severity: Symbol)`
- `log_treasury_event(env: Env, title: Symbol, message: Symbol, severity: Symbol)`
- `log_member_event(env: Env, title: Symbol, message: Symbol, severity: Symbol)`
- `log_system_event(env: Env, title: Symbol, message: Symbol, severity: Symbol)`

### Batch Operations

- `batch_emit(env: Env, category: Symbol, notifications: Vec<(Symbol, Symbol, Symbol)>)`

## Constants

### Severity Levels

```rust
// Available as severity::LOW, severity::MEDIUM, severity::HIGH
const LOW: Symbol = symbol_short!("low");
const MEDIUM: Symbol = symbol_short!("medium");
const HIGH: Symbol = symbol_short!("high");
```

### Categories

```rust
// Available as category::GOVERNANCE, category::TREASURY, etc.
const GOVERNANCE: Symbol = symbol_short!("gov");
const TREASURY: Symbol = symbol_short!("treasury");
const MEMBER: Symbol = symbol_short!("member");
const SYSTEM: Symbol = symbol_short!("system");
```

## Events

The contract emits a standardized event format:

```rust
Topics: [Symbol("notify"), Symbol(category), Symbol(severity)]
Data: Vec[Symbol(category), Symbol(severity), Symbol(title), Symbol(message)]
```

Note: The `symbol_short!` macro in Soroban has a 9-character limit, so some category names were shortened (e.g., "governance" to "gov").

## Example Usage

Here's an example of how to use this contract from another Harmonia contract:

```rust
// Import the contract client
use notification_router::NotificationRouterContractClient;
use notification_router::severity;

// In your contract function
fn complete_proposal(env: Env, proposal_id: u32, status: Symbol) {
    // Your logic here...
    
    // Get the notification router contract
    let notification_router = NotificationRouterContractClient::new(
        &env, 
        &env.storage().get_contract_id("notification_router").unwrap()
    );
    
    // Log the event
    notification_router.log_governance_event(
        &symbol_short!("proposal_completed"),
        &Symbol::new(&env, format!("Proposal #{} {}", proposal_id, status)),
        &severity::MEDIUM
    );
}
```

## Building and Testing

### Prerequisites

- Rust and Cargo (latest stable version)
- [Soroban CLI](https://soroban.stellar.org/docs/getting-started/setup)
- [Stellar Development Account](https://laboratory.stellar.org/#account-creator?network=test) (for testnet deployment)

### Build the Contract

```bash
# Clone the repository (if you haven't already)
git clone https://github.com/harmonia-DAO/harmonia-dapp.git
cd harmonia-dapp/contracts/notification-router

# Build the contract
cargo build --target wasm32-unknown-unknown --release
```

### Run Tests

```bash
# Run all tests with verbose output
cargo test -- --nocapture

# Run a specific test
cargo test test_log_governance_event -- --nocapture
```

### Optimize the WASM File

```bash
stellar contract optimize --wasm target/wasm32-unknown-unknown/release/notification_router.wasm
```

### Deploy to Testnet

```bash
# Generate a development key if you don't have one
stellar keys generate dev

# Fund the account from friendbot
curl "https://friendbot.stellar.org/?addr=$(stellar keys address dev)"

# Deploy the contract
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/notification_router.optimized.wasm \
  --source dev \
  --network testnet
```

### Test Function Invocation

```bash
# Replace CONTRACT_ID with the deployed contract ID
stellar contract invoke \
  --id CONTRACT_ID \
  --source dev \
  --network testnet \
  -- log_governance_event \
  --title vote_complete \
  --message proposal_42_approved \
  --severity medium
```

## Integration with Frontend

The frontend `/notifications` UI section can query these events to display a notification feed to users. Events can be filtered by:

- Category (governance, treasury, member, system)
- Severity (low, medium, high)
- Timestamp (using the transaction timestamp)

## Contributing

Contributions to the notification-router contract are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin feature/my-new-feature`)
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the main repository for details. 