import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { ethers } from 'ethers';

interface WalletContextType {
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  chainId: number | null;
  isPolygonMainnet: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  switchToPolygon: () => Promise<void>;
  signAndSendTransaction: (hash: string, cid: string) => Promise<string>;
}

const WalletContext = createContext<WalletContextType | null>(null);

const POLYGON_MAINNET_CHAIN_ID = 137;
const POLYGON_RPC_URL = 'https://polygon-rpc.com/';

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
  }
];

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contractAddress, setContractAddress] = useState<string | null>(null);

  const isConnected = !!address;
  const isPolygonMainnet = chainId === POLYGON_MAINNET_CHAIN_ID;

  useEffect(() => {
    fetch('/api/contract-address')
      .then(res => res.json())
      .then(data => {
        if (data.address) {
          setContractAddress(data.address);
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    const ethereum = (window as any).ethereum;
    if (!ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        setAddress(null);
      } else {
        setAddress(accounts[0]);
      }
    };

    const handleChainChanged = (chainIdHex: string) => {
      setChainId(parseInt(chainIdHex, 16));
    };

    ethereum.on('accountsChanged', handleAccountsChanged);
    ethereum.on('chainChanged', handleChainChanged);

    ethereum.request({ method: 'eth_accounts' })
      .then((accounts: string[]) => {
        if (accounts.length > 0) {
          setAddress(accounts[0]);
        }
      });

    ethereum.request({ method: 'eth_chainId' })
      .then((chainIdHex: string) => {
        setChainId(parseInt(chainIdHex, 16));
      });

    return () => {
      ethereum.removeListener('accountsChanged', handleAccountsChanged);
      ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, []);

  const connect = useCallback(async () => {
    const ethereum = (window as any).ethereum;
    
    if (!ethereum) {
      setError('MetaMask is not installed. Please install it from metamask.io');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const accounts = await ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      setAddress(accounts[0]);
      
      const chainIdHex = await ethereum.request({ method: 'eth_chainId' });
      setChainId(parseInt(chainIdHex, 16));
      
    } catch (err: any) {
      if (err.code === 4001) {
        setError('Connection rejected');
      } else {
        setError('Failed to connect wallet');
      }
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
    setChainId(null);
    setError(null);
  }, []);

  const switchToPolygon = useCallback(async () => {
    const ethereum = (window as any).ethereum;
    if (!ethereum) return;

    try {
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x89' }],
      });
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x89',
              chainName: 'Polygon Mainnet',
              nativeCurrency: {
                name: 'POL',
                symbol: 'POL',
                decimals: 18
              },
              rpcUrls: [POLYGON_RPC_URL],
              blockExplorerUrls: ['https://polygonscan.com/']
            }],
          });
        } catch (addError) {
          setError('Failed to add Polygon network');
        }
      }
    }
  }, []);

  const signAndSendTransaction = useCallback(async (hash: string, cid: string): Promise<string> => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    if (!isPolygonMainnet) {
      throw new Error('Please switch to Polygon network');
    }

    if (!contractAddress) {
      throw new Error('Contract address not available');
    }

    let hashBytes32: string;
    try {
      const normalizedHash = hash.startsWith('0x') ? hash : '0x' + hash;
      const hashBytes = ethers.getBytes(normalizedHash);
      
      if (hashBytes.length !== 32) {
        throw new Error('Must be 32 bytes');
      }
      
      hashBytes32 = ethers.hexlify(hashBytes);
    } catch {
      throw new Error('Invalid hash format - must be 32-byte hexadecimal');
    }

    const ethereum = (window as any).ethereum;
    const provider = new ethers.BrowserProvider(ethereum);
    const signer = await provider.getSigner();

    const contract = new ethers.Contract(contractAddress, TRUTHCHAIN_ABI, signer);

    console.log('📝 Signing transaction...');
    console.log('   Hash:', hashBytes32);
    console.log('   CID:', cid);
    console.log('   Contract:', contractAddress);

    try {
      const tx = await contract.storeRecord(hashBytes32, cid, {
        gasLimit: 300000,
      });

      console.log('⏳ Transaction sent:', tx.hash);
      
      const receipt = await tx.wait();
      
      if (receipt.status === 0) {
        throw new Error('Transaction failed on blockchain');
      }
      
      console.log('✅ Transaction confirmed:', receipt.hash);
      
      return receipt.hash;
    } catch (err: any) {
      console.error('Transaction error:', err);
      
      if (err.code === 4001 || err.code === 'ACTION_REJECTED') {
        throw new Error('Transaction rejected by user');
      }
      if (err.message?.includes('insufficient funds')) {
        throw new Error('Insufficient POL balance for gas fees');
      }
      if (err.message?.includes('Record already exists')) {
        throw new Error('This content has already been verified');
      }
      
      throw new Error(err.shortMessage || err.message || 'Failed to send transaction');
    }
  }, [address, isPolygonMainnet, contractAddress]);

  return (
    <WalletContext.Provider value={{
      address,
      isConnected,
      isConnecting,
      chainId,
      isPolygonMainnet,
      error,
      connect,
      disconnect,
      switchToPolygon,
      signAndSendTransaction,
    }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
