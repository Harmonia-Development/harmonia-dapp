# Dispute Resolution Contract Makefile

# Default target
all: build test

# Build the contract
build:
	@echo "Building dispute resolution contract..."
	@soroban contract build

# Run tests
test:
	@echo "Running tests..."
	@cargo test

# Run tests with verbose output
test-verbose:
	@echo "Running tests with verbose output..."
	@cargo test -- --nocapture

# Build optimized release version
build-release:
	@echo "Building optimized release version..."
	@soroban contract build --profile release

# Deploy to testnet (requires network configuration)
deploy-testnet:
	@echo "Deploying to testnet..."
	@soroban contract deploy \
		--wasm target/wasm32-unknown-unknown/release/dispute_resolution_contract.wasm \
		--source alice \
		--network testnet

# Deploy to local sandbox
deploy-local:
	@echo "Deploying to local sandbox..."
	@soroban contract deploy \
		--wasm target/wasm32-unknown-unknown/release/dispute_resolution_contract.wasm \
		--source alice \
		--network local

# Install dependencies
install:
	@echo "Installing dependencies..."
	@soroban contract install

# Generate bindings
bindings:
	@echo "Generating contract bindings..."
	@soroban contract bindings typescript \
		--contract-id $(CONTRACT_ID) \
		--output-dir ./bindings \
		--network testnet

# Format code
fmt:
	@echo "Formatting code..."
	@cargo fmt

# Run clippy for linting
lint:
	@echo "Running clippy..."
	@cargo clippy -- -D warnings

# Clean build artifacts
clean:
	@echo "Cleaning build artifacts..."
	@cargo clean

# Run security audit
audit:
	@echo "Running security audit..."
	@cargo audit

# Generate documentation
docs:
	@echo "Generating documentation..."
	@cargo doc --no-deps --open

# Run integration tests
test-integration:
	@echo "Running integration tests..."
	@cargo test integration --features testutils

# Set up development environment
setup:
	@echo "Setting up development environment..."
	@rustup target add wasm32-unknown-unknown
	@cargo install --locked soroban-cli
	@soroban config network add testnet \
		--rpc-url https://soroban-testnet.stellar.org:443 \
		--network-passphrase "Test SDF Network ; September 2015"

# Initialize contract with sample data
init-contract:
	@echo "Initializing contract with sample data..."
	@soroban contract invoke \
		--id $(CONTRACT_ID) \
		--source alice \
		--network testnet \
		-- \
		initialize \
		--admin $(ADMIN_ADDRESS) \
		--member_registry $(MEMBER_REGISTRY_ADDRESS) \
		--treasury $(TREASURY_ADDRESS)

# Create a sample dispute
create-dispute:
	@echo "Creating sample dispute..."
	@soroban contract invoke \
		--id $(CONTRACT_ID) \
		--source alice \
		--network testnet \
		-- \
		raise_dispute \
		--plaintiff $(PLAINTIFF_ADDRESS) \
		--defendant $(DEFENDANT_ADDRESS) \
		--description "Sample dispute for testing"

# Volunteer as arbitrator
volunteer:
	@echo "Volunteering as arbitrator..."
	@soroban contract invoke \
		--id $(CONTRACT_ID) \
		--source bob \
		--network testnet \
		-- \
		volunteer_as_arbitrator \
		--arbitrator $(ARBITRATOR_ADDRESS) \
		--dispute_id $(DISPUTE_ID)

# Resolve dispute
resolve:
	@echo "Resolving dispute..."
	@soroban contract invoke \
		--id $(CONTRACT_ID) \
		--source bob \
		--network testnet \
		-- \
		resolve_dispute \
		--dispute_id $(DISPUTE_ID) \
		--arbitrator $(ARBITRATOR_ADDRESS) \
		--resolution_text "Dispute resolved in favor of plaintiff" \
		--penalty 100

# Get dispute details
get-dispute:
	@echo "Getting dispute details..."
	@soroban contract invoke \
		--id $(CONTRACT_ID) \
		--source alice \
		--network testnet \
		-- \
		get_dispute \
		--dispute_id $(DISPUTE_ID)

# List open disputes
list-disputes:
	@echo "Listing open disputes..."
	@soroban contract invoke \
		--id $(CONTRACT_ID) \
		--source alice \
		--network testnet \
		-- \
		list_open_disputes \
		--start 1 \
		--limit 10

# Watch for file changes and rebuild
watch:
	@echo "Watching for changes..."
	@cargo watch -x build

# Help target
help:
	@echo "Available targets:"
	@echo "  build           - Build the contract"
	@echo "  test            - Run tests"
	@echo "  test-verbose    - Run tests with verbose output"
	@echo "  build-release   - Build optimized release version"
	@echo "  deploy-testnet  - Deploy to testnet"
	@echo "  deploy-local    - Deploy to local sandbox"
	@echo "  install         - Install dependencies"
	@echo "  bindings        - Generate contract bindings"
	@echo "  fmt             - Format code"
	@echo "  lint            - Run clippy for linting"
	@echo "  clean           - Clean build artifacts"
	@echo "  audit           - Run security audit"
	@echo "  docs            - Generate documentation"
	@echo "  test-integration- Run integration tests"
	@echo "  setup           - Set up development environment"
	@echo "  init-contract   - Initialize contract with sample data"
	@echo "  create-dispute  - Create a sample dispute"
	@echo "  volunteer       - Volunteer as arbitrator"
	@echo "  resolve         - Resolve dispute"
	@echo "  get-dispute     - Get dispute details"
	@echo "  list-disputes   - List open disputes"
	@echo "  watch           - Watch for file changes and rebuild"
	@echo "  help            - Show this help message"

.PHONY: all build test test-verbose build-release deploy-testnet deploy-local install bindings fmt lint clean audit docs test-integration setup init-contract create-dispute volunteer resolve get-dispute list-disputes watch help 