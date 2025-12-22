# Payment Splitter - Quick Start Guide

## 🚀 Quick Setup (5 Steps)

### 1. Set Your Addresses

```bash
# In your .env.local file
export TREASURY_ADDRESS=0xYourTreasuryAddress
export ARTIST_ADDRESS=0xYourArtistAddress
```

### 2. Deploy to Testnet (Alfajores)

```bash
TREASURY_ADDRESS=0x... ARTIST_ADDRESS=0x... npx hardhat run scripts/deploy-payment-splitter.js --network alfajores
```

### 3. Test the Contract

- Make a small test purchase
- Verify funds split correctly ($10 / $35 = 22.22% / 77.78%)
- Check on [Alfajores Celoscan](https://alfajores.celoscan.io)

### 4. Deploy to Mainnet

```bash
TREASURY_ADDRESS=0x... ARTIST_ADDRESS=0x... npx hardhat run scripts/deploy-payment-splitter.js --network celo
```

### 5. Set Environment Variables

```env
NEXT_PUBLIC_PAYMENT_SPLITTER_ADDRESS_MAINNET=0xYourDeployedAddress
NEXT_PUBLIC_TREASURY_ADDRESS=0xYourTreasuryAddress
NEXT_PUBLIC_ARTIST_ADDRESS=0xYourArtistAddress
```

## ✅ That's It!

The marketplace will automatically use the splitter for items matching:
- Tag: "navidad" or "axolote"
- ID containing: "axolote", "navideno", or "navidad"

## 📊 Example: $45 Payment

```
Total: 45 tokens
├── Treasury: 10 tokens (22.22%)
└── Artist: 35 tokens (77.78%)
```

## 🔍 Verify Deployment

After deployment, verify on Celoscan:
- Contract address
- Treasury address ($10 = 22.22%)
- Artist address ($35 = 77.78%)
- Test a small payment

## 📝 Full Documentation

See `docs/PAYMENT_SPLITTER_GUIDE.md` for complete details.

