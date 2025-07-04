// src/config/wagmi.ts
import { http, createConfig } from 'wagmi';
import { liskSepolia } from 'wagmi/chains';
import { injected, walletConnect } from 'wagmi/connectors';

export const config = createConfig({
  chains: [liskSepolia],
  connectors: [
    injected(),
    walletConnect({
      projectId: 'd2fcae952e3bd7b4e51fb295883cacdf',
    }),
  ],
  transports: {
    [liskSepolia.id]: http('https://rpc.sepolia.lisk.com'),
  },
});

// Contract addresses (akan diupdate setelah deploy)
export const CONTRACT_ADDRESSES = {
  EventFactory: '0x0000000000000000000000000000000000000000', // Update after deploy
  IDRX: '0xD63029C1a3dA68b51c67c6D1DeC3DEe50D681661', // IDRX on Lisk Sepolia
} as const;