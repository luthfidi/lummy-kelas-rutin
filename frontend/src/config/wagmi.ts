// src/config/wagmi.ts - FIXED VERSION
import { http, createConfig } from 'wagmi';
import { liskSepolia } from 'wagmi/chains';
import { injected, walletConnect } from 'wagmi/connectors';

// Local chain configuration for development
const anvilLocal = {
  id: 31337,
  name: 'Anvil Local',
  network: 'anvil',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    public: { http: ['http://127.0.0.1:8545'] },
    default: { http: ['http://127.0.0.1:8545'] },
  },
  blockExplorers: {
    default: { name: 'Local', url: 'http://localhost:8545' },
  },
} as const;

export const config = createConfig({
  chains: [anvilLocal, liskSepolia],
  connectors: [
    injected(),
    walletConnect({
      projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'd2fcae952e3bd7b4e51fb295883cacdf',
    }),
  ],
  transports: {
    [anvilLocal.id]: http('http://127.0.0.1:8545'),
    [liskSepolia.id]: http('https://rpc.sepolia.lisk.com'),
  },
});

// Contract addresses - UPDATED with your deployed addresses
export const CONTRACT_ADDRESSES = {
  // Local development addresses (from deployment-31337.json)
  AccessControl: '0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0' as `0x${string}`,
  EventFactory: '0x0DCd1Bf9A1b36cE34237eEaFef220932846BCD82' as `0x${string}`,
  IDRX: '0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e' as `0x${string}`,
  
  // Note: Make sure these addresses match what's actually deployed
  // You can verify by checking deployment-31337.json
} as const;

// Test wallet addresses for role-based testing
export const TEST_WALLETS = {
  ADMIN: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266' as `0x${string}`,
  ORGANIZER: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8' as `0x${string}`,
  STAFF: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC' as `0x${string}`,
  BUYER_1: '0x90F79bf6EB2c4f870365E785982E1f101E93b906' as `0x${string}`,
  BUYER_2: '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65' as `0x${string}`,
} as const;

// Network detection helper
export const getChainConfig = () => {
  const chainId = Number(import.meta.env.VITE_CHAIN_ID) || 31337;
  return chainId === 4202 ? liskSepolia : anvilLocal;
};

// Debug function to log contract addresses
export const logContractAddresses = () => {
  console.log('📋 Contract Addresses:');
  console.log('AccessControl:', CONTRACT_ADDRESSES.AccessControl);
  console.log('EventFactory:', CONTRACT_ADDRESSES.EventFactory);
  console.log('IDRX Token:', CONTRACT_ADDRESSES.IDRX);
  console.log('🔗 These should match your deployment-31337.json file');
};