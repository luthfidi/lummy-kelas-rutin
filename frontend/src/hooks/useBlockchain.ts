// src/hooks/useBlockchain.ts
import { useAccount, useReadContract, useReadContracts } from 'wagmi';
import { CONTRACT_ADDRESSES, TEST_WALLETS } from '../config/wagmi';
import { 
  AccessControlABI, 
  EventFactoryABI, 
  EventABI, 
  TicketNFTABI, 
  MockIDRXABI 
} from '../contracts/abis';

// Types
export interface EventData {
  address: string;
  name: string;
  description: string;
  date: bigint;
  venue: string;
  organizer: string;
  totalSold: bigint;
  ticketNFTAddress: string;
  tiers: TicketTier[];
}

export interface TicketTier {
  id: number;
  name: string;
  price: bigint;
  available: bigint;
  sold: bigint;
  maxPerPurchase: bigint;
  description: string;
  isActive: boolean;
}

export interface TicketMetadata {
  tokenId: bigint;
  tierId: bigint;
  originalOwner: string;
  currentOwner: string;
  mintTimestamp: bigint;
  burnTimestamp: bigint;
  burnedBy: string;
  isUsed: boolean;
  eventAddress: string;
}

export type UserRole = 'admin' | 'organizer' | 'staff' | 'buyer' | null;

// Helper function to validate address
function isValidAddress(address: string): boolean {
  return !!address && address.length === 42 && address.startsWith('0x');
}

// Hook: User Role Detection
export function useUserRole(): UserRole {
  const { address } = useAccount();

  const { data: isOrganizer } = useReadContract({
    address: CONTRACT_ADDRESSES.AccessControl,
    abi: AccessControlABI,
    functionName: 'authorizedOrganizers',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  if (!address) return null;
  if (address === TEST_WALLETS.ADMIN) return 'admin';
  if (isOrganizer) return 'organizer';
  if (address === TEST_WALLETS.STAFF) return 'staff';
  return 'buyer';
}

// Hook: IDRX Balance
export function useIDRXBalance(userAddress?: `0x${string}`) {
  const { address } = useAccount();
  const targetAddress = userAddress || address;

  return useReadContract({
    address: CONTRACT_ADDRESSES.IDRX,
    abi: MockIDRXABI,
    functionName: 'balanceOf',
    args: targetAddress ? [targetAddress] : undefined,
    query: { enabled: !!targetAddress },
  });
}

// Hook: Get All Events
export function useEvents() {
  const { data: eventAddresses, ...rest } = useReadContract({
    address: CONTRACT_ADDRESSES.EventFactory,
    abi: EventFactoryABI,
    functionName: 'getEvents',
  });

  // Get event count for verification
  const { data: eventCount } = useReadContract({
    address: CONTRACT_ADDRESSES.EventFactory,
    abi: EventFactoryABI,
    functionName: 'getEventCount',
  });

  return {
    eventAddresses: (eventAddresses as `0x${string}`[]) || [],
    eventCount: eventCount || 0n,
    ...rest,
  };
}

// Hook: Get Event Details
export function useEventDetails(eventAddress: string) {
  const enableQuery = isValidAddress(eventAddress);
  
  const contracts = [
    {
      address: eventAddress as `0x${string}`,
      abi: EventABI,
      functionName: 'getEventDetails',
    },
    {
      address: eventAddress as `0x${string}`,
      abi: EventABI,
      functionName: 'tierCount',
    },
    {
      address: eventAddress as `0x${string}`,
      abi: EventABI,
      functionName: 'getTotalSold',
    },
    {
      address: eventAddress as `0x${string}`,
      abi: EventABI,
      functionName: 'getTicketNFTAddress',
    },
  ];

  const { data, ...rest } = useReadContracts({
    contracts,
    query: { enabled: enableQuery },
  });

  // Parse event details
  let eventData: EventData | null = null;
  if (data && data[0]?.result && data[1]?.result && data[2]?.result && data[3]?.result) {
    const eventDetails = data[0].result as readonly [string, string, bigint, string, string];
    const [name, description, date, venue, organizer] = eventDetails;
    const totalSold = data[2].result as bigint;
    const ticketNFTAddress = data[3].result as string;

    eventData = {
      address: eventAddress,
      name,
      description,
      date,
      venue,
      organizer,
      totalSold,
      ticketNFTAddress,
      tiers: [], // Will be loaded separately
    };
  }

  return {
    eventData,
    tierCount: (data?.[1]?.result as bigint) || 0n,
    ...rest,
  };
}

// Hook: Get Event Tiers
export function useEventTiers(eventAddress: string, tierCountNum: number) {
  const enableQuery = isValidAddress(eventAddress) && tierCountNum > 0;
  
  const contracts = Array.from({ length: tierCountNum }, (_, i) => ({
    address: eventAddress as `0x${string}`,
    abi: EventABI,
    functionName: 'getTierDetails',
    args: [BigInt(i)],
  }));

  const { data, ...rest } = useReadContracts({
    contracts,
    query: { enabled: enableQuery },
  });

  const tiers: TicketTier[] = data?.map((result, index) => {
    if (result.result) {
      // Type assertion for the tier result
      const tierData = result.result as unknown as readonly [string, bigint, bigint, bigint, bigint, string, boolean];
      const [name, price, available, sold, maxPerPurchase, description, isActive] = tierData;
      return {
        id: index,
        name,
        price,
        available,
        sold,
        maxPerPurchase,
        description,
        isActive,
      };
    }
    return {
      id: index,
      name: '',
      price: 0n,
      available: 0n,
      sold: 0n,
      maxPerPurchase: 0n,
      description: '',
      isActive: false,
    };
  }) || [];

  return { tiers, ...rest };
}

// Hook: Get User Tickets (simplified version)
export function useUserTickets(userAddress?: `0x${string}`) {
  const { address } = useAccount();
  const targetAddress = userAddress || address;

  // TODO: Implement proper ticket fetching across all events
  // This would require multiple contract calls to each event's TicketNFT contract

  return {
    tickets: [], // Will be implemented properly
    isLoading: false,
    error: null,
  };
}

// Hook: Get Tickets for Specific Event
export function useEventTickets(eventAddress: string, userAddress?: `0x${string}`) {
  const { address } = useAccount();
  const walletAddress = userAddress || address;
  const enableQuery = isValidAddress(eventAddress);

  // Get TicketNFT address for this event
  const { data: ticketNFTAddress } = useReadContract({
    address: eventAddress as `0x${string}`,
    abi: EventABI,
    functionName: 'getTicketNFTAddress',
    query: { enabled: enableQuery },
  });

  // Get user's ticket balance
  const { data: ticketBalance } = useReadContract({
    address: ticketNFTAddress as `0x${string}`,
    abi: TicketNFTABI,
    functionName: 'balanceOf',
    args: walletAddress ? [walletAddress] : undefined,
    query: { enabled: !!ticketNFTAddress && !!walletAddress },
  });

  // Get ticket IDs (simplified - in reality you'd need to get all token IDs)
  const { data: ticketIds } = useReadContract({
    address: ticketNFTAddress as `0x${string}`,
    abi: TicketNFTABI,
    functionName: 'getTicketsByOwner',
    args: walletAddress ? [walletAddress] : undefined,
    query: { enabled: !!ticketNFTAddress && !!walletAddress },
  });

  return {
    ticketNFTAddress: ticketNFTAddress as string,
    balance: ticketBalance || 0n,
    ticketIds: (ticketIds as bigint[]) || [],
  };
}

// Hook: Get Burn History for Event
export function useBurnHistory(eventAddress: string) {
  const enableQuery = isValidAddress(eventAddress);
  
  return useReadContract({
    address: eventAddress as `0x${string}`,
    abi: EventABI,
    functionName: 'getBurnHistory',
    query: { enabled: enableQuery },
  });
}

// Hook: Check if User is Authorized Organizer
export function useIsAuthorizedOrganizer(userAddress?: `0x${string}`) {
  const { address } = useAccount();
  const walletAddress = userAddress || address;

  return useReadContract({
    address: CONTRACT_ADDRESSES.EventFactory,
    abi: EventFactoryABI,
    functionName: 'isAuthorizedOrganizer',
    args: walletAddress ? [walletAddress] : undefined,
    query: { enabled: !!walletAddress },
  });
}

// Utility Functions
export function formatIDRX(amount: bigint): string {
  return (Number(amount) / 1e18).toFixed(2);
}

export function formatIDRXCompact(amount: bigint): string {
  const value = Number(amount) / 1e18;
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toFixed(0);
}

export function parseIDRX(amount: string): bigint {
  return BigInt(Math.floor(parseFloat(amount) * 1e18));
}

export function formatDate(timestamp: bigint): string {
  return new Date(Number(timestamp) * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateTime(timestamp: bigint): string {
  return new Date(Number(timestamp) * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}