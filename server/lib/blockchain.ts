import { ethers } from 'ethers';
import * as fs from 'fs';
import * as path from 'path';

const TRUTHCHAIN_ABI = [
  {
    "inputs": [
      { "internalType": "bytes32", "name": "hash", "type": "bytes32" },
      { "internalType": "string", "name": "cid", "type": "string" }
    ],
    "name": "storeRecord",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "bytes32", "name": "hash", "type": "bytes32" },
      { "indexed": false, "internalType": "string", "name": "cid", "type": "string" },
      { "indexed": true, "internalType": "address", "name": "submitter", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "name": "RecordStored",
    "type": "event"
  }
];

function getContractAddress(): string | null {
  if (process.env.CONTRACT_ADDRESS) {
    return process.env.CONTRACT_ADDRESS;
  }
  
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
  const testMode = process.env.TEST_MODE === 'true';

  if (testMode) {
    console.log('🧪 TEST MODE: Simulating blockchain verification');
    const mockTxHash = '0xtest_' + hash.substring(0, 58);
    return mockTxHash;
  }

  if (!privateKey) {
    throw new Error('POLYGON_PRIVATE_KEY not configured');
  }
  
  if (!contractAddress) {
    throw new Error('CONTRACT_ADDRESS not configured. Deploy contract first.');
  }

  try {
    const provider = new ethers.JsonRpcProvider('https://polygon-rpc.com/');
    const wallet = new ethers.Wallet(privateKey, provider);
    
    console.log('📡 Storing on Polygon Mainnet');
    console.log('   Wallet:', wallet.address);
    console.log('   Contract:', contractAddress);
    
    const contract = new ethers.Contract(contractAddress, TRUTHCHAIN_ABI, wallet);
    
    const hashBytes32 = '0x' + hash.replace(/^0x/, '');
    
    console.log('🔐 Recording verification:');
    console.log('   Raw hash:', hash);
    console.log('   Bytes32:', hashBytes32);
    console.log('   Hash length:', hashBytes32.length, '(should be 66)');
    console.log('   CID:', cid);
    
    if (hashBytes32.length !== 66) {
      throw new Error(`Invalid hash length: ${hashBytes32.length}, expected 66 (0x + 64 hex chars)`);
    }

    const feeData = await provider.getFeeData();
    console.log('   Gas price:', ethers.formatUnits(feeData.gasPrice || 0n, 'gwei'), 'gwei');

    const populatedTx = await contract.storeRecord.populateTransaction(hashBytes32, cid);
    console.log('   TX data length:', populatedTx.data?.length || 0);
    
    const tx = await contract.storeRecord(hashBytes32, cid, {
      gasLimit: 300000,
    });
    
    console.log('⏳ Transaction sent:', tx.hash);
    console.log('   Waiting for confirmation...');
    
    const receipt = await tx.wait();
    
    console.log('✅ Transaction confirmed!');
    console.log('   Block:', receipt.blockNumber);
    console.log('   Gas used:', receipt.gasUsed.toString());
    console.log('   Status:', receipt.status === 1 ? 'SUCCESS' : 'FAILED');
    console.log('   View: https://polygonscan.com/tx/' + receipt.hash);
    
    if (receipt.status === 0) {
      throw new Error('Transaction failed on-chain');
    }
    
    return receipt.hash;
  } catch (error) {
    console.error('❌ Blockchain transaction failed:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('insufficient funds')) {
        throw new Error('Insufficient POL for gas fees');
      }
      if (error.message.includes('Record already exists')) {
        throw new Error('This content has already been verified on blockchain');
      }
      if (error.message.includes('nonce')) {
        throw new Error('Transaction nonce error. Please try again.');
      }
    }
    
    throw error;
  }
}
