# KYC/KYB Smart Contract Makefile
# Build and deployment automation for Stellar Soroban contract

.PHONY: build clean test test-rust help

# Default target
all: build

# Build the contract using stellar CLI
build:
	@echo "🔨 Building KYC/KYB contract..."
	stellar contract build

# Clean build artifacts
clean:
	@echo "🧹 Cleaning build artifacts..."
	cargo clean
	rm -rf target/

# Test the contract (placeholder for future JavaScript tests)
test:
	@echo "🧪 Running tests..."
	@echo "Note: Unit tests are handled in services/stellar-wallet/tests/soroban/client.test.js"

# Run Rust unit tests
test-rust:
	@echo "🧪 Running Rust unit tests..."
	cargo test

# Display available targets
help:
	@echo "Available targets:"
	@echo "  build     - Build the contract with stellar contract build"
	@echo "  clean     - Clean build artifacts"
	@echo "  test      - Run tests (placeholder for JavaScript tests)"
	@echo "  test-rust - Run Rust unit tests"
	@echo "  help      - Show this help message"