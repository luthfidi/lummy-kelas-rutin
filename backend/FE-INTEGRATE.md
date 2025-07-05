# 🔥 Lummy Burn NFT - Frontend Integration Guide

**Complete guide for integrating Lummy Burn NFT smart contracts with React frontend.**

## 📋 Table of Contents

- [Quick Start](#-quick-start)
- [Contract Addresses](#-contract-addresses)
- [Environment Setup](#-environment-setup)
- [Smart Contract Integration](#-smart-contract-integration)
- [Wallet Configuration](#-wallet-configuration)
- [Component Implementation](#-component-implementation)
- [NFT Burn Workflow](#-nft-burn-workflow)
- [Testing Guide](#-testing-guide)
- [Troubleshooting](#-troubleshooting)
- [Production Deployment](#-production-deployment)

---

## 🚀 Quick Start

### Prerequisites
- ✅ Smart contracts deployed (see backend README)
- ✅ Frontend React app with Wagmi + Viem
- ✅ 5 test wallets configured
- ✅ Local Anvil node running

### Integration Checklist
- [ ] Update contract addresses
- [ ] Configure environment variables
- [ ] Replace mock data with blockchain calls
- [ ] Test role-based functionality
- [ ] Verify NFT burn mechanism

---

## 📍 Contract Addresses

### Local Development (Anvil)
```typescript
// src/config/contracts.ts
export const CONTRACT_ADDRESSES = {
  // Update these with your deployed addresses
  AccessControl: '0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6',
  EventFactory: '0x8A791620dd6260079BF849Dc5567aDC3F2FdC318', 
  MockIDRX: '0xa513E6E4b8f2a923D98304ec87F64353C4D5C853',
} as const;

export const CHAIN_CONFIG = {
  chainId: 31337, // Anvil local
  rpcUrl: 'http://127.0.0.1:8545',
  blockExplorer: 'http://localhost:8545', // Local only
} as const;
```

### Lisk Sepolia (Testnet)
```typescript
export const CONTRACT_ADDRESSES_TESTNET = {
  AccessControl: '0x...', // Update after testnet deployment
  EventFactory: '0x...',  // Update after testnet deployment
  IDRX: '0xD63029C1a3dA68b51c67c6D1DeC3DEe50D681661', // Real IDRX
} as const;

export const LISK_SEPOLIA_CONFIG = {
  chainId: 4202,
  rpcUrl: 'https://rpc.sepolia.lisk.com',
  blockExplorer: 'https://sepolia-blockscout.lisk.com',
} as const;
```

---

## 🔧 Environment Setup

### 1. Create/Update `.env` file
```bash
# Frontend Environment Variables

# Contract Addresses (Update with deployed addresses)
VITE_ACCESS_CONTROL_ADDRESS=0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6
VITE_EVENT_FACTORY_ADDRESS=0x8A791620dd6260079BF849Dc5567aDC3F2FdC318
VITE_IDRX_TOKEN_ADDRESS=0xa513E6E4b8f2a923D98304ec87F64353C4D5C853

# Network Configuration
VITE_CHAIN_ID=31337
VITE_RPC_URL=http://127.0.0.1:8545

# WalletConnect Project ID (Get from https://cloud.walletconnect.com)
VITE_WALLETCONNECT_PROJECT_ID=your_project_id_here

# Test Wallet Addresses (Role-based)
VITE_ADMIN_ADDRESS=0x580B01f8CDf7606723c3BE0dD2AaD058F5aECa3d
VITE_ORGANIZER_ADDRESS=0x5B38Da6a701c568545dCfcB03FcB875f56beddC4
VITE_STAFF_ADDRESS=0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2
VITE_BUYER1_ADDRESS=0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db
VITE_BUYER2_ADDRESS=0x78731D3Ca6b7E34aC0F824c42a7cC18A495cabaB

# Anvil Private Keys (Local testing only - NEVER use in production)
VITE_ANVIL_PRIVATE_KEY_0=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
VITE_ANVIL_PRIVATE_KEY_1=0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
```

### 2. Update Wagmi Configuration
```typescript
// src/config/wagmi.ts
import { http, createConfig } from 'wagmi';
import { localhost } from 'wagmi/chains';
import { injected, walletConnect } from 'wagmi/connectors';

// Local chain configuration
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
  chains: [anvilLocal],
  connectors: [
    injected(),
    walletConnect({
      projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID,
    }),
  ],
  transports: {
    [anvilLocal.id]: http('http://127.0.0.1:8545'),
  },
});

// Contract addresses from environment
export const CONTRACT_ADDRESSES = {
  AccessControl: import.meta.env.VITE_ACCESS_CONTROL_ADDRESS,
  EventFactory: import.meta.env.VITE_EVENT_FACTORY_ADDRESS,
  IDRX: import.meta.env.VITE_IDRX_TOKEN_ADDRESS,
} as const;
```

---

## 🔗 Smart Contract Integration

### 1. Contract ABIs
Create ABI files in `src/contracts/abis/`:

```typescript
// src/contracts/abis/SimpleEventFactory.ts
export const SimpleEventFactoryABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "_accessControl", "type": "address" },
      { "internalType": "address", "name": "_idrxToken", "type": "address" },
      { "internalType": "address", "name": "", "type": "address" }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      {
        "components": [
          { "internalType": "string", "name": "name", "type": "string" },
          { "internalType": "string", "name": "description", "type": "string" },
          { "internalType": "uint256", "name": "date", "type": "uint256" },
          { "internalType": "string", "name": "venue", "type": "string" },
          { "internalType": "string", "name": "ipfsMetadata", "type": "string" }
        ],
        "internalType": "struct IEventFactory.EventParams",
        "name": "params",
        "type": "tuple"
      }
    ],
    "name": "createEvent",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getEvents",
    "outputs": [{ "internalType": "address[]", "name": "", "type": "address[]" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getEventCount",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "organizer", "type": "address" }],
    "name": "isAuthorizedOrganizer",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// src/contracts/abis/Event.ts - Add Event contract ABI
// src/contracts/abis/TicketNFT.ts - Add TicketNFT contract ABI
// src/contracts/abis/AccessControl.ts - Add AccessControl contract ABI
// src/contracts/abis/MockIDRX.ts - Add MockIDRX contract ABI
```

### 2. Replace Mock Data with Blockchain Calls

#### Homepage - Event Discovery
```typescript
// src/pages/HomePage.tsx
import { useReadContract } from 'wagmi';
import { SimpleEventFactoryABI } from '../contracts/abis/SimpleEventFactory';
import { CONTRACT_ADDRESSES } from '../config/wagmi';

const HomePage: React.FC = () => {
  // Replace mockEvents with real blockchain call
  const { data: eventAddresses, isLoading } = useReadContract({
    address: CONTRACT_ADDRESSES.EventFactory as `0x${string}`,
    abi: SimpleEventFactoryABI,
    functionName: 'getEvents',
  });

  const { data: eventCount } = useReadContract({
    address: CONTRACT_ADDRESSES.EventFactory as `0x${string}`,
    abi: SimpleEventFactoryABI,
    functionName: 'getEventCount',
  });

  // Fetch individual event details for each address
  const events = useEventDetails(eventAddresses || []);

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <Container>
      <Text>Total Events: {eventCount?.toString()}</Text>
      {events.map((event) => (
        <EventCard key={event.address} event={event} />
      ))}
    </Container>
  );
};
```

#### Event Creation
```typescript
// src/pages/CreateEvent.tsx
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';

const CreateEvent: React.FC = () => {
  const { writeContract, data: hash } = useWriteContract();
  
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({
    hash,
  });

  const handleCreateEvent = async (eventData: EventFormData) => {
    writeContract({
      address: CONTRACT_ADDRESSES.EventFactory as `0x${string}`,
      abi: SimpleEventFactoryABI,
      functionName: 'createEvent',
      args: [{
        name: eventData.name,
        description: eventData.description,
        date: BigInt(Math.floor(new Date(eventData.date).getTime() / 1000)),
        venue: eventData.venue,
        ipfsMetadata: eventData.ipfsMetadata || "",
      }],
    });
  };

  return (
    <form onSubmit={handleCreateEvent}>
      {/* Event form fields */}
      <Button 
        type="submit" 
        isLoading={isConfirming}
        loadingText="Creating Event..."
      >
        🚀 Create Event
      </Button>
    </form>
  );
};
```

#### Ticket Purchase
```typescript
// src/pages/EventDetail.tsx
import { useWriteContract, useReadContract } from 'wagmi';
import { EventABI } from '../contracts/abis/Event';
import { MockIDRXABI } from '../contracts/abis/MockIDRX';

const EventDetail: React.FC = () => {
  const { address: eventAddress } = useParams();
  const { writeContract } = useWriteContract();

  // Read ticket tiers
  const { data: tierCount } = useReadContract({
    address: eventAddress as `0x${string}`,
    abi: EventABI,
    functionName: 'tierCount',
  });

  const handlePurchaseTicket = async (tierId: number, quantity: number) => {
    const tier = await readContract({
      address: eventAddress as `0x${string}`,
      abi: EventABI,
      functionName: 'getTierDetails',
      args: [BigInt(tierId)],
    });

    const totalCost = tier.price * BigInt(quantity);

    // 1. Approve IDRX spending
    await writeContract({
      address: CONTRACT_ADDRESSES.IDRX as `0x${string}`,
      abi: MockIDRXABI,
      functionName: 'approve',
      args: [eventAddress as `0x${string}`, totalCost],
    });

    // 2. Purchase tickets
    await writeContract({
      address: eventAddress as `0x${string}`,
      abi: EventABI,
      functionName: 'purchaseTicket',
      args: [BigInt(tierId), BigInt(quantity)],
    });
  };

  return (
    <Box>
      {/* Event details and purchase interface */}
    </Box>
  );
};
```

#### NFT Burn at Venue
```typescript
// src/pages/VenueScanner.tsx
import { useWriteContract, useAccount } from 'wagmi';

const VenueScanner: React.FC = () => {
  const { address } = useAccount();
  const { writeContract } = useWriteContract();

  const handleBurnTicket = async (tokenId: number) => {
    if (!eventAddress) return;

    writeContract({
      address: eventAddress as `0x${string}`,
      abi: EventABI,
      functionName: 'checkInAndBurn',
      args: [BigInt(tokenId)],
    });
  };

  const scanAttendeeWallet = async (attendeeAddress: string) => {
    // Get attendee's NFT tickets for this event
    const tickets = await readContract({
      address: ticketNFTAddress as `0x${string}`,
      abi: TicketNFTABI,
      functionName: 'getTicketsByOwner',
      args: [attendeeAddress as `0x${string}`],
    });

    return tickets.filter(async (tokenId) => {
      // Verify ticket belongs to this event and is valid
      const isValid = await readContract({
        address: ticketNFTAddress as `0x${string}`,
        abi: TicketNFTABI,
        functionName: 'isTicketValid',
        args: [tokenId],
      });
      return isValid;
    });
  };

  return (
    <VStack>
      <Input 
        placeholder="Scan attendee wallet address"
        onChange={(e) => scanAttendeeWallet(e.target.value)}
      />
      {/* Ticket burning interface */}
    </VStack>
  );
};
```

---

## 👛 Wallet Configuration

### 1. Role-Based Wallet Detection
```typescript
// src/hooks/useUserRole.ts
import { useAccount, useReadContract } from 'wagmi';
import { AccessControlABI } from '../contracts/abis/AccessControl';

export type UserRole = 'admin' | 'organizer' | 'staff' | 'buyer' | null;

export const useUserRole = (): UserRole => {
  const { address } = useAccount();

  const { data: isOrganizer } = useReadContract({
    address: CONTRACT_ADDRESSES.AccessControl as `0x${string}`,
    abi: AccessControlABI,
    functionName: 'authorizedOrganizers',
    args: address ? [address] : undefined,
    enabled: !!address,
  });

  // Check if staff for any organizer
  const { data: staffOrganizer } = useReadContract({
    address: CONTRACT_ADDRESSES.AccessControl as `0x${string}`,
    abi: AccessControlABI,
    functionName: 'getStaffOrganizer',
    args: address ? [address] : undefined,
    enabled: !!address,
  });

  // Admin check (contract owner)
  const isAdmin = address === import.meta.env.VITE_ADMIN_ADDRESS;

  if (!address) return null;
  if (isAdmin) return 'admin';
  if (isOrganizer) return 'organizer';
  if (staffOrganizer && staffOrganizer !== '0x0000000000000000000000000000000000000000') return 'staff';
  return 'buyer';
};
```

### 2. Role-Based Navigation
```typescript
// src/components/Navbar.tsx
import { useUserRole } from '../hooks/useUserRole';

const Navbar: React.FC = () => {
  const role = useUserRole();

  return (
    <HStack>
      <Link to="/">🏠 Events</Link>
      <Link to="/tickets">🎫 My Tickets</Link>
      
      {role === 'organizer' && (
        <Link to="/create">➕ Create Event</Link>
      )}
      
      {role === 'staff' && (
        <Link to="/scanner">🔍 Venue Scanner</Link>
      )}
      
      {role === 'admin' && (
        <Link to="/admin">🔑 Admin Panel</Link>
      )}
    </HStack>
  );
};
```

---

## 🔥 NFT Burn Workflow

### 1. Complete Burn Process Implementation
```typescript
// src/components/BurnTicketFlow.tsx
import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';

interface BurnTicketFlowProps {
  eventAddress: string;
  tokenId: number;
  attendeeAddress: string;
}

const BurnTicketFlow: React.FC<BurnTicketFlowProps> = ({
  eventAddress,
  tokenId,
  attendeeAddress,
}) => {
  const [isConfirming, setIsConfirming] = useState(false);
  const { writeContract, data: hash } = useWriteContract();

  const { isSuccess } = useWaitForTransactionReceipt({
    hash,
    onSuccess: () => {
      setIsConfirming(false);
      // Show success notification
      toast({
        title: '🔥 Ticket Burned Successfully!',
        description: `NFT ${tokenId} has been permanently destroyed. Attendee can enter.`,
        status: 'success',
      });
    },
  });

  const handleBurnTicket = async () => {
    setIsConfirming(true);
    
    writeContract({
      address: eventAddress as `0x${string}`,
      abi: EventABI,
      functionName: 'checkInAndBurn',
      args: [BigInt(tokenId)],
    });
  };

  return (
    <Alert status="warning" borderRadius="lg">
      <AlertIcon />
      <VStack align="start" spacing={4}>
        <Text fontWeight="bold">⚠️ Confirm NFT Burn</Text>
        <Text fontSize="sm">
          This will permanently destroy NFT #{tokenId} owned by {attendeeAddress}.
          This action cannot be undone!
        </Text>
        
        <HStack>
          <Button
            colorScheme="red"
            onClick={handleBurnTicket}
            isLoading={isConfirming}
            loadingText="Burning..."
            leftIcon={<Text>🔥</Text>}
          >
            Burn NFT & Grant Entry
          </Button>
        </HStack>
      </VStack>
    </Alert>
  );
};
```

### 2. Real-time Burn History
```typescript
// src/hooks/useBurnHistory.ts
import { useReadContract, useWatchContractEvent } from 'wagmi';
import { EventABI } from '../contracts/abis/Event';

export const useBurnHistory = (eventAddress: string) => {
  const { data: burnHistory, refetch } = useReadContract({
    address: eventAddress as `0x${string}`,
    abi: EventABI,
    functionName: 'getBurnHistory',
  });

  // Watch for new burn events
  useWatchContractEvent({
    address: eventAddress as `0x${string}`,
    abi: EventABI,
    eventName: 'TicketBurned',
    onLogs: () => {
      refetch(); // Refresh burn history when new burn occurs
    },
  });

  return { burnHistory, refetch };
};
```

---

## 🧪 Testing Guide

### 1. Local Testing Workflow
```bash
# Terminal 1: Start Anvil
make anvil

# Terminal 2: Deploy contracts
make deploy-local

# Terminal 3: Start frontend
cd frontend
npm run dev
```

### 2. Test User Scenarios

#### Admin Testing
```typescript
// Connect with admin wallet
// Test: Add organizer functionality
// Expected: Organizer management interface visible
```

#### Organizer Testing
```typescript
// Connect with organizer wallet (0x5B38...ddC4)
// Test: Create event, add staff, manage tiers
// Expected: Event creation successful, staff can access scanner
```

#### Buyer Testing
```typescript
// Connect with buyer wallet (0x4B20...C02db)
// Test: Purchase tickets, transfer NFTs
// Expected: NFTs minted to wallet, transfer functionality works
```

#### Staff Testing
```typescript
// Connect with staff wallet (0xAb84...5cb2)
// Test: Scan attendee wallets, burn tickets
// Expected: Can access scanner, burn tickets successfully
```

### 3. Integration Test Checklist
- [ ] **Wallet Connection**: All 5 test wallets connect successfully
- [ ] **Role Detection**: UI shows correct features based on wallet role
- [ ] **Event Creation**: Organizer can create events with multiple tiers
- [ ] **Ticket Purchase**: Buyers can purchase NFT tickets with IDRX
- [ ] **NFT Transfer**: Tickets can be transferred between wallets
- [ ] **Staff Management**: Organizer can add/remove staff for events
- [ ] **Venue Scanning**: Staff can scan and burn attendee tickets
- [ ] **Real-time Updates**: UI updates when blockchain state changes
- [ ] **Error Handling**: Proper error messages for failed transactions

---

## 🐛 Troubleshooting

### Common Issues

#### 1. Contract Not Found
```
Error: Contract not found at address 0x...
```
**Solution:**
- Verify contract addresses in `.env` match deployment
- Ensure Anvil is running on correct port
- Check network configuration in wagmi.ts

#### 2. Transaction Reverts
```
Error: Transaction reverted
```
**Solutions:**
- Check user has sufficient IDRX balance
- Verify user has approved IDRX spending
- Ensure user has correct role permissions
- Check ticket availability before purchase

#### 3. Role Detection Issues
```
User role shows as 'buyer' when should be 'organizer'
```
**Solution:**
- Verify wallet address matches deployed organizer address
- Check AccessControl contract permissions
- Ensure useUserRole hook is reading correct contract

#### 4. NFT Burn Fails
```
Error: Not authorized to burn ticket
```
**Solutions:**
- Verify staff is authorized for the specific event
- Check ticket exists and is not already burned
- Ensure staff is connected with correct wallet

### Debug Tools

#### 1. Contract State Verification
```bash
# Check IDRX balance
cast call $IDRX_ADDRESS "balanceOf(address)" $WALLET_ADDRESS --rpc-url http://127.0.0.1:8545

# Check organizer status
cast call $ACCESS_CONTROL_ADDRESS "authorizedOrganizers(address)" $ORGANIZER_ADDRESS --rpc-url http://127.0.0.1:8545

# Check event count
cast call $EVENT_FACTORY_ADDRESS "getEventCount()" --rpc-url http://127.0.0.1:8545
```

#### 2. Frontend Debug Component
```typescript
// src/components/DebugPanel.tsx (Development only)
const DebugPanel: React.FC = () => {
  const { address } = useAccount();
  const role = useUserRole();

  return (
    <Box p={4} bg="gray.100" borderRadius="md">
      <Text fontWeight="bold">Debug Info:</Text>
      <Text>Connected: {address}</Text>
      <Text>Role: {role}</Text>
      <Text>Chain: {useChainId()}</Text>
      {/* Add more debug info as needed */}
    </Box>
  );
};
```

---

## 🚀 Production Deployment

### 1. Testnet Deployment
```bash
# Deploy to Lisk Sepolia
make deploy-lisk

# Update frontend environment
cp .env.example .env.production
# Update with testnet addresses
```

### 2. Frontend Production Config
```typescript
// src/config/production.ts
export const PRODUCTION_CONFIG = {
  contracts: {
    AccessControl: '0x...', // Testnet addresses
    EventFactory: '0x...',
    IDRX: '0xD63029C1a3dA68b51c67c6D1DeC3DEe50D681661', // Real IDRX
  },
  chain: {
    chainId: 4202,
    rpcUrl: 'https://rpc.sepolia.lisk.com',
  },
};
```

### 3. Environment-Specific Builds
```bash
# Development build (Anvil)
npm run build:dev

# Testnet build (Lisk Sepolia)
npm run build:testnet

# Production build (Mainnet)
npm run build:prod
```

---

## 📚 Additional Resources

### Contract Documentation
- [Smart Contract README](../README.md)
- [Contract Architecture](../docs/architecture.md)
- [Testing Guide](../docs/testing.md)

### Frontend Resources
- [Wagmi Documentation](https://wagmi.sh/)
- [Viem Documentation](https://viem.sh/)
- [Chakra UI Components](https://chakra-ui.com/)

### Lisk Network
- [Lisk Sepolia Testnet](https://sepolia-blockscout.lisk.com)
- [Lisk Bridge](https://bridge.lisk.com/)
- [IDRX Token Info](https://sepolia-blockscout.lisk.com/token/0xD63029C1a3dA68b51c67c6D1DeC3DEe50D681661)

---

## 🆘 Support

### For Integration Issues:
1. **Check this guide** for common solutions
2. **Verify contract deployment** status
3. **Test with Anvil local** before testnet
4. **Use debug tools** to inspect state
5. **Open GitHub issue** with detailed error logs

### Quick Verification Commands:
```bash
# Check contract deployment status
make check-balances

# Verify wallet roles
cast call $ACCESS_CONTROL_ADDRESS "authorizedOrganizers(address)" $ORGANIZER_ADDRESS

# Test event creation
forge script script/CreateTestEvent.s.sol --rpc-url http://127.0.0.1:8545
```

---

**🔥 Happy Building! The NFT Burn revolution starts with your integration!** 🚀

*Last updated: [Current Date]*
*Contract Version: v1.0.0*
*Frontend Compatibility: React 18+, Wagmi 2.0+*