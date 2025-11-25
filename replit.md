# TruthChain MVP - Project Documentation

## Overview

TruthChain is a decentralized news verification platform built on Replit. It combines IPFS storage, PostgreSQL database, and Polygon blockchain to create immutable, verifiable records of news content.

**Key Features:**
- Upload news with media files (images/video)
- Automatic IPFS storage via Web3.Storage
- SHA-256 cryptographic hash generation
- Blockchain verification on Polygon Amoy testnet
- PostgreSQL persistence for fast querying
- Beautiful React frontend with Tailwind CSS + Shadcn UI

## Recent Changes (November 25, 2024)

### Initial Implementation
- Set up PostgreSQL database with Drizzle ORM for news records
- Integrated Web3.Storage SDK for IPFS uploads
- Implemented Express API with file upload support (multer)
- Built blockchain integration with ethers.js for Polygon
- Created React frontend with upload form and records table
- Designed using Inter (UI) and JetBrains Mono (code) fonts
- Configured green/blue color scheme per design guidelines

### Architecture Decisions
- **Database:** PostgreSQL (via Drizzle ORM) instead of SQLite for Replit compatibility
- **IPFS:** Web3.Storage SDK for decentralized file storage
- **Blockchain:** Polygon Amoy testnet for cost-effective verification
- **Backend:** Express with multer for handling multipart file uploads
- **Frontend:** React + TypeScript with Shadcn UI components

## Project Structure

```
├── client/                    # React frontend
│   ├── src/
│   │   ├── pages/home.tsx    # Main page with upload form + records
│   │   └── components/ui/    # Shadcn UI components
├── server/                    # Express backend
│   ├── lib/
│   │   ├── ipfs.ts          # Web3.Storage integration
│   │   ├── blockchain.ts    # Polygon smart contract calls
│   │   └── hash.ts          # SHA-256 hashing
│   ├── routes.ts            # API endpoints
│   └── storage.ts           # Database interface
├── contracts/
│   └── TruthChain.sol       # Solidity verification contract
├── scripts/
│   └── deploy.ts            # Contract deployment script
├── shared/
│   └── schema.ts            # Drizzle database schema
└── db/
    └── index.ts             # Database connection
```

## Environment Configuration

### Required Secrets (via Replit Secrets)
- `DATABASE_URL` - PostgreSQL connection (auto-configured)
- `WEB3_STORAGE_TOKEN` - Web3.Storage API token
- `POLYGON_PRIVATE_KEY` - Wallet private key for Polygon testnet

### Database Variables (Auto-configured)
- `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`

## API Endpoints

### `GET /api/records`
Fetches all verified news records from PostgreSQL database.

**Response:** Array of NewsRecord objects with:
- id, text, cid (IPFS), hash (SHA-256), tx (blockchain)
- fileName, fileType, timestamp

### `POST /api/upload`
Uploads news with media file.

**Flow:**
1. Receive multipart form data (text + file)
2. Upload file to IPFS → get CID
3. Generate SHA-256 hash of (text + CID + timestamp)
4. Store hash on Polygon blockchain → get transaction hash
5. Save record to PostgreSQL
6. Return verification details

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
}
```

## Technology Stack

**Frontend:**
- React 18 + TypeScript
- Tailwind CSS with custom green/blue theme
- Shadcn UI components
- TanStack Query for data fetching
- Wouter for routing
- Inter font (UI), JetBrains Mono (code)

**Backend:**
- Node.js + Express
- PostgreSQL + Drizzle ORM
- Multer (file uploads)
- Web3.Storage SDK (IPFS)
- ethers.js (Polygon blockchain)
- crypto (SHA-256 hashing)

**Blockchain:**
- Polygon Amoy Testnet
- Solidity 0.8.x
- TruthChain.sol smart contract

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
- Upload form: Card with drag-drop file input
- Records table: Responsive with truncated data + copy buttons
- Status badges: "Verified" with ShieldCheck icon
- Loading states: Spinner + progress bar

## Security Considerations (MVP)

⚠️ **Current Limitations:**
- Server-side wallet (private key) - for MVP only
- No rate limiting on uploads
- No content moderation
- Testnet only (no real value)

**Production TODO:**
- Client-side wallet integration (MetaMask)
- Rate limiting and spam prevention
- Content validation and moderation
- Move to Polygon mainnet
- Audit smart contract

## Troubleshooting

### IPFS Upload Fails
- Check `WEB3_STORAGE_TOKEN` is valid
- Verify network connectivity
- Ensure file size < 50MB

### Blockchain Transaction Fails
- Verify `POLYGON_PRIVATE_KEY` is set
- Check wallet has testnet MATIC
- Confirm Polygon Amoy RPC is accessible
- MVP falls back to mock transaction if blockchain fails

### Database Errors
- Run `npm run db:push` to sync schema
- Check `DATABASE_URL` is configured
- Verify PostgreSQL is running

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

## Contributing

1. Follow TypeScript best practices
2. Use existing Shadcn UI components
3. Maintain design system consistency
4. Add proper error handling
5. Test thoroughly before committing

## Resources

- [Web3.Storage Docs](https://web3.storage/docs/)
- [Polygon Amoy Faucet](https://faucet.polygon.technology/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Shadcn UI](https://ui.shadcn.com/)
- [ethers.js](https://docs.ethers.org/)
