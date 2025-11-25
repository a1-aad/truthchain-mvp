# TruthChain MVP - Setup Guide

This guide will help you get TruthChain running with full blockchain verification.

## Prerequisites

Before you can run TruthChain, you need:

1. ✅ **PostgreSQL Database** (Already configured by Replit)
2. ⚠️ **Web3.Storage Account** (Required for IPFS)
3. ⚠️ **Polygon Wallet with Testnet MATIC** (Required for blockchain)
4. ⚠️ **Deployed Smart Contract** (Required for verification)

## Step 1: Get Web3.Storage API Token

1. Go to https://web3.storage
2. Create a free account
3. Navigate to "Account" → "Create API Token"
4. Copy your API token
5. Add to Replit Secrets:
   - Key: `WEB3_STORAGE_TOKEN`
   - Value: Your API token

## Step 2: Set Up Polygon Wallet

1. Install MetaMask or your preferred wallet
2. Create a new wallet or use an existing one
3. **⚠️ IMPORTANT**: Use a separate wallet for testnet - NEVER use your main wallet
4. Switch to Polygon Amoy Testnet:
   - Network Name: Polygon Amoy Testnet
   - RPC URL: https://rpc-amoy.polygon.technology/
   - Chain ID: 80002
   - Currency Symbol: MATIC
   - Block Explorer: https://amoy.polygonscan.com/

5. Get FREE testnet MATIC:
   - Go to https://faucet.polygon.technology/
   - Select "Polygon Amoy"
   - Enter your wallet address
   - Request tokens (usually get 0.5 MATIC)

6. Export your private key:
   - **⚠️ SECURITY WARNING**: This is ONLY for testnet!
   - In MetaMask: Account Menu → Account Details → Export Private Key
   - Copy the private key
   - Add to Replit Secrets:
     - Key: `POLYGON_PRIVATE_KEY`
     - Value: Your private key (with or without 0x prefix)

## Step 3: Deploy the Smart Contract

### Option A: Auto-Deploy (Recommended)

The deployment script will attempt to deploy automatically on first run:

```bash
npx tsx scripts/deploy.ts
```

This will:
- Connect to Polygon Amoy using your private key
- Deploy the TruthChain.sol contract
- Save the contract address to `contract-config.json`

### Option B: Use Pre-Deployed Contract

If you already have a deployed TruthChain contract:

1. Create `contract-config.json`:
```json
{
  "address": "0xYourContractAddress",
  "network": "polygon-amoy",
  "deployedAt": "2024-11-25T00:00:00.000Z"
}
```

OR set environment variable:
- Key: `CONTRACT_ADDRESS`
- Value: `0xYourContractAddress`

## Step 4: Verify Everything is Ready

Run this checklist:

- [ ] `WEB3_STORAGE_TOKEN` is set in Replit Secrets
- [ ] `POLYGON_PRIVATE_KEY` is set in Replit Secrets
- [ ] Wallet has testnet MATIC (check at https://amoy.polygonscan.com/)
- [ ] `contract-config.json` exists with real contract address
- [ ] Database is connected (should be automatic on Replit)

## Step 5: Start the Application

```bash
npm run dev
```

The app will:
1. Start Express backend on port 5000
2. Validate that all secrets are configured
3. Check blockchain connectivity
4. Start Vite frontend

## Testing the Upload Flow

1. Open http://localhost:5000
2. Enter some news text
3. Upload an image or video
4. Click "Verify & Submit"

**What happens:**
1. File uploads to IPFS → get CID
2. SHA-256 hash generated (text + CID + timestamp)
3. Hash recorded on Polygon blockchain → get transaction hash
4. Record saved to PostgreSQL
5. Success message displayed

**Expected time:** 10-20 seconds (most time is blockchain transaction)

## Troubleshooting

### "Web3.Storage API error: 401"
- Your `WEB3_STORAGE_TOKEN` is invalid or expired
- Get a new token from https://web3.storage

### "POLYGON_PRIVATE_KEY not configured"
- Add your wallet's private key to Replit Secrets
- Make sure it's from a testnet wallet only!

### "Smart contract not deployed"
- Run `npx tsx scripts/deploy.ts` to deploy
- OR add `CONTRACT_ADDRESS` environment variable with existing contract

### "Insufficient MATIC for gas"
- Your wallet needs testnet MATIC
- Get free testnet MATIC from https://faucet.polygon.technology/
- Wait a few minutes for the faucet transaction to confirm

### "Transaction nonce error"
- This usually resolves itself
- Wait 30 seconds and try again
- If persistent, restart the development server

### Upload is slow
- IPFS upload: 2-5 seconds (depends on file size)
- Blockchain transaction: 5-15 seconds (depends on network)
- This is normal for decentralized systems!

## Security Notes

⚠️ **NEVER** use your mainnet wallet or private keys!
⚠️ **NEVER** commit private keys to git!
⚠️ **NEVER** share your Replit Secrets!

This is a testnet-only application. For production:
- Use client-side wallet connection (MetaMask)
- Never store private keys on the server
- Implement rate limiting
- Add content moderation
- Get security audit before mainnet deployment

## Production Deployment

When ready for production (Polygon mainnet):

1. Deploy contract to Polygon mainnet
2. Update `CONTRACT_ADDRESS` to mainnet address
3. Remove `POLYGON_PRIVATE_KEY` from server
4. Implement MetaMask/WalletConnect integration
5. Users sign transactions with their own wallets
6. Add rate limiting and spam prevention
7. Get smart contract security audit

## Need Help?

- Check README.md for full documentation
- Review contract-config.json for contract address
- Check Polygon block explorer for transactions
- View IPFS files at https://w3s.link/ipfs/{CID}

## Quick Reference

**Polygon Amoy Testnet:**
- RPC: https://rpc-amoy.polygon.technology/
- Explorer: https://amoy.polygonscan.com/
- Faucet: https://faucet.polygon.technology/

**IPFS Gateway:**
- https://w3s.link/ipfs/{CID}
- https://ipfs.io/ipfs/{CID}

**Environment Variables:**
```
DATABASE_URL=postgresql://... (auto-configured)
WEB3_STORAGE_TOKEN=your_token_here
POLYGON_PRIVATE_KEY=0x...
CONTRACT_ADDRESS=0x... (optional, uses contract-config.json)
```
