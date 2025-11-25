import solc from 'solc';
import * as fs from 'fs';
import * as path from 'path';

const contractPath = path.join(process.cwd(), 'contracts', 'TruthChain.sol');
const source = fs.readFileSync(contractPath, 'utf-8');

const input = {
  language: 'Solidity',
  sources: {
    'TruthChain.sol': {
      content: source
    }
  },
  settings: {
    outputSelection: {
      '*': {
        '*': ['*']
      }
    },
    optimizer: {
      enabled: true,
      runs: 200
    }
  }
};

console.log('🔧 Compiling TruthChain.sol...\n');

const output = JSON.parse(solc.compile(JSON.stringify(input)));

if (output.errors) {
  output.errors.forEach((error: any) => {
    console.log(error.formattedMessage);
  });
}

if (output.contracts && output.contracts['TruthChain.sol']) {
  const contract = output.contracts['TruthChain.sol']['TruthChain'];
  
  console.log('✅ Compilation successful!\n');
  
  const bytecode = contract.evm.bytecode.object;
  const abi = contract.abi;
  
  console.log('📦 Bytecode length:', bytecode.length, 'characters');
  console.log('📋 ABI functions:', abi.filter((x: any) => x.type === 'function').map((x: any) => x.name));
  
  // Save compiled output
  const compiledPath = path.join(process.cwd(), 'contracts', 'TruthChain.json');
  fs.writeFileSync(compiledPath, JSON.stringify({
    abi: abi,
    bytecode: '0x' + bytecode
  }, null, 2));
  
  console.log('\n💾 Saved to contracts/TruthChain.json');
  console.log('\n📝 Bytecode (first 100 chars):', ('0x' + bytecode).substring(0, 100) + '...');
} else {
  console.error('❌ Compilation failed - no output');
}
