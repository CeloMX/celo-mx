# Deployment Checklist - Payment Splitter Address

## ✅ Changes Applied Locally

The Payment Splitter contract address `0x8fbfb62ABf46Ba81eEe5a41f0dF72d35cC75C18a` is now configured as the default in:
- `config/merch.ts` 
- `lib/contracts/paymentSplitter.ts`

## 🚀 What You Need to Do

### Step 1: Deploy Code Changes to Vercel

The code changes need to be deployed to production:

```bash
# Commit the changes
git add config/merch.ts lib/contracts/paymentSplitter.ts prisma/schema.prisma prisma/schema.dev.prisma
git commit -m "Fix: Configure Payment Splitter contract address and merchant address"

# Push to your repository
git push

# Vercel will auto-deploy, or manually deploy:
vercel --prod
```

### Step 2: Set Environment Variable in Vercel (Recommended)

**Why?** While the address is hardcoded as a default, setting it as an environment variable:
- Makes it easier to change without code deployment
- Follows best practices
- Allows different addresses for different environments

**How to set in Vercel:**

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**

2. Add this variable:
   ```
   Name: NEXT_PUBLIC_PAYMENT_SPLITTER_ADDRESS_MAINNET
   Value: 0x8fbfb62ABf46Ba81eEe5a41f0dF72d35cC75C18a
   Environment: Production (and Preview if needed)
   ```

3. **Redeploy** after adding the variable (Vercel will prompt you)

### Step 3: Verify Payment Flow

**Important:** Funds will go to `0x8fbfb62ABf46Ba81eEe5a41f0dF72d35cC75C18a` **ONLY** for items that use fee splitting.

#### Items WITH Fee Splitting → Payment Splitter Contract
- Items with ID containing: `axolote`, `navideno`, `navidad`
- Items with tags containing: `navidad`, `axolote`
- Items explicitly listed in `ITEMS_WITH_FEE_SPLIT` array

**Flow:**
1. User approves splitter contract
2. Payment goes to: `0x8fbfb62ABf46Ba81eEe5a41f0dF72d35cC75C18a`
3. Contract automatically splits:
   - $10 → Treasury (`0x795df83a989c74832b2D108FF8200989B59FbaCf`)
   - $35 → Artist (`0x2A0029E7b5E74898e794b32722fBcb5276d38f18`)

#### Items WITHOUT Fee Splitting → Merchant Address
- Regular items (like "celo-shirt", "celo-beanie", "celo-sticker")
- Payment goes directly to: `MERCHANT_ADDRESS` (defaults to Treasury: `0x795df83a989c74832b2D108FF8200989B59FbaCf`)

## 📋 Quick Verification Steps

After deployment:

1. **Check the contract address is used:**
   - Make a test purchase for an item that uses fee splitting
   - Check browser console logs - should show: `Using payment splitter for [item name]`
   - Verify transaction on Celoscan goes to `0x8fbfb62ABf46Ba81eEe5a41f0dF72d35cC75C18a`

2. **Verify funds are split correctly:**
   - Check Treasury address received $10 (22.22%)
   - Check Artist address received $35 (77.78%)

3. **Test regular items:**
   - Make a purchase for a regular item (without fee splitting)
   - Verify it goes to `MERCHANT_ADDRESS` (Treasury address)

## 🔧 Optional: Configure Which Items Use Fee Splitting

If you want ALL items to use the Payment Splitter, you can modify `config/merch.ts`:

```typescript
// Option 1: Add specific item IDs
export const ITEMS_WITH_FEE_SPLIT: string[] = [
  'axolote-navideno',
  'your-item-id-here',
  // Add more item IDs
];

// Option 2: Make ALL items use fee splitting
export function shouldUseFeeSplit(itemId: string, itemTag?: string | null): boolean {
  return true; // All items use fee splitting
}
```

## 📝 Summary

✅ **Code changes:** Applied locally  
✅ **Payment Splitter address:** `0x8fbfb62ABf46Ba81eEe5a41f0dF72d35cC75C18a` (hardcoded as default)  
⏳ **Next steps:**
1. Deploy code to Vercel
2. (Optional) Set `NEXT_PUBLIC_PAYMENT_SPLITTER_ADDRESS_MAINNET` in Vercel env vars
3. Test a purchase to verify funds go to correct address

## 🆘 Troubleshooting

**If funds still go to wrong address:**
1. Check browser console for logs showing which address is being used
2. Verify the item triggers fee splitting (check `shouldUseFeeSplit()` logic)
3. Check Vercel environment variables are set correctly
4. Clear browser cache and try again

**To check current configuration:**
- Look at browser console logs during purchase
- Check `PAYMENT_SPLITTER_ADDRESS` value in the logs
- Verify `splitterAddress` is not null in the payment flow

