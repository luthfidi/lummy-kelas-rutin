// src/config/wagmi.ts
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

// Contract addresses - update these with your deployed addresses
export const CONTRACT_ADDRESSES = {
  // Local development addresses (from deployment-31337.json)
  AccessControl: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512' as `0x${string}`,
  EventFactory: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0' as `0x${string}`,
  IDRX: '0x5FbDB2315678afecb367f032d93F642f64180aa3' as `0x${string}`,
  
  // Lisk Sepolia addresses (update after testnet deployment)
  // AccessControl: '0x...' as `0x${string}`,
  // EventFactory: '0x...' as `0x${string}`,
  // IDRX: '0xD63029C1a3dA68b51c67c6D1DeC3DEe50D681661' as `0x${string}`,
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