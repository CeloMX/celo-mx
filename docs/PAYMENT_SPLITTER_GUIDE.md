# Payment Splitter Implementation Guide

## Overview

This guide explains how to implement automatic fee splitting for marketplace payments. The system automatically splits payments:
- **$10 to Treasury** (22.22%)
- **$35 to Artist** (77.78%)

For example, a $45 USD payment would be split as:
- Treasury: $10 (22.22%)
- Artist: $35 (77.78%)

## Architecture

### Smart Contract: `MarketplacePaymentSplitter.sol`

The contract automatically receives ERC20 token payments and distributes them according to predefined shares.

**Key Features:**
- Automatic fee splitting on payment receipt
- Configurable treasury and artist addresses
- Support for any ERC20 token (CMT, USDT, etc.)
- Owner-controlled emergency withdrawal
- Transparent share calculation

**Contract Functions:**
- `splitPayment(address token, uint256 amount)` - Main function to split a payment
- `calculateTreasuryShare(uint256 amount)` - Calculate $10 share (22.22%)
- `calculateArtistShare(uint256 amount)` - Calculate $35 share (77.78%)
- `setTreasury(address)` - Update treasury address (owner only)
- `setArtist(address)` - Update artist address (owner only)
- `emergencyWithdraw(address token, address to, uint256 amount)` - Emergency withdrawal (owner only)

## Deployment Steps

### 1. Prerequisites

- Hardhat configured for Celo
- Treasury address ready
- Artist address ready
- Sufficient CELO for deployment gas

### 2. Deploy the Contract

```bash
# Compile the contract
npx hardhat compile

# Deploy to Alfajores (testnet)
npx hardhat run scripts/deploy-payment-splitter.js --network alfajores

# Deploy to Mainnet
npx hardhat run scripts/deploy-payment-splitter.js --network celo
```

### 3. Deployment Script Example

Create `scripts/deploy-payment-splitter.js`:

```javascript
const hre = require("hardhat");

async function main() {
  // Set your addresses here
  const TREASURY_ADDRESS = process.env.TREASURY_ADDRESS || "0x...";
  const ARTIST_ADDRESS = process.env.ARTIST_ADDRESS || "0x...";

  if (!TREASURY_ADDRESS || !ARTIST_ADDRESS) {
    throw new Error("TREASURY_ADDRESS and ARTIST_ADDRESS must be set");
  }

  console.log("Deploying MarketplacePaymentSplitter...");
  console.log("Treasury:", TREASURY_ADDRESS);
  console.log("Artist:", ARTIST_ADDRESS);

  const MarketplacePaymentSplitter = await hre.ethers.getContractFactory(
    "MarketplacePaymentSplitter"
  );
  const splitter = await MarketplacePaymentSplitter.deploy(
    TREASURY_ADDRESS,
    ARTIST_ADDRESS
  );

  await splitter.waitForDeployment();
  const address = await splitter.getAddress();

  console.log("✅ PaymentSplitter deployed to:", address);
  console.log("\nNext steps:");
  console.log("1. Verify the contract on Celoscan");
  console.log("2. Set NEXT_PUBLIC_PAYMENT_SPLITTER_ADDRESS_MAINNET in .env");
  console.log("3. Test with a small payment");
}
```

### 4. Environment Variables

Add to your `.env` file:

```env
# Payment Splitter Addresses
NEXT_PUBLIC_PAYMENT_SPLITTER_ADDRESS_ALFAJORES=0x...
NEXT_PUBLIC_PAYMENT_SPLITTER_ADDRESS_MAINNET=0x...

# Treasury and Artist Addresses
NEXT_PUBLIC_TREASURY_ADDRESS=0x...
NEXT_PUBLIC_ARTIST_ADDRESS=0x...
```

## Integration

### How It Works

1. **Item Detection**: The marketplace checks if an item should use fee splitting based on:
   - Item ID (e.g., items in `ITEMS_WITH_FEE_SPLIT` array)
   - Item tag (e.g., items tagged with "navidad" or "axolote")
   - Item ID containing keywords like "axolote" or "navideno"

2. **Payment Flow**:
   - User initiates purchase
   - If fee split is enabled:
     - Approve splitter contract to spend tokens
     - Call `splitPayment()` on the splitter contract
     - Contract automatically splits and distributes funds
   - If fee split is disabled:
     - Direct transfer to merchant (existing behavior)

3. **Transaction Flow**:
   ```
   User → Approve Splitter → Splitter Contract → Treasury ($10) + Artist ($35)
   ```

### Code Integration

The marketplace automatically uses the splitter for items that match the criteria:

```typescript
// In app/marketplace/page.tsx
const useFeeSplit = shouldUseFeeSplit(item.id, item.tag);

if (useFeeSplit && splitterAddress) {
  // Use payment splitter
  // 1. Approve splitter
  // 2. Call splitPayment()
} else {
  // Direct transfer to merchant
}
```

## Configuration

### Items with Fee Splitting

Edit `config/merch.ts` to specify which items use fee splitting:

```typescript
// Option 1: By item ID
export const ITEMS_WITH_FEE_SPLIT = [
  'axolote-navideno',
  'axolote-navidad-2024',
];

// Option 2: Automatically detected by tag or ID containing keywords
// Items with tag "navidad" or ID containing "axolote" automatically use fee split
```

### Customizing Shares

To change the split ratio, modify the contract:

```solidity
// In MarketplacePaymentSplitter.sol
uint256 public constant TREASURY_SHARES = 10;  // Change this
uint256 public constant ARTIST_SHARES = 35;     // Change this
uint256 public constant TOTAL_SHARES = 45;
```

**Important**: After changing shares, you must redeploy the contract.

## Testing

### Test on Alfajores First

1. Deploy to Alfajores testnet
2. Get test tokens from faucet
3. Make a test purchase
4. Verify funds are split correctly:
   - Check treasury address balance
   - Check artist address balance
   - Verify amounts match $10/$35 split (22.22%/77.78%)

### Verification Checklist

- [ ] Contract deployed and verified on Celoscan
- [ ] Treasury address is correct
- [ ] Artist address is correct
- [ ] Test payment splits correctly
- [ ] Environment variables set
- [ ] Marketplace code updated
- [ ] Items correctly identified for fee splitting

## Security Considerations

1. **Contract Ownership**: The deployer becomes the owner. Store the private key securely.

2. **Address Validation**: The contract validates that treasury and artist addresses are:
   - Not zero address
   - Not the same address

3. **Emergency Withdrawal**: Owner can withdraw stuck funds, but this should only be used in emergencies.

4. **Rounding**: The contract handles rounding by giving any remainder to the artist to ensure total matches.

5. **Token Approval**: Users must approve the splitter contract before payment. This is handled automatically in the frontend.

## Monitoring

### View Contract State

```typescript
// Get treasury address
const treasury = await contract.treasury();

// Get artist address
const artist = await contract.artist();

// Get total received for a token
const totalReceived = await contract.totalReceived(tokenAddress);

// Get pending amounts (if any)
const [treasuryPending, artistPending] = await contract.getPendingAmounts(tokenAddress);
```

### Celoscan

Monitor the contract on Celoscan:
- View all transactions
- Check token balances
- Verify split distributions

## Troubleshooting

### Issue: Payment not splitting

**Check:**
1. Is the item configured for fee splitting? (`shouldUseFeeSplit()`)
2. Is the splitter address set in environment variables?
3. Was the approval transaction successful?
4. Check contract events on Celoscan

### Issue: Approval fails

**Solutions:**
- Ensure user has sufficient token balance
- Check token allowance
- Verify splitter contract address is correct

### Issue: Wrong split amounts

**Check:**
- Verify contract shares (10/35 = $10/$35)
- Check for rounding issues
- Verify treasury and artist addresses

## Best Practices

1. **Always test on testnet first**
2. **Verify contract on Celoscan** for transparency
3. **Monitor first few transactions** after deployment
4. **Keep owner key secure** (consider multisig for production)
5. **Document treasury and artist addresses** clearly
6. **Set up alerts** for contract events if possible

## Example: Axolote Navideño

For the "axolote navideño" item at $45 USD:

1. User purchases with 45 CMT or 45 USDT
2. Payment goes to splitter contract
3. Contract automatically splits:
   - Treasury receives: 10 tokens (22.22%)
   - Artist receives: 35 tokens (77.78%)

The split happens atomically in a single transaction, ensuring both parties receive their share immediately.

## Support

For issues or questions:
1. Check contract on Celoscan
2. Review transaction logs
3. Verify environment variables
4. Check contract events

## Future Enhancements

Potential improvements:
- Multiple artist support
- Dynamic fee percentages per item
- Batch payments
- Automatic withdrawal scheduling
- Multi-token support in single transaction

