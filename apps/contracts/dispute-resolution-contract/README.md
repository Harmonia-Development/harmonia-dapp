# Dispute Resolution Contract

A Soroban smart contract for managing disputes within Decentralized Autonomous Organizations (DAOs). This contract enables community-driven dispute resolution through voluntary arbitration.

## Overview

The Dispute Resolution Contract provides a transparent and decentralized mechanism for resolving conflicts between DAO members. It features:

- **Community-driven arbitration**: Any DAO member can volunteer as an arbitrator
- **Transparent dispute tracking**: All disputes and resolutions are stored on-chain
- **Flexible penalty system**: Arbitrators can assign fines, compensation, or no penalty
- **Emergency controls**: Admin can pause operations if needed
- **Role-based access**: Integration with member registry for permission control

## Core Features

### 🔍 Dispute Management
- Raise disputes against other DAO members
- Track dispute lifecycle (open → resolved)
- Immutable dispute records for transparency

### ⚖️ Arbitration System
- Voluntary arbitrator participation
- Conflict of interest prevention
- Experience-based arbitrator profiles
- Reputation tracking system

### 💰 Penalty Framework
- Flexible penalty options (fine, compensation, or none)
- Reasonable penalty limits to prevent abuse
- Future extensibility for automated enforcement

### 🛡️ Security Features
- Emergency pause functionality
- Access control through member registry
- Input validation and error handling
- Audit trail for all operations

## Contract Architecture

### Core Data Structures

```rust
struct Dispute {
    id: u32,
    plaintiff: Address,
    defendant: Address,
    description: String,
    status: DisputeStatus,
    created_at: u64,
    resolution: Option<Resolution>,
    arbitrators: Vec<Address>,
}

struct Resolution {
    arbitrator: Address,
    resolution_text: String,
    penalty: Option<i128>,
    resolved_at: u64,
}

struct ArbitratorProfile {
    address: Address,
    status: ArbitratorStatus,
    cases_handled: u32,
    reputation_score: u32,
    registered_at: u64,
    last_active: u64,
}
```

### Module Structure

- **`lib.rs`**: Main contract implementation and public interface
- **`dispute.rs`**: Dispute data structures and management logic
- **`resolution.rs`**: Resolution handling and validation
- **`arbitrator.rs`**: Arbitrator profiles and reputation system

## Public Functions

### Initialization

```rust
fn initialize(
    env: Env,
    admin: Address,
    member_registry: Address,
    treasury: Address,
) -> Result<(), DisputeError>
```

### Dispute Operations

```rust
fn raise_dispute(
    env: Env,
    plaintiff: Address,
    defendant: Address,
    description: String,
) -> Result<u32, DisputeError>

fn volunteer_as_arbitrator(
    env: Env,
    arbitrator: Address,
    dispute_id: u32,
) -> Result<(), DisputeError>

fn resolve_dispute(
    env: Env,
    dispute_id: u32,
    arbitrator: Address,
    resolution_text: String,
    penalty: Option<i128>,
) -> Result<(), DisputeError>
```

### Query Functions

```rust
fn get_dispute(env: Env, dispute_id: u32) -> Result<Dispute, DisputeError>

fn get_dispute_status(env: Env, dispute_id: u32) -> Result<DisputeStatus, DisputeError>

fn list_open_disputes(env: Env, start: u32, limit: u32) -> Vec<u32>

fn get_total_disputes(env: Env) -> u32
```

### Admin Functions

```rust
fn set_emergency_state(env: Env, caller: Address, emergency: bool) -> Result<(), DisputeError>

fn is_emergency(env: Env) -> bool
```

## Usage Examples

### 1. Raising a Dispute

```bash
soroban contract invoke \
  --id $CONTRACT_ID \
  --source alice \
  --network testnet \
  -- \
  raise_dispute \
  --plaintiff GBXGQJWVLWOYHFLVTKWV5FGHA3LNYY2JQKM7OAJAUEQFU6LPCSEFVXON \
  --defendant GDXZGQJWVLWOYHFLVTKWV5FGHA3LNYY2JQKM7OAJAUEQFU6LPCSEFVXON \
  --description "Disagreement over project funding allocation"
```

### 2. Volunteering as Arbitrator

```bash
soroban contract invoke \
  --id $CONTRACT_ID \
  --source bob \
  --network testnet \
  -- \
  volunteer_as_arbitrator \
  --arbitrator GCXZGQJWVLWOYHFLVTKWV5FGHA3LNYY2JQKM7OAJAUEQFU6LPCSEFVXON \
  --dispute_id 1
```

### 3. Resolving a Dispute

```bash
soroban contract invoke \
  --id $CONTRACT_ID \
  --source bob \
  --network testnet \
  -- \
  resolve_dispute \
  --dispute_id 1 \
  --arbitrator GCXZGQJWVLWOYHFLVTKWV5FGHA3LNYY2JQKM7OAJAUEQFU6LPCSEFVXON \
  --resolution_text "After reviewing the evidence, the funding allocation should proceed as originally proposed." \
  --penalty 0
```

## Development

### Prerequisites

- Rust 1.70+
- Soroban CLI
- wasm32-unknown-unknown target

### Setup

```bash
# Install dependencies
make setup

# Build the contract
make build

# Run tests
make test

# Deploy to testnet
make deploy-testnet
```

### Testing

The contract includes comprehensive tests covering:

- Dispute creation and validation
- Arbitrator management
- Resolution processing
- Error conditions
- Edge cases

Run tests with:

```bash
make test-verbose
```

### Linting and Formatting

```bash
# Format code
make fmt

# Run clippy
make lint

# Security audit
make audit
```

## Security Considerations

### Access Control
- All sensitive operations require proper authentication
- Member registry integration prevents unauthorized access
- Emergency pause functionality for crisis situations

### Input Validation
- Description length limits (1-1000 characters for disputes)
- Resolution text limits (1-2000 characters)
- Penalty amount limits (-10,000 to +10,000 units)

### Conflict Prevention
- Parties cannot arbitrate their own disputes
- Duplicate arbitrator volunteering prevented
- Self-disputes blocked

### Storage Optimization
- Efficient data structures to minimize storage costs
- Pagination for dispute listing
- Optional fields to reduce storage when not needed

## Integration

### Member Registry
The contract integrates with a member registry to verify:
- Dispute participant membership
- Arbitrator eligibility
- Access permissions

### Treasury Integration
Future versions will integrate with treasury contracts for:
- Automated penalty collection
- Compensation distribution
- Stake-based arbitration

## Events

The contract emits events for:
- `DisputeRaised`: New dispute created
- `ArbitratorVolunteered`: Arbitrator joins dispute
- `DisputeResolved`: Resolution submitted
- `EmergencyStateChanged`: Emergency mode toggled

## Error Handling

Comprehensive error types cover:
- `DisputeNotFound`: Invalid dispute ID
- `DisputeAlreadyResolved`: Action on closed dispute
- `ConflictOfInterest`: Arbitrator conflict
- `UnauthorizedArbitrator`: Invalid arbitrator action
- `InvalidDescription`: Bad dispute description
- `EmergencyMode`: Operations paused

## Future Enhancements

### Planned Features
- Multi-arbitrator consensus mechanisms
- Staking requirements for arbitrators
- Appeal process for disputed resolutions
- Automated penalty enforcement
- Reputation-based arbitrator selection
- Time-limited dispute resolution periods

### Extensibility
The contract is designed for future upgrades:
- Modular architecture allows component updates
- Event-driven design enables external integrations
- Flexible penalty system supports various enforcement mechanisms

## License

This contract is part of the Harmonia DAO project and is licensed under the MIT License.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Run the full test suite
5. Submit a pull request

## Support

For questions or issues:
- Open an issue on GitHub
- Join our Discord community
- Review the documentation

---

*Built with ❤️ for the Stellar Soroban ecosystem* 