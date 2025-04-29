# Soroban Project

## Project Structure

This repository follows the recommended structure for a Soroban project:

```text
.
├── contracts
│   └── role-manager
│       ├── src
│       │   ├── lib.rs
│       │   └── test.rs
│       │
│       ├── Cargo.toml
│       └── Makefile
│  
├── Cargo.toml
├── Cargo.lock
└── README.md
```

- New Soroban contracts can be put in `contracts`, each in their own directory. There is already a `role-manager` contract to get you started.
- Contracts should have their own `Cargo.toml` files that rely on the top-level `Cargo.toml` workspace for their dependencies.
