# TruthChain MVP - Project Documentation

## Overview

TruthChain is a decentralized news verification platform built on Replit. It combines IPFS storage, PostgreSQL database, and Polygon blockchain to create immutable, verifiable records of news content. **Users connect their own MetaMask wallets and pay their own gas fees for complete decentralization.**

**Key Features:**
- MetaMask wallet integration (user-owned wallets)
- Upload news with media files (images/video)
- Automatic IPFS storage via Web3.Storage
- SHA-256 cryptographic hash generation
- Blockchain verification on Polygon Mainnet
- Client-side transaction signing (users pay their own gas)
- Server-side transaction and event verification
- PostgreSQL persistence for fast querying
- Beautiful React frontend with Tailwind CSS + Shadcn UI

## Recent Changes (November 25, 2025)

### MetaMask Integration (Latest)
- Added WalletContext for MetaMask connection state management
- Created WalletButton component with connect/disconnect functionality
- Implemented network detection (Polygon Mainnet, chainId: 137)
- Added automatic network switching prompt
- Moved blockchain transaction signing to client-side (browser)
- Two-step upload flow: prepare (IPFS + hash) → sign (MetaMask) → verify & save
- Server verifies RecordStored event logs before saving records
- Added duplicate record prevention (hash and tx uniqueness check)
- Proper bytes32 hash formatting with ethers.zeroPadValue
- Transaction replay attack prevention via event log verification

### Architecture Decisions
- **Database:** PostgreSQL (via Drizzle ORM) with wallet_address field
- **IPFS:** Web3.Storage SDK for decentralized file storage
- **Blockchain:** Polygon Mainnet for production verification
- **Backend:** Express with multer for handling multipart file uploads
- **Frontend:** React + TypeScript with Shadcn UI components
- **Wallet:** MetaMask integration with ethers.js BrowserProvider

## Project Structure

```
├── client/                    # React frontend
│   ├── src/
│   │   ├── contexts/
│   │   │   └── WalletContext.tsx  # MetaMask wallet state
│   │   ├── components/
│   │   │   └── WalletButton.tsx   # Connect wallet UI
│   │   ├── pages/home.tsx    # Main page with upload form + records
│   │   └── components/ui/    # Shadcn UI components
├── server/                    # Express backend
│   ├── lib/
│   │   ├── ipfs.ts          # Web3.Storage integration
│   │   ├── blockchain.ts    # Polygon contract ABI (not used for signing)
│   │   └── hash.ts          # SHA-256 hashing
│   ├── routes.ts            # API endpoints
│   └── storage.ts           # Database interface
├── contracts/
│   └── TruthChain.sol       # Solidity verification contract
├── contract-config.json     # Deployed contract address
├── shared/
│   └── schema.ts            # Drizzle database schema
└── db/
    └── index.ts             # Database connection
```

## Environment Configuration

### Required Secrets (via Replit Secrets)
- `DATABASE_URL` - PostgreSQL connection (auto-configured)
- `WEB3_STORAGE_TOKEN` - Web3.Storage API token
- `SESSION_SECRET` - Express session secret

### Database Variables (Auto-configured)
- `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`

### Smart Contract
- **Network:** Polygon Mainnet (chainId: 137)
- **Contract Address:** 0x8473fCf963A0b71994F16dFba2DeE53993377316
- **RPC URL:** https://polygon-rpc.com/

## API Endpoints

### `GET /api/records`
Fetches all verified news records from PostgreSQL database.

**Response:** Array of NewsRecord objects with:
- id, text, cid (IPFS), hash (SHA-256), tx (blockchain)
- fileName, fileType, timestamp, walletAddress

### `POST /api/prepare-upload`
Prepares upload by storing to IPFS and generating hash.

**Request (multipart/form-data):**
- text: News content
- file: Media file (image/video)

**Response:**
- cid: IPFS content identifier
- hash: SHA-256 hash
- timestamp: ISO timestamp

### `POST /api/save-record`
Saves record after client-side blockchain transaction.

**Request (JSON):**
- text, cid, hash, tx, fileName, fileType, timestamp, walletAddress

**Verification Steps:**
1. Validates hash matches content
2. Checks for duplicate records (hash/tx)
3. Fetches transaction receipt from blockchain
4. Verifies transaction sent to TruthChain contract
5. Decodes RecordStored event logs
6. Validates hash and submitter in event match request
7. Saves verified record to database

## Database Schema

### newsRecords Table
```typescript
{
  id: varchar (UUID primary key)
  text: text (news content)
  cid: text (IPFS content ID)
  hash: text (SHA-256 hash)
  tx: text (blockchain transaction hash)
  fileName: text (original filename)
  fileType: text (MIME type)
  timestamp: timestamp (creation time)
  walletAddress: text (submitter's wallet address)
}
```

## Technology Stack

**Frontend:**
- React 18 + TypeScript
- Tailwind CSS with custom green/blue theme
- Shadcn UI components
- TanStack Query for data fetching
- Wouter for routing
- ethers.js v6 for MetaMask integration
- Inter font (UI), JetBrains Mono (code)

**Backend:**
- Node.js + Express
- PostgreSQL + Drizzle ORM
- Multer (file uploads)
- Web3.Storage SDK (IPFS)
- ethers.js (transaction verification)
- crypto (SHA-256 hashing)

**Blockchain:**
- Polygon Mainnet (chainId: 137)
- Solidity 0.8.x
- TruthChain.sol smart contract

## Upload Flow

1. **User connects wallet** → MetaMask prompts for connection
2. **Network validation** → Checks for Polygon Mainnet, prompts switch if needed
3. **User submits content** → Text + media file
4. **Server prepares** → Uploads to IPFS, generates hash, returns data
5. **Client signs** → MetaMask prompts for transaction signature
6. **User pays gas** → MATIC from user's own wallet
7. **Transaction sent** → Contract stores hash on-chain
8. **Server verifies** → Fetches receipt, decodes events, validates data
9. **Record saved** → Stored in PostgreSQL with wallet address

## Security Features

**Current Security:**
- Client-side wallet (no server private key needed)
- Transaction verification with event log decoding
- Duplicate record prevention (hash + tx uniqueness)
- Hash validation before saving
- Submitter address verification
- Network validation (only Polygon Mainnet)

**MVP Limitations:**
- No rate limiting on uploads
- No content moderation
- Basic error handling

## Troubleshooting

### MetaMask Issues
- Ensure MetaMask is installed
- Check you're on Polygon Mainnet (chainId: 137)
- Ensure wallet has MATIC for gas fees
- Try disconnecting and reconnecting

### IPFS Upload Fails
- Check `WEB3_STORAGE_TOKEN` is valid
- Verify network connectivity
- Ensure file size < 50MB

### Transaction Verification Fails
- Wait for transaction to be mined
- Check Polygon RPC is accessible
- Ensure transaction was sent to correct contract

### Database Errors
- Run `npm run db:push` to sync schema
- Check `DATABASE_URL` is configured
- Verify PostgreSQL is running

## Development Workflow

### Running Locally
```bash
npm run dev          # Start development server
npm run db:push      # Push schema changes to database
npm run check        # TypeScript type checking
```

### Adding Features
1. Update `shared/schema.ts` for new data models
2. Run `npm run db:push` to sync database
3. Update storage interface in `server/storage.ts`
4. Add API routes in `server/routes.ts`
5. Build frontend components in `client/src/pages/`
6. Test end-to-end functionality

## Design System

Following design_guidelines.md:

**Colors:**
- Primary: Green (142° 76% 36%) - verification, success
- Chart-2: Blue (197° 71% 38%) - blockchain elements
- Muted/Secondary: Subtle grays for hierarchy

**Typography:**
- Headings: Inter, bold, tracking-tight
- Body: Inter, normal weight
- Code/Data: JetBrains Mono (hashes, CIDs, transaction IDs)

**Components:**
- Wallet button: Connect/disconnect with address display
- Upload form: Card with drag-drop file input
- Records table: Responsive with truncated data + copy buttons
- Status badges: "Verified" with ShieldCheck icon
- Loading states: Spinner + progress bar

## Future Roadmap

**Phase 2:**
- User authentication
- Personal dashboards
- Community fact-checking voting

**Phase 3:**
- Browser extension
- Multi-chain support
- Source reputation scoring

**Phase 4:**
- Full decentralization
- DAO governance
- Token incentives

## Resources

- [Web3.Storage Docs](https://web3.storage/docs/)
- [Polygon RPC](https://polygon-rpc.com/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Shadcn UI](https://ui.shadcn.com/)
- [ethers.js](https://docs.ethers.org/)
- [MetaMask Docs](https://docs.metamask.io/)
