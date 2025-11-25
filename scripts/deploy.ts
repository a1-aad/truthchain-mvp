import { ethers } from 'ethers';
import * as fs from 'fs';
import * as path from 'path';

async function deploy() {
  console.log('🚀 Deploying TruthChain contract to Polygon Mainnet...\n');

  if (!process.env.POLYGON_PRIVATE_KEY) {
    throw new Error('POLYGON_PRIVATE_KEY environment variable not set');
  }

  // Load compiled contract
  const compiledPath = path.join(process.cwd(), 'contracts', 'TruthChain.json');
  if (!fs.existsSync(compiledPath)) {
    console.log('❌ Compiled contract not found. Run: npx tsx scripts/compile.ts');
    return;
  }
  
  const compiled = JSON.parse(fs.readFileSync(compiledPath, 'utf-8'));
  console.log('📦 Loaded compiled contract');

  // Connect to Polygon Mainnet
  const provider = new ethers.JsonRpcProvider('https://polygon-rpc.com/');
  const wallet = new ethers.Wallet(process.env.POLYGON_PRIVATE_KEY, provider);

  console.log('Deploying from address:', wallet.address);

  // Check balance
  const balance = await provider.getBalance(wallet.address);
  const balanceInPol = ethers.formatEther(balance);
  console.log('Balance:', balanceInPol, 'POL\n');

  if (balance === 0n) {
    console.log('⚠️  Warning: No POL balance. You need POL for gas fees.');
    return;
  }

  try {
    console.log('📦 Deploying contract...');
    
    // Create contract factory with compiled bytecode
    const factory = new ethers.ContractFactory(compiled.abi, compiled.bytecode, wallet);
    
    // Get current gas price
    const feeData = await provider.getFeeData();
    console.log('   Gas price:', ethers.formatUnits(feeData.gasPrice || 0n, 'gwei'), 'gwei');
    
    // Deploy with gas settings for Polygon
    const contract = await factory.deploy({
      gasLimit: 1000000,
    });
    
    console.log('⏳ Waiting for deployment confirmation...');
    console.log('   Transaction:', contract.deploymentTransaction()?.hash);
    
    // Wait for deployment
    await contract.waitForDeployment();
    const contractAddress = await contract.getAddress();
    
    console.log('\n✅ Contract deployed successfully!');
    console.log('   Address:', contractAddress);
    console.log('   View on Polygonscan: https://polygonscan.com/address/' + contractAddress);

    // Save contract address to file
    const configPath = path.join(process.cwd(), 'contract-config.json');
    fs.writeFileSync(configPath, JSON.stringify({
      address: contractAddress,
      network: 'polygon-mainnet',
      deployedAt: new Date().toISOString()
    }, null, 2));

    console.log('\n💾 Contract config saved to contract-config.json');
    console.log('\n🎉 TruthChain is ready! All uploads will now be verified on Polygon mainnet.');
    
  } catch (error) {
    console.error('❌ Deployment failed:', error);
    throw error;
  }
}

deploy().catch(console.error);
