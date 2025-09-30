# 🚀 Vercel Deployment Guide - Celo MX Academy

## Prerequisites

1. **CeloMX Organization Access**: Ensure you have push access to `git@github.com:CeloMX/celo-mx.git`
2. **Vercel Account**: Connected to the CeloMX organization 
3. **Database**: Production PostgreSQL database with SSL support
4. **Privy Account**: Set up for authentication
5. **WalletConnect Project**: For wallet connectivity

## 📋 Pre-Deployment Checklist

### 1. Push Your Branch to GitHub
```bash
# Once you have access to CeloMX/celo-mx:
git push -u origin feature/blockchain-integration

# Or merge to main if ready:
git checkout main
git merge feature/blockchain-integration
git push origin main
```

### 2. Environment Variables Setup

Copy the production environment template and fill in your values:
```bash
cp .env.production.example .env.production
```

## 🔧 Vercel CLI Deployment

### 1. Login to Vercel
```bash
vercel login
```

### 2. Link Project (First Time)
```bash
vercel link
# Select: CeloMX organization
# Select: celo-mx project (or create new)
```

### 3. Set Environment Variables
```bash
# Set each environment variable
vercel env add DATABASE_URL production
vercel env add NEXT_PUBLIC_PRIVY_APP_ID production
vercel env add PRIVY_APP_SECRET production
vercel env add NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID production
vercel env add NEXT_PUBLIC_MILESTONE_CONTRACT_ADDRESS_ALFAJORES production
vercel env add DEPLOYER_PRIVATE_KEY production
vercel env add MILESTONE_BADGE_BASE_URI production
vercel env add CELOSCAN_API_KEY production
vercel env add NEXTAUTH_URL production
vercel env add NEXTAUTH_SECRET production
vercel env add ENCRYPTION_KEY production
```

### 4. Deploy
```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

## 🌐 Manual Vercel Dashboard Setup

### 1. Import Project
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" → "Project"  
3. Import from GitHub: `CeloMX/celo-mx`
4. Configure build settings:
   - **Framework Preset**: Next.js
   - **Build Command**: `prisma generate && npm run build`
   - **Install Command**: `npm ci`
   - **Output Directory**: `.next`

### 2. Environment Variables
Add these in Vercel Dashboard → Settings → Environment Variables:

#### 🔐 Required Secrets
- `DATABASE_URL`: PostgreSQL connection string with SSL
- `PRIVY_APP_SECRET`: Your Privy app secret
- `DEPLOYER_PRIVATE_KEY`: Wallet private key for contract deployment
- `NEXTAUTH_SECRET`: Random 32-char string for NextAuth
- `ENCRYPTION_KEY`: Random 32-char string for data encryption

#### 🌍 Public Variables  
- `NEXT_PUBLIC_PRIVY_APP_ID`: `clpru1ok2001el40fpw5axnza`
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`: Your WalletConnect project ID
- `NEXT_PUBLIC_MILESTONE_CONTRACT_ADDRESS_ALFAJORES`: `0x7Ed5CC0cf0B0532b52024a0DDa8fAE24C6F66dc3`
- `MILESTONE_BADGE_BASE_URI`: `https://your-domain.vercel.app/api/metadata/milestone/`
- `NEXTAUTH_URL`: `https://your-domain.vercel.app`

#### 🔑 Optional
- `CELOSCAN_API_KEY`: For contract verification
- `NEXT_PUBLIC_MILESTONE_CONTRACT_ADDRESS_MAINNET`: For mainnet deployment

### 3. Domain Configuration
1. **Custom Domain**: Set up your custom domain in Vercel → Settings → Domains
2. **SSL**: Automatically provided by Vercel
3. **Redirects**: Configured in `vercel.json`

## 🗄️ Database Setup

### 1. Production Database
- Use a managed PostgreSQL service (Supabase, PlanetScale, Railway, etc.)
- Ensure SSL is enabled (`?sslmode=require`)
- Run migrations: `npx prisma migrate deploy`

### 2. Prisma Configuration
```bash
# Generate Prisma client (included in build command)
npx prisma generate

# Deploy migrations to production
npx prisma migrate deploy

# Seed database (optional)
npx prisma db seed
```

## 🔍 Verification & Testing

### 1. Health Check
- Visit: `https://your-domain.vercel.app/healthz`
- Should return database and system status

### 2. API Endpoints Test
- Metadata API: `https://your-domain.vercel.app/api/metadata/milestone/1`
- Should return course badge metadata

### 3. Blockchain Integration
- Connect wallet on a course page
- Test enrollment transaction on Alfajores testnet
- Verify badge minting

### 4. Course Pages
- Test: `https://your-domain.vercel.app/academy/desarrollo-dapps`
- Should show course with Web3 enrollment

## 🚨 Troubleshooting

### Build Issues
```bash
# Check build logs in Vercel dashboard
# Common issues:
- Missing environment variables
- Prisma generation failures  
- TypeScript errors
```

### Database Connection
```bash
# Test database connection
npx prisma db push --preview-feature
```

### Environment Variables
```bash
# List all environment variables
vercel env ls

# Pull environment variables locally for testing
vercel env pull .env.production
```

## 🔄 Continuous Deployment

### Automatic Deployments
- **Production**: Deploys from `main` branch
- **Preview**: Deploys from feature branches
- **Database**: Use different databases for production/preview

### Manual Deployment
```bash
# Deploy specific branch to production
vercel --prod --target production

# Deploy with specific environment
vercel --env NODE_ENV=production
```

## 📊 Monitoring & Analytics

### Built-in Vercel Analytics
- Performance monitoring
- Error tracking  
- Usage statistics

### Custom Monitoring
- Health check endpoint: `/api/health`
- Database connection status
- Contract interaction metrics

## 🛡️ Security Configuration

### SSL/TLS
- ✅ Automatic SSL certificates via Vercel
- ✅ HTTPS redirects configured
- ✅ Security headers in `vercel.json`

### CSP Headers
- Configured for Privy, WalletConnect, and Celo RPC
- Allows necessary external resources
- Blocks unauthorized scripts

### Environment Security
- ✅ Secrets encrypted at rest
- ✅ No secrets in client-side code
- ✅ Separate production/preview environments

## 🎯 Post-Deployment Tasks

1. **Test all functionality** on production domain
2. **Update contract metadata** base URI if needed
3. **Verify SSL certificates** are working
4. **Test wallet connections** on mainnet/testnet
5. **Monitor application** performance and errors
6. **Set up custom domain** if desired

## 🔗 Useful Links

- [Vercel Dashboard](https://vercel.com/dashboard)
- [CeloMX Organization](https://github.com/CeloMX)
- [Contract on Celoscan](https://alfajores.celoscan.io/address/0x7Ed5CC0cf0B0532b52024a0DDa8fAE24C6F66dc3)
- [Privy Dashboard](https://dashboard.privy.io/)
- [WalletConnect Dashboard](https://cloud.walletconnect.com/)

---

🎉 **Ready for deployment!** Follow this guide step by step and your Celo MX Academy will be live on Vercel with full blockchain integration.