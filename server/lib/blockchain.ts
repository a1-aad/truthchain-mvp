import { ethers } from 'ethers';
import * as fs from 'fs';
import * as path from 'path';

// Minimal TruthChain contract ABI
const TRUTHCHAIN_ABI = [
  "event RecordStored(bytes32 indexed hash, string cid, address indexed submitter, uint256 timestamp)",
  "function storeRecord(bytes32 hash, string memory cid) public"
];

// Load contract address from config or environment
function getContractAddress(): string | null {
  // Try environment variable first
  if (process.env.CONTRACT_ADDRESS) {
    return process.env.CONTRACT_ADDRESS;
  }
  
  // Try to load from contract-config.json
  try {
    const configPath = path.join(process.cwd(), 'contract-config.json');
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      return config.address;
    }
  } catch (error) {
    console.log('No contract config found');
  }
  
  return null;
}

export async function storeOnBlockchain(hash: string, cid: string): Promise<string> {
  const contractAddress = getContractAddress();
  const privateKey = process.env.POLYGON_PRIVATE_KEY;
  const enableMockMode = process.env.BLOCKCHAIN_MOCK_MODE === 'true';

  // Check configuration
  if (!privateKey) {
    console.warn('⚠️  POLYGON_PRIVATE_KEY not configured');
  }
  
  if (!contractAddress) {
    console.warn('⚠️  CONTRACT_ADDRESS not configured');
  }

  // MOCK MODE for MVP testing
  if (enableMockMode || !privateKey || !contractAddress) {
    console.log('🔧 Running in MOCK MODE (blockchain simulation)');
    console.log('   - Hash:', hash.substring(0, 16) + '...');
    console.log('   - CID:', cid);
    console.log('   - To enable real blockchain:');
    console.log('     1. Set POLYGON_PRIVATE_KEY in Replit Secrets');
    console.log('     2. Set CONTRACT_ADDRESS or deploy contract');
    console.log('     3. Set BLOCKCHAIN_MOCK_MODE=false (or remove it)');
    
    // Return mock transaction hash
    const mockTxHash = '0x' + hash.substring(0, 64);
    return mockTxHash;
  }

  // REAL BLOCKCHAIN MODE
  try {
    // Connect to Polygon Amoy testnet
    const provider = new ethers.JsonRpcProvider('https://rpc-amoy.polygon.technology/');
    const wallet = new ethers.Wallet(privateKey, provider);
    
    console.log('📡 Storing on Polygon Amoy Testnet');
    console.log('   Wallet:', wallet.address);
    console.log('   Contract:', contractAddress);
    
    // Create contract instance
    const contract = new ethers.Contract(contractAddress, TRUTHCHAIN_ABI, wallet);
    
    // Convert hash string to bytes32 (ensure 0x prefix)
    const hashBytes32 = hash.startsWith('0x') ? hash : `0x${hash}`;
    
    console.log('🔐 Recording verification:');
    console.log('   Hash:', hashBytes32);
    console.log('   CID:', cid);
    
    // Store on blockchain with gas limit
    const tx = await contract.storeRecord(hashBytes32, cid, {
      gasLimit: 200000
    });
    
    console.log('⏳ Transaction sent:', tx.hash);
    const receipt = await tx.wait();
    console.log('✅ Transaction confirmed:', receipt.hash);
    console.log('   Block:', receipt.blockNumber);
    console.log('   View on Polygonscan: https://amoy.polygonscan.com/tx/' + receipt.hash);
    
    return receipt.hash;
  } catch (error) {
    console.error('❌ Blockchain transaction failed:', error);
    
    // Provide helpful error messages
    if (error instanceof Error) {
      if (error.message.includes('insufficient funds')) {
        throw new Error('Insufficient MATIC for gas. Get testnet MATIC from https://faucet.polygon.technology/');
      }
      if (error.message.includes('nonce')) {
        throw new Error('Transaction nonce error. Wait a moment and try again.');
      }
      if (error.message.includes('UNPREDICTABLE_GAS_LIMIT')) {
        throw new Error('Contract interaction failed. Verify CONTRACT_ADDRESS points to deployed TruthChain contract.');
      }
    }
    
    throw error;
  }
}
