import FormData from 'form-data';
import fetch from 'node-fetch';

export async function uploadToIPFS(file: Buffer, filename: string): Promise<string> {
  try {
    const token = process.env.WEB3_STORAGE_TOKEN;
    
    if (!token) {
      throw new Error('WEB3_STORAGE_TOKEN not configured');
    }

    // Create FormData with the file buffer
    const formData = new FormData();
    formData.append('file', file, {
      filename: filename,
      contentType: 'application/octet-stream',
    });

    // Use web3.storage HTTP API
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

    const result = await response.json();
    return result.cid;
    
  } catch (error) {
    console.error('IPFS upload error:', error);
    throw new Error(`Failed to upload to IPFS: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
