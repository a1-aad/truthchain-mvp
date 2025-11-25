import FormData from 'form-data';
import fetch from 'node-fetch';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

// Storage modes in order of preference:
// 1. Pinata (most reliable, requires PINATA_JWT)
// 2. Web3.Storage (legacy, may not work)
// 3. Local storage (fallback for testing)

export async function uploadToIPFS(file: Buffer, filename: string): Promise<string> {
  // Try Pinata first (recommended)
  const pinataJwt = process.env.PINATA_JWT;
  if (pinataJwt) {
    console.log('📌 Using Pinata for IPFS upload...');
    return uploadToPinata(file, filename, pinataJwt);
  }
  
  // Try Web3.Storage (legacy)
  const web3Token = process.env.WEB3_STORAGE_TOKEN;
  if (web3Token) {
    console.log('🌐 Trying Web3.Storage (legacy API)...');
    try {
      return await uploadToWeb3Storage(file, filename, web3Token);
    } catch (error) {
      console.warn('⚠️ Web3.Storage failed, falling back to local storage');
      console.warn('   Error:', error instanceof Error ? error.message : error);
      console.warn('   Note: Web3.Storage legacy API was deprecated in January 2024');
      console.warn('   Recommendation: Use Pinata by setting PINATA_JWT');
    }
  }
  
  // Fallback to local storage (for testing only)
  console.log('📁 Using local storage fallback (for testing only)');
  console.log('   To enable real IPFS:');
  console.log('   1. Create account at https://pinata.cloud');
  console.log('   2. Get API JWT from dashboard');
  console.log('   3. Set PINATA_JWT in Replit Secrets');
  return uploadToLocalStorage(file, filename);
}

async function uploadToPinata(file: Buffer, filename: string, jwt: string): Promise<string> {
  const formData = new FormData();
  formData.append('file', file, {
    filename: filename,
    contentType: 'application/octet-stream',
  });

  const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${jwt}`,
      ...formData.getHeaders(),
    },
    body: formData as any,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Pinata API error: ${response.status} - ${errorText}`);
  }

  const result = await response.json() as { IpfsHash: string };
  console.log('✅ Uploaded to Pinata:', result.IpfsHash);
  return result.IpfsHash;
}

async function uploadToWeb3Storage(file: Buffer, filename: string, token: string): Promise<string> {
  const formData = new FormData();
  formData.append('file', file, {
    filename: filename,
    contentType: 'application/octet-stream',
  });

  const response = await fetch('https://api.web3.storage/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      ...formData.getHeaders(),
    },
    body: formData as any,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Web3.Storage API error: ${response.status} - ${errorText}`);
  }

  const result = await response.json() as { cid: string };
  return result.cid;
}

async function uploadToLocalStorage(file: Buffer, filename: string): Promise<string> {
  // Create uploads directory if it doesn't exist
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  
  // Generate a CID-like hash from the file content
  const hash = crypto.createHash('sha256').update(file).digest('hex');
  const cid = `local_${hash.substring(0, 46)}`; // CID-like format
  
  // Save file with unique name
  const ext = path.extname(filename);
  const savedPath = path.join(uploadsDir, `${cid}${ext}`);
  fs.writeFileSync(savedPath, file);
  
  console.log('📁 File saved locally:', savedPath);
  console.log('⚠️ WARNING: This is NOT real IPFS storage!');
  console.log('   Files are stored locally for testing only.');
  console.log('   For production, configure PINATA_JWT for real IPFS.');
  
  return cid;
}

// Helper to check which storage mode is active
export function getStorageMode(): string {
  if (process.env.PINATA_JWT) return 'pinata';
  if (process.env.WEB3_STORAGE_TOKEN) return 'web3storage';
  return 'local';
}
