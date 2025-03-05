# Harmonia - DAO Board Management Platform

Harmonia is a next-generation **DAO board management platform** built on Stellar, designed for **decentralized governance, voting, treasury management, and AI-assisted decision-making**. The platform integrates **passkey security, AI-driven automation, and Rust-powered Soroban smart contracts** to ensure efficient and transparent DAO operations.

## 🚀 Features

- **Decentralized Governance**: On-chain voting and proposal system
- **AI Automation**: Smart insights and automated DAO workflows
- **Passkey Authentication**: Secure, passwordless authentication
- **Rust & Soroban Smart Contracts**: Scalable DAO processing on Stellar
- **Treasury Management**: Multi-signature wallets for secure fund management
- **Next.js 14** with App Router & Pages Router
- **Supabase SSR** for authentication and data storage
- **Tailwind CSS & shadcn/ui** for modern UI components
- **Optimized Build** using Bun for fast dependency management

## 🏗 Tech Stack

- **Frontend:** Next.js 14 + (App Router & Pages Router)
- **Backend:** Supabase (Database & Auth)
- **Styling:** Tailwind CSS & shadcn/ui
- **Package Management:** Bun
- **Smart Contracts:** Rust & Soroban (Stellar integration)
- **Security:** Passkeys, protected routes, input validation, rate limiting

---

## 📂 Project Structure

```
Harmonia/
├── .husky/                 # Pre-commit hooks
├── apps/
│   ├── admin/              # Admin panel (TBD)
│   ├── contracts/          # Smart contracts
│   ├── webapp/             # Main Next.js application
│   │   ├── .next/          # Build artifacts
│   │   ├── app/            # Next.js App Router pages
│   │   ├── hooks/          # React hooks
│   │   ├── lib/            # Utility functions and helpers
│   │   ├── public/         # Static assets
│   │   ├── .env            # Environment variables
│   │   ├── .env.sample     # Example environment file
│   │   ├── components.json # shadcn/ui components
│   │   ├── eslint.config.mjs  # Linter configuration
│   │   ├── next.config.ts  # Next.js configuration
│   │   ├── package.json    # Dependencies
│   │   ├── tailwind.config.ts # Tailwind CSS configuration
│   │   ├── tsconfig.json   # TypeScript configuration
│   │   └── README.md       # Webapp documentation
├── docs/                   # Documentation
├── node_modules/           # Dependencies
├── services/               # Backend services
│   ├── supabase/           # API services
│   └── README.md           # Services documentation
├── .gitignore              # Git ignored files
├── bun.lock                # Bun package lock file
├── commitlint.config.js    # Commit message rules
├── README.md               # Project documentation
└── package.json            # Root package dependencies
```

---

## 🏃 Getting Started

### Prerequisites

Ensure you have the following installed:

- [Node.js (v18 or higher)](https://nodejs.org/)
- [Bun](https://bun.sh/)
- [Git](https://git-scm.com/)

### Clone and Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/harmonia.git
   cd harmonia
   ```

2. Install dependencies:

   ```bash
   bun install
   ```

3. Start the development server:

   ```bash
   bun dev
   ```

4. Rename `.env.sample` to `.env.local` and update the following:
   ```
   NEXT_PUBLIC_SUPABASE_URL=[INSERT SUPABASE PROJECT URL]
   NEXT_PUBLIC_SUPABASE_ANON_KEY=[INSERT SUPABASE PROJECT API ANON KEY]
   ```
   You can find these values in [Supabase API settings](https://app.supabase.com/project/_/settings/api).

---

## 🏗 Architecture Overview

### Frontend

- Uses **Next.js 14** with the **App Router**
- Modular structure with reusable components
- Optimized with **shadcn/ui** and **Tailwind CSS**

### Backend

- Built with **Supabase** for database and authentication
- API services managed under `services/`

### Key Features

#### 🗳️ DAO Governance

- On-chain voting & proposal management
- Real-time governance tracking

#### 🤖 AI-Powered Automation

- Proposal generation & optimization
- AI-assisted decision-making

#### 🔐 Security & Authentication

- Passkeys for secure, passwordless access
- Multi-signature treasury management

---

## 🔒 Security & Best Practices

- **Passkey Authentication**: Secure, phishing-resistant login
- **Protected Routes**: Prevents unauthorized access
- **Input Validation**: Reduces security risks
- **Rate Limiting**: Protects against abuse

---

## 📜 License

This project is open-source and available under the [MIT License](LICENSE).

## 🚀 Contributing

We welcome contributions! Feel free to submit pull requests or open issues.

---

Made with ❤️ by the Harmonia Team
