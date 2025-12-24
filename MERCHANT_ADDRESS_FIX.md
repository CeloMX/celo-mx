# Merchant Address Fix - Critical Payment Issue Resolved

## Problem Identified

The `MERCHANT_ADDRESS` was hardcoded to a **Privy embedded wallet address** (`0x65E8F19f1e8a5907F388E416876B7e1250a9863C`) instead of the proper merchant/treasury address. This caused:

- **45 USDT sent to wrong address**: Payments were going to a Privy wallet instead of the intended recipient
- **Wallet mismatch**: The wallet appears in your admin dashboard but not in Privy's dashboard for your project (likely from a different Privy project or test wallet)

## What Was Fixed

### 1. Configuration File (`config/merch.ts`)
- ✅ Changed `MERCHANT_ADDRESS` to use environment variables
- ✅ Now defaults to `TREASURY_ADDRESS` if not specified
- ✅ Added clear documentation warning against using Privy wallets

**Before:**
```typescript
export const MERCHANT_ADDRESS = '0x65E8F19f1e8a5907F388E416876B7e1250a9863C';
```

**After:**
```typescript
export const MERCHANT_ADDRESS = 
  process.env.NEXT_PUBLIC_MERCHANT_ADDRESS || 
  process.env.NEXT_PUBLIC_TREASURY_ADDRESS || 
  '0x795df83a989c74832b2D108FF8200989B59FbaCf';
```

### 2. Database Schema
- ✅ Updated default values in both `schema.prisma` and `schema.dev.prisma`
- ✅ Changed from Privy wallet to treasury address

## Next Steps Required

### 1. Set Environment Variable (IMPORTANT)

Add to your `.env` file (or Vercel environment variables):

```env
# Merchant address for direct payments (items without fee splitting)
# If not set, defaults to TREASURY_ADDRESS
NEXT_PUBLIC_MERCHANT_ADDRESS=0x795df83a989c74832b2D108FF8200989B59FbaCf

# Or if you want a different merchant address:
# NEXT_PUBLIC_MERCHANT_ADDRESS=0xYourActualMerchantAddress
```

**Note**: If you don't set `NEXT_PUBLIC_MERCHANT_ADDRESS`, it will automatically use `NEXT_PUBLIC_TREASURY_ADDRESS` as the fallback.

### 2. Recover the 45 USDT

The 45 USDT are currently in wallet `0x65e8f19f1e8a5907f388e416876b7e1250a9863c`.

**Options to recover:**

1. **If you have access via your admin dashboard:**
   - Check your admin dashboard where this wallet appears
   - Export the private key or use your admin interface to transfer the funds
   - Send the 45 USDT to the correct merchant/treasury address

2. **If it's a Privy wallet from your project:**
   - Check Privy dashboard for all wallets
   - Look for wallets created in different environments or test projects
   - Privy wallets can be accessed if you have the user's authentication

3. **If it's a test/development wallet:**
   - Check your local development environment
   - Look for `.env.local` or test configuration files
   - The wallet might be from a different Privy App ID

### 3. Verify Payment Flow

After setting the environment variable, test a small payment to ensure:
- ✅ Payments go to the correct address (check transaction on Celoscan)
- ✅ Items with fee splitting still work correctly (go to splitter contract)
- ✅ Regular items go to merchant address (not Privy wallet)

### 4. Deploy Changes

1. **Commit the changes:**
   ```bash
   git add config/merch.ts prisma/schema.prisma prisma/schema.dev.prisma
   git commit -m "Fix: Use environment variable for MERCHANT_ADDRESS instead of hardcoded Privy wallet"
   ```

2. **Set environment variable in Vercel:**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add `NEXT_PUBLIC_MERCHANT_ADDRESS` with your desired address
   - Or ensure `NEXT_PUBLIC_TREASURY_ADDRESS` is set (it will be used as fallback)

3. **Redeploy:**
   ```bash
   vercel --prod
   ```

## Payment Flow Summary

### Items WITH Fee Splitting (e.g., "axolote navideño"):
1. User approves splitter contract
2. Payment goes to **Payment Splitter Contract** (`PAYMENT_SPLITTER_ADDRESS`)
3. Contract automatically splits:
   - $10 → Treasury (`TREASURY_ADDRESS`)
   - $35 → Artist (`ARTIST_ADDRESS`)

### Items WITHOUT Fee Splitting:
1. Direct transfer to **Merchant Address** (`MERCHANT_ADDRESS`)
2. Now defaults to Treasury address (configurable via env var)

## Verification Checklist

- [ ] Set `NEXT_PUBLIC_MERCHANT_ADDRESS` environment variable (or ensure `NEXT_PUBLIC_TREASURY_ADDRESS` is set)
- [ ] Deploy changes to production
- [ ] Test a small payment to verify it goes to correct address
- [ ] Recover 45 USDT from `0x65e8f19f1e8a5907f388e416876b7e1250a9863c`
- [ ] Verify all future payments go to correct addresses

## Important Notes

⚠️ **Never use Privy embedded wallet addresses as payment recipients**
- Privy wallets are user-controlled and can be lost
- They're not suitable for receiving merchant payments
- Always use proper treasury/merchant wallet addresses or smart contracts

✅ **Best Practice:**
- Use a dedicated treasury wallet for merchant payments
- Or use the Payment Splitter contract for all payments (recommended)
- Keep merchant addresses in environment variables, never hardcoded

