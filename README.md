# TruthChain MVP

**Decentralized News Verification Prototype**

An open-source platform that verifies news authenticity using IPFS storage and Polygon blockchain technology.

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)

---

## 🎯 What is TruthChain?

TruthChain is a minimal viable product (MVP) demonstrating decentralized news verification. When users submit news content with supporting media, the system:

1. **Uploads** media files to IPFS (Web3.Storage) for permanent, decentralized storage
2. **Generates** a SHA-256 cryptographic hash of the news package (text + IPFS CID + timestamp)
3. **Records** the verification hash on the Polygon blockchain for immutable proof
4. **Stores** all metadata in a PostgreSQL database for fast querying

This creates a tamper-proof, verifiable record of news content that can be independently validated.

---

## 🏗️ How It Works

### Architecture Overview

```
┌─────────────┐
│   Frontend  │  (React + TypeScript)
│  User Upload│
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────┐
│        Backend API (Express)        │
│  ┌──────────┐  ┌────────────────┐  │
│  │   IPFS   │  │   PostgreSQL   │  │
│  │ Storage  │  │    Database    │  │
│  └──────────┘  └────────────────┘  │
│         │                           │
│         ▼                           │
│  ┌─────────────────────────────┐   │
│  │  Polygon Blockchain         │   │
│  │  (Amoy Testnet)             │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

### Verification Flow

1. **User submits** news text + media file (image/video)
2. **Server uploads** media to IPFS → receives Content ID (CID)
3. **Server generates** SHA-256 hash: `hash = SHA256(text + cid + timestamp)`
4. **Server calls** smart contract `storeRecord(hash, cid)` on Polygon
5. **Transaction confirmed** → hash is permanently recorded on blockchain
6. **Database saves** record with CID, hash, and transaction reference
7. **User receives** verification confirmation with IPFS and blockchain links

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (provided by Replit)
- Web3.Storage account and API token
- Polygon wallet with testnet MATIC (optional for blockchain)

### Environment Variables

Create a `.env` file or use Replit Secrets:

```bash
# Required
DATABASE_URL=postgresql://...           # PostgreSQL connection
WEB3_STORAGE_TOKEN=your_token_here     # From https://web3.storage
POLYGON_PRIVATE_KEY=0x...              # Wallet private key (testnet only!)

# Auto-configured by Replit
PGHOST=...
PGPORT=5432
PGUSER=...
PGPASSWORD=...
PGDATABASE=...
```

### Installation

```bash
# Install dependencies
npm install

# Push database schema
npm run db:push

# Start development server
npm run dev
```

The app will be available at `http://localhost:5000`

### Getting Web3.Storage Token

1. Go to [web3.storage](https://web3.storage)
2. Create a free account
3. Generate an API token
4. Add to your environment as `WEB3_STORAGE_TOKEN`

### Getting Testnet MATIC

1. Create a wallet (MetaMask, etc.)
2. Switch to Polygon Amoy testnet
3. Get free testnet MATIC: https://faucet.polygon.technology/
4. Export private key → add as `POLYGON_PRIVATE_KEY`

**⚠️ Security Warning:** Never use mainnet private keys or share your secrets!

---

## 📖 API Documentation

### `GET /api/records`

Fetch all verified news records.

**Response:**
```json
[
  {
    "id": "uuid",
    "text": "News content...",
    "cid": "bafybei...",
    "hash": "a1b2c3...",
    "tx": "0x1234...",
    "fileName": "image.jpg",
    "fileType": "image/jpeg",
    "timestamp": "2024-01-15T10:30:00Z"
  }
]
```

### `POST /api/upload`

Submit news for verification.

**Request (multipart/form-data):**
- `text` (string): News content
- `file` (file): Media file (JPG, PNG, GIF, MP4, WebM)

**Response:**
```json
{
  "success": true,
  "hash": "a1b2c3d4e5f...",
  "cid": "bafybei...",
  "txHash": "0x1234abcd...",
  "record": { ... }
}
```

---

## 🎨 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Shadcn UI** component library
- **TanStack Query** for data fetching
- **Wouter** for routing
- **date-fns** for date formatting
- **Lucide React** for icons

### Backend
- **Node.js + Express** REST API
- **PostgreSQL** with Drizzle ORM
- **Multer** for file uploads
- **ethers.js** for blockchain interaction
- **Web3.Storage** SDK for IPFS

### Blockchain
- **Polygon Amoy Testnet** (EVM-compatible)
- **Solidity 0.8.x** smart contract
- **TruthChain.sol** - minimal verification contract

---

## 📁 Project Structure

```
truthchain/
├── client/                  # Frontend React app
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── lib/            # Utilities
│   │   └── hooks/          # Custom React hooks
│   └── index.html
├── server/                  # Backend Express server
│   ├── lib/
│   │   ├── ipfs.ts        # IPFS integration
│   │   ├── blockchain.ts  # Polygon integration
│   │   └── hash.ts        # SHA-256 utilities
│   ├── routes.ts          # API endpoints
│   └── storage.ts         # Database interface
├── contracts/              # Smart contracts
│   └── TruthChain.sol     # Verification contract
├── scripts/                # Deployment scripts
│   └── deploy.ts          # Contract deployment
├── shared/                 # Shared types/schemas
│   └── schema.ts          # Database schema
└── README.md              # This file
```

---

## 🔗 Smart Contract

### TruthChain.sol

A minimal Solidity contract for storing verification records:

```solidity
contract TruthChain {
    event RecordStored(bytes32 hash, string cid);
    
    function storeRecord(bytes32 hash, string memory cid) public {
        // Store verification hash + IPFS CID
        // Emit event for transparency
    }
}
```

**Features:**
- Stores hash + IPFS CID mapping
- Emits events for off-chain indexing
- No centralized control
- Minimal gas costs

### Deploying the Contract

```bash
# Using the deployment script
npx tsx scripts/deploy.ts

# Or with Hardhat (production)
npx hardhat compile
npx hardhat run scripts/deploy.ts --network polygon-amoy
```

The contract address will be saved to `contract-config.json`.

---

## 🧪 Testing

### Manual Testing

1. Start the development server
2. Open `http://localhost:5000`
3. Enter news text and upload an image
4. Click "Verify & Submit"
5. Wait for IPFS upload and blockchain confirmation
6. Verify record appears in the table below

### Verification

- **IPFS:** View files at `https://w3s.link/ipfs/{CID}`
- **Blockchain:** Check transactions on Polygon scan
- **Hash:** Verify integrity by re-computing SHA-256

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use existing component patterns (Shadcn UI)
- Add proper error handling
- Write clear commit messages
- Test your changes thoroughly

---

## 🗺️ Roadmap

### Phase 1: MVP ✅
- [x] IPFS file upload integration
- [x] SHA-256 hash generation
- [x] PostgreSQL database storage
- [x] Polygon blockchain recording
- [x] Basic web UI
- [x] REST API endpoints

### Phase 2: Enhanced Verification
- [ ] User authentication system
- [ ] Personal verification dashboards
- [ ] Fact-checking workflow
- [ ] Community voting on news credibility
- [ ] Reputation scoring for sources

### Phase 3: Advanced Features
- [ ] Browser extension for auto-verification
- [ ] Multi-chain support (Ethereum, Arbitrum, etc.)
- [ ] News source reputation metrics
- [ ] API for third-party integrations
- [ ] Mobile app (React Native)

### Phase 4: Decentralization
- [ ] Decentralized storage alternatives
- [ ] DAO governance for platform rules
- [ ] Token-based incentive system
- [ ] Distributed moderation
- [ ] Cross-chain verification bridges

---

## 🔒 Security Considerations

### Current MVP Limitations

⚠️ **This is a prototype - not production-ready:**

- Private keys are stored server-side (use wallet connections in production)
- No rate limiting on uploads
- No content moderation system
- Limited input validation
- Testnet only - not real value

### Production Recommendations

1. **Client-side wallet integration** (MetaMask, WalletConnect)
2. **Content moderation** and spam prevention
3. **Rate limiting** and CAPTCHA
4. **Enhanced validation** for uploads
5. **Audit** smart contracts before mainnet
6. **Encrypt** sensitive data at rest
7. **Implement** proper access controls

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

This means you can:
- ✅ Use commercially
- ✅ Modify and distribute
- ✅ Use privately
- ✅ Patent use

As long as you:
- ℹ️ Include original license
- ℹ️ State changes made

---

## 🙏 Acknowledgments

- **Web3.Storage** for decentralized file storage
- **Polygon** for scalable blockchain infrastructure
- **Ethereum** ecosystem and tooling
- **Shadcn UI** for beautiful components
- **Drizzle ORM** for type-safe database queries
- **Open-source community** for making this possible

---

## 📞 Support & Contact

- **Issues:** [GitHub Issues](https://github.com/yourusername/truthchain/issues)
- **Discussions:** [GitHub Discussions](https://github.com/yourusername/truthchain/discussions)
- **Documentation:** This README + inline code comments

---

## 🌟 Star History

If you find TruthChain useful, please consider giving it a star! ⭐

It helps others discover the project and motivates continued development.

---

**Built with ❤️ for a more transparent internet**

*TruthChain MVP - Decentralized News Verification*
