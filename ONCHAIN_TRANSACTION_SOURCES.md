# On-Chain Transaction Sources

This document identifies all elements in the project that can cause on-chain transactions.

## 1. Paymaster System

### Configuration
- **File**: `lib/paymaster.ts`
- **Purpose**: Configures sponsored (gas-free) transactions
- **Networks**: Celo Alfajores (testnet) and Celo Mainnet
- **Key Features**:
  - Paymaster contract addresses (configurable via env vars)
  - Sponsored contract whitelist
  - Sponsored function selectors whitelist
  - Gas limit configurations

### Sponsored Functions
- `enroll(uint256)` - Course enrollment
- `completeModule(uint256,uint256)` - Module completion
- `claimBadge(uint256,address)` - Badge claiming
- `adminMint(address,uint256,uint256)` - Admin minting (for certificates)

### Sponsored Contracts
- Milestone contract addresses (env configurable)
- Optimized contract addresses:
  - Alfajores: `0x4193D2f9Bf93495d4665C485A3B8AadAF78CDf29`
  - Mainnet: `0xf8CA094fd88F259Df35e0B8a9f38Df8f4F28F336`

---

## 2. ZeroDev Smart Wallet Provider

### Core Provider
- **File**: `lib/contexts/ZeroDevSmartWalletProvider.tsx`
- **Purpose**: Manages smart account creation and sponsored transaction execution
- **Key Methods**:
  - `executeTransaction()` - Executes sponsored transactions via ZeroDev Kernel
  - `kernelClient.sendTransaction()` - Direct ZeroDev SDK transaction method

### Paymaster Integration
- Uses ZeroDev's built-in paymaster client
- Automatically handles gas sponsorship for eligible transactions
- Project ID: `e46f4ac3-404e-42fc-a3d3-1c75846538a8` (configurable via env)

---

## 3. Course Enrollment Transactions

### Sponsored Enrollment (ZeroDev)
- **Files**:
  - `lib/contexts/EnrollmentContext.tsx` - `enrollInCourse()`
  - `lib/hooks/useSponsoredEnrollment.ts` - `enrollWithSponsorship()`
  - `lib/hooks/useZeroDevEnrollment.ts` - `enrollWithZeroDev()`
  - `lib/hooks/useUnifiedEnrollment.ts` - `enrollWithSponsoredTransaction()`
  - `lib/contracts/enrollmentService.ts` - `enrollWithKernel()`
- **Function**: `enroll(uint256 tokenId)`
- **Transaction Type**: Sponsored (gas-free via ZeroDev)
- **Network**: Mainnet (forced to chain ID 42220)

### Wallet-Based Enrollment
- **Files**:
  - `lib/hooks/useUnifiedEnrollment.ts` - `enrollWithWalletTransaction()`
  - `lib/hooks/useSimpleBadge.ts` - `claimBadge()`
- **Function**: `enroll(uint256 tokenId)`
- **Transaction Type**: User pays gas
- **Network**: Mainnet (forced to chain ID 42220)
- **Methods**:
  - Wagmi `writeContract()` hook
  - Privy embedded wallet fallback (`eth_sendTransaction`)

---

## 4. Module Completion Transactions

### Sponsored Module Completion
- **Files**:
  - `lib/contexts/ModuleCompletionContext.tsx` - `completeWithSponsorship()`
  - `lib/hooks/useSponsoredEnrollment.ts` - `completeModuleWithSponsorship()`
  - `lib/hooks/useZeroDevEnrollment.ts` - `completeModuleWithZeroDev()`
  - `lib/contracts/enrollmentService.ts` - `completeModuleWithKernel()`
- **Function**: `completeModule(uint256 courseId, uint8 moduleIndex)`
- **Transaction Type**: Sponsored (gas-free via ZeroDev)
- **Network**: Mainnet (forced to chain ID 42220)

### Wallet-Based Module Completion
- **Files**:
  - `lib/contexts/ModuleCompletionContext.tsx` - `completeWithWallet()`
  - `lib/hooks/useModuleCompletion.ts` - `completeModule()`
- **Function**: `completeModule(uint256 courseId, uint8 moduleIndex)`
- **Transaction Type**: User pays gas
- **Network**: Mainnet (forced to chain ID 42220)
- **Method**: Wagmi `writeContract()` hook

---

## 5. Badge Claiming Transactions

### Badge Claim
- **File**: `lib/hooks/useSimpleBadge.ts`
- **Function**: `enroll(uint256 courseId)` (uses same function as enrollment)
- **Transaction Type**: User pays gas
- **Network**: Mainnet (forced to chain ID 42220)
- **Methods**:
  - Wagmi `writeContract()` hook
  - Privy embedded wallet fallback (`eth_sendTransaction`)

---

## 6. Certificate Generation Transactions

### Certificate Minting
- **File**: `lib/hooks/useCertificateGeneration.ts`
- **Function**: `adminMint(address to, uint256 tokenId, uint256 amount)`
- **Transaction Type**: User pays gas (admin function)
- **Network**: Mainnet (forced to chain ID 42220)
- **Note**: Currently uses optimized contract, but adminMint may not be available

---

## 7. Merchandise Purchase Transactions

### CMT Token Transfers
- **File**: `app/merch/page.tsx` - `handlePurchase()`
- **Function**: ERC20 `transfer(address to, uint256 amount)`
- **Token**: CMT (Celo Academy token)
- **Transaction Type**: Sponsored (gas-free via ZeroDev)
- **Network**: Mainnet (forced to chain ID 42220)
- **Recipient**: Merchant address (from config)

### CMT Faucet Claims
- **File**: `app/merch/page.tsx` - Faucet claim functionality
- **Function**: Faucet contract function (specific ABI)
- **Transaction Type**: Sponsored (gas-free via ZeroDev)
- **Network**: Mainnet (forced to chain ID 42220)

---

## 8. Portfolio Token Transfers

### Native CELO Transfers
- **File**: `app/portfolio/page.tsx` - `handleSend()`
- **Transaction Type**: Sponsored (gas-free via ZeroDev)
- **Network**: Mainnet (forced to chain ID 42220)
- **Method**: ZeroDev `executeTransaction()` with empty data and value

### ERC20 Token Transfers
- **File**: `app/portfolio/page.tsx` - `handleSend()`
- **Function**: ERC20 `transfer(address to, uint256 amount)`
- **Transaction Type**: Sponsored (gas-free via ZeroDev)
- **Network**: Mainnet (forced to chain ID 42220)
- **Method**: ZeroDev `executeTransaction()` with encoded transfer data

---

## Transaction Execution Patterns

### Pattern 1: ZeroDev Sponsored Transactions
```typescript
// Via ZeroDev Smart Wallet Provider
await smartAccount.executeTransaction({
  to: contractAddress,
  data: encodedData,
  value: 0n,
});

// Direct kernel client (in enrollmentService)
await kernelClient.sendTransaction({
  to: contractAddress,
  data: encodedData,
  value: BigInt(0)
});
```

### Pattern 2: Wagmi writeContract
```typescript
await writeContract({
  address: contractAddress,
  abi: contractABI,
  functionName: 'functionName',
  args: [arg1, arg2],
  chainId: 42220, // Mainnet
});
```

### Pattern 3: Privy Embedded Wallet
```typescript
await provider.request({
  method: 'eth_sendTransaction',
  params: [{
    from: walletAddress,
    to: contractAddress,
    data: encodedData,
    value: '0x0'
  }],
});
```

---

## Environment Variables Required

### ZeroDev Configuration
- `NEXT_PUBLIC_ZERODEV_PROJECT_ID` - ZeroDev project ID for paymaster

### Paymaster Configuration (Optional - currently using ZeroDev)
- `NEXT_PUBLIC_PAYMASTER_ADDRESS_ALFAJORES`
- `NEXT_PUBLIC_PAYMASTER_URL_ALFAJORES`
- `NEXT_PUBLIC_PAYMASTER_ADDRESS_MAINNET`
- `NEXT_PUBLIC_PAYMASTER_URL_MAINNET`

### Contract Addresses
- `NEXT_PUBLIC_MILESTONE_CONTRACT_ADDRESS_ALFAJORES`
- `NEXT_PUBLIC_MILESTONE_CONTRACT_ADDRESS_MAINNET`

---

## Summary

### Sponsored (Gas-Free) Transactions
1. Course enrollment (via ZeroDev)
2. Module completion (via ZeroDev)
3. Merchandise purchases (CMT transfers via ZeroDev)
4. Portfolio token transfers (via ZeroDev)
5. CMT faucet claims (via ZeroDev)

### User-Paid Gas Transactions
1. Course enrollment (wallet-based fallback)
2. Module completion (wallet-based fallback)
3. Badge claiming (wallet-based)
4. Certificate generation (admin mint)

### Key Transaction Points
- **ZeroDev Smart Wallet Provider**: Central hub for all sponsored transactions
- **Paymaster Configuration**: Defines which contracts/functions can be sponsored
- **Forced Mainnet**: All transactions are forced to Celo Mainnet (chain ID 42220)
- **Multiple Enrollment Methods**: Both sponsored and wallet-based enrollment paths exist

---

## Notes

1. **ZeroDev is Primary**: The project primarily uses ZeroDev for gas sponsorship, not the custom paymaster configuration in `lib/paymaster.ts` (which appears to be legacy/unused).

2. **Mainnet Only**: All transactions are forced to Celo Mainnet regardless of wallet network.

3. **Smart Account Required**: Sponsored transactions require a ZeroDev smart account to be initialized.

4. **Fallback Mechanisms**: Most features have both sponsored and wallet-based transaction paths for reliability.



