# Trustless Work Escrow Integration

This document outlines the integration of Trustless Work Escrow API into the Harmonia DAO webapp.

## Overview

The Trustless Work integration provides secure, verifiable multi-party funding flows through escrow contracts. This foundational implementation enables future use in DAO proposals and milestone payouts.

Trustless Work is an Escrow-as-a-Service (EaaS) platform designed for the stablecoin economy running on Stellar + Soroban smart contracts.

## File Structure

```
apps/webapp/
├── app/
│   ├── trustless-work-provider.tsx      # Provider wrapper for TrustlessWork SDK
│   ├── layout.tsx                       # Updated with provider integration
│   └── dev/
│       └── escrow-test/
│           └── page.tsx                 # Demo/testing page
├── components/
│   └── escrow/
│       └── EscrowDebugCard.tsx          # Debug component for escrow data
└── docs/
    └── trustless-work.md                # This documentation file
```

## Environment Variables

Create a `.env.local` file in the webapp root with the following variables:

```bash
# Trustless Work Configuration
NEXT_PUBLIC_TRUSTLESS_WORK_API_KEY=your_trustless_work_api_key_here
NEXT_PUBLIC_TRUSTLESS_WORK_NETWORK=development  # or 'mainnet' for production
```

### Environment Variable Documentation

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_TRUSTLESS_WORK_API_KEY` | Your Trustless Work API key | Yes | - |
| `NEXT_PUBLIC_TRUSTLESS_WORK_NETWORK` | Network environment (`development` or `mainnet`) | No | `development` |

**Note:** Get your API key from the [Trustless Work dApp](https://trustlesswork.com)

## Components

### TrustlessWorkProvider

The main provider component that wraps the application and provides access to the TrustlessWork SDK.

**Location:** `app/trustless-work-provider.tsx`

**Features:**
- Uses the official `TrustlessWorkConfig` component from `@trustless-work/escrow`
- Automatically switches between `development` and `mainNet` based on environment variable
- Provides network environment switching
- Handles API key configuration

**Usage:**
```tsx
import { TrustlessWorkProvider } from './trustless-work-provider'

export default function RootLayout({ children }) {
  return (
    <TrustlessWorkProvider>
      {children}
    </TrustlessWorkProvider>
  )
}
```

**Implementation:**
```tsx
import {
  TrustlessWorkConfig,
  development,
  mainNet,
} from '@trustless-work/escrow'

export function TrustlessWorkProvider({ children }) {
  const apiKey = process.env.NEXT_PUBLIC_TRUSTLESS_WORK_API_KEY || ""
  const isMainNet = process.env.NEXT_PUBLIC_TRUSTLESS_WORK_NETWORK === 'mainnet'
  const baseURL = isMainNet ? mainNet : development

  return (
    <TrustlessWorkConfig baseURL={baseURL} apiKey={apiKey}>
      {children}
    </TrustlessWorkConfig>
  )
}
```

### EscrowDebugCard

A comprehensive debug component for displaying escrow contract data.

**Location:** `components/escrow/EscrowDebugCard.tsx`

**Features:**
- Displays key escrow information in a formatted table
- Shows additional fields beyond the core data
- Provides raw JSON view for debugging
- Status badges with appropriate color coding
- Responsive design with Tailwind CSS

**Props:**
```tsx
interface EscrowDebugCardProps {
  escrow: EscrowData
}
```

## Demo Page

The demo page (`/dev/escrow-test`) provides a complete testing interface for the Trustless Work integration.

### Features

1. **Configuration Status Display**
   - Shows current network (development/mainnet)
   - Indicates if API key is properly configured
   - Environment variable debugging

2. **Create Escrow Testing**
   - Form for creating new escrow contracts
   - Tests the `useCreateEscrow` hook
   - Error handling and loading states

3. **Fetch Escrow Testing**
   - Input for escrow ID lookup
   - Tests the `useEscrowById` hook
   - Displays results in EscrowDebugCard

4. **Debug Information**
   - Current configuration status
   - Environment variables (without exposing sensitive data)
   - Real-time error reporting


## Escrow Types

Trustless Work supports two types of escrows:

1. **Single-Release** — One payout, one approval, done.
2. **Multi-Release** — Break it into milestones. Pay over time.

## Escrow Lifecycle

Every escrow follows a standard flow:

1. **Initiate** the rules and roles
2. **Fund** it with stablecoins (USDC)
3. **Mark** progress by the marker
4. **Approve** the work by the approver
5. **Release** the funds by the releaser
6. **Dispute** handling (if needed) by the resolver

## Roles & Permissions

Each escrow defines specific roles with wallet-based permissions:

| Role | Description |
|------|-------------|
| **Marker** | Marks milestones as completed |
| **Approver** | Approves milestone completion |
| **Releaser** | Signs off final release of funds |
| **Resolver** | Can override flow in case of dispute |
| **Receiver** | Gets the released funds |
| **Platform Address** | Receives a fee (optional, % of each release) |

## Development Workflow

### 1. Setup
1. Install the `@trustless-work/escrow` package (already done)
2. Configure environment variables in `.env.local`
3. Get your API key from [Trustless Work dApp](https://trustlesswork.com)
4. Start the development server: `npm run dev`

### 2. Testing
1. Navigate to `/dev/escrow-test`
2. Verify configuration status shows "API Key Configured"
3. Test creating a new escrow contract
4. Test fetching escrow by ID
5. Review debug information

### 3. Network Switching
Toggle between development and mainnet by changing:
```bash
NEXT_PUBLIC_TRUSTLESS_WORK_NETWORK=development  # for testing
NEXT_PUBLIC_TRUSTLESS_WORK_NETWORK=mainnet      # for production
```

## Wallet Requirements

Every role (marker, approver, releaser, etc.) needs a Stellar-Soroban compatible wallet:

- **Freighter** (browser extension)
- **Passkey Wallets** (biometric, contract-based)

## API Reference

**Base URL:** `https://api.trustlesswork.com`

Key endpoints include:
- `POST /deployer/single-release` - Deploy single-release escrow
- `POST /deployer/multi-release` - Deploy multi-release escrow
- `GET /escrow/{type}/get-escrow` - Retrieve escrow state
- `POST /escrow/{type}/fund-escrow` - Fund an escrow
- `POST /escrow/{type}/release-funds` - Release funds

For complete API documentation: [Swagger Docs](https://dev.api.trustlesswork.com/docs)

## Integration with DAO Features

### Future Enhancements

1. **Proposal Integration**
   - Link escrow contracts to DAO proposals
   - Automatic escrow creation for approved funding proposals
   - Integration with voting mechanisms

2. **Milestone Payments**
   - Multi-release escrow contracts for project milestones
   - Automatic release triggers based on DAO governance
   - Progress tracking and reporting

3. **Treasury Management**
   - Integration with treasury dashboard
   - Escrow balance tracking
   - Automated accounting and reporting

## Error Handling

The integration includes comprehensive error handling:

1. **Configuration Errors**
   - Missing API key detection
   - Invalid configuration warnings
   - Environment variable validation

2. **API Errors**
   - Network connectivity issues
   - Invalid parameters
   - Authentication failures

3. **User Experience**
   - Loading states for all operations
   - Clear error messages
   - Retry mechanisms where appropriate

## Security Considerations

1. **API Key Management**
   - Use environment variables only
   - Never commit API keys to version control
   - Rotate keys regularly

2. **Smart Contract Security**
   - All escrows are non-custodial
   - Funds held in audited Stellar/Soroban contracts
   - Role-based access control

3. **Wallet Security**
   - Client-side signing only
   - Private keys never leave the user's device
   - All transactions require wallet signature

## Troubleshooting

### Common Issues

1. **"API Key Missing" Error**
   - Check that `NEXT_PUBLIC_TRUSTLESS_WORK_API_KEY` is set in `.env.local`
   - Verify the API key is valid
   - Restart the development server after adding environment variables

2. **API Connection Errors**
   - Verify network connectivity
   - Confirm API key is valid and active
   - Check if using correct network (development vs mainnet)

3. **Hook Import Errors**
   - Ensure `@trustless-work/escrow` package is installed
   - Verify hook usage is within the `TrustlessWorkConfig` provider
   - Check for TypeScript compilation errors

### Debug Steps

1. Navigate to `/dev/escrow-test`
2. Check the "Configuration Debug" section
3. Verify API key is configured
4. Review browser console for additional error details
5. Test API connectivity with simple operations

## Next Steps

1. **Get API Key**: Request access at [Trustless Work dApp](https://trustlesswork.com)
2. **Testing**: Test with development network first
3. **Integration**: Begin integrating escrow functionality into DAO workflows
4. **Production**: Switch to mainnet for live usage

## Resources

- [Trustless Work Documentation](https://docs.trustlesswork.com)
- [Trustless Work dApp](https://trustlesswork.com)
- [API Documentation](https://dev.api.trustlesswork.com/docs)
- [Stellar/Soroban Documentation](https://developers.stellar.org/docs/smart-contracts)
- [GitHub Repository](https://github.com/Trustless-Work)

---

*Last updated: January 2025* 