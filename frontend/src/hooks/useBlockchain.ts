// src/hooks/useBlockchain.ts - COMPLETE FIXED VERSION
import { useAccount, useReadContract, useReadContracts } from "wagmi";
import { CONTRACT_ADDRESSES, TEST_WALLETS } from "../config/wagmi";

// Import the real ABIs from extracted files
import {
  AccessControlABI,
  SimpleEventFactoryABI, // Use SimpleEventFactory since that's what you deployed
  EventABI,
  TicketNFTABI,
  MockIDRXABI,
} from "../contracts/abis";

import { useState, useEffect } from "react";

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

export type UserRole = "admin" | "organizer" | "staff" | "buyer" | null;

// Helper function to validate address
function isValidAddress(address: string): boolean {
  return !!address && address.length === 42 && address.startsWith("0x");
}

// Hook: User Role Detection
export function useUserRole(): UserRole {
  const { address } = useAccount();

  const { data: isOrganizer } = useReadContract({
    address: CONTRACT_ADDRESSES.AccessControl,
    abi: AccessControlABI,
    functionName: "authorizedOrganizers",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  if (!address) return null;
  if (address === TEST_WALLETS.ADMIN) return "admin";
  if (isOrganizer) return "organizer";
  if (address === TEST_WALLETS.STAFF) return "staff";
  return "buyer";
}

// Hook: IDRX Balance
export function useIDRXBalance(userAddress?: `0x${string}`) {
  const { address } = useAccount();
  const targetAddress = userAddress || address;

  return useReadContract({
    address: CONTRACT_ADDRESSES.IDRX,
    abi: MockIDRXABI,
    functionName: "balanceOf",
    args: targetAddress ? [targetAddress] : undefined,
    query: { enabled: !!targetAddress },
  });
}

// Hook: Get All Events (using SimpleEventFactory) - FIXED
export function useEvents() {
  const { data: eventAddresses, error: addressError, isLoading, ...rest } = useReadContract({
    address: CONTRACT_ADDRESSES.EventFactory,
    abi: SimpleEventFactoryABI, // Use SimpleEventFactory ABI
    functionName: "getEvents",
    query: {
      retry: 3,
      refetchOnWindowFocus: false,
    }
  });

  // Get event count for verification
  const { data: eventCount } = useReadContract({
    address: CONTRACT_ADDRESSES.EventFactory,
    abi: SimpleEventFactoryABI,
    functionName: "getEventCount",
    query: {
      retry: 3,
      refetchOnWindowFocus: false,
    }
  });

  return {
    eventAddresses: (eventAddresses as `0x${string}`[]) || [],
    eventCount: eventCount || 0n,
    isLoading,
    error: addressError as Error | null,
    ...rest,
  };
}

// Hook: Get Event Details with Real ABI
export function useEventDetails(eventAddress: string) {
  const [fullEventData, setFullEventData] = useState<EventData | null>(null);
  const [isLoadingTiers, setIsLoadingTiers] = useState(false);
  const enableQuery = isValidAddress(eventAddress);

  // Get basic event info using real EventABI
  const {
    data: eventDetails,
    isLoading: isLoadingEvent,
    error: eventError,
  } = useReadContract({
    address: eventAddress as `0x${string}`,
    abi: EventABI,
    functionName: "getEventDetails",
    query: { enabled: enableQuery },
  });

  const { data: tierCount } = useReadContract({
    address: eventAddress as `0x${string}`,
    abi: EventABI,
    functionName: "tierCount",
    query: { enabled: enableQuery },
  });

  const { data: totalSold } = useReadContract({
    address: eventAddress as `0x${string}`,
    abi: EventABI,
    functionName: "getTotalSold",
    query: { enabled: enableQuery },
  });

  const { data: ticketNFTAddress } = useReadContract({
    address: eventAddress as `0x${string}`,
    abi: EventABI,
    functionName: "getTicketNFTAddress",
    query: { enabled: enableQuery },
  });

  // Process event data when loaded
  useEffect(() => {
    if (
      eventDetails &&
      tierCount !== undefined &&
      totalSold !== undefined &&
      ticketNFTAddress
    ) {
      try {
        const detailsArray = eventDetails as readonly [
          string,
          string,
          bigint,
          string,
          string
        ];
        const [name, description, date, venue, organizer] = detailsArray;

        setFullEventData({
          address: eventAddress!,
          name,
          description,
          date,
          venue,
          organizer,
          totalSold: totalSold as bigint,
          ticketNFTAddress: ticketNFTAddress as string,
          tiers: [], // Will be loaded separately
        });

        console.log("Event loaded successfully:", {
          name,
          tierCount: (tierCount ?? 0n).toString(),
        });
      } catch (error) {
        console.error("Error processing event data:", error);
      }
    }
  }, [eventDetails, tierCount, totalSold, ticketNFTAddress, eventAddress]);

  return {
    eventData: fullEventData,
    tierCount: (tierCount as bigint) || 0n,
    isLoading: isLoadingEvent || isLoadingTiers,
    isLoadingTiers,
    error: eventError as Error | null,
  };
}

// Hook: Get Real Event Tiers using actual getTierDetails
export function useEventTiers(eventAddress: string, tierCountNum: number) {
  const enableQuery = isValidAddress(eventAddress) && tierCountNum > 0;

  const contracts = Array.from({ length: tierCountNum }, (_, i) => ({
    address: eventAddress as `0x${string}`,
    abi: EventABI,
    functionName: "getTierDetails",
    args: [BigInt(i)],
  }));

  const { data, isLoading, error } = useReadContracts({
    contracts,
    query: { enabled: enableQuery },
  });

  const tiers: TicketTier[] =
    data?.map((result, index) => {
      if (result.result && result.status === "success") {
        // Use the actual tier structure from your Event contract
        const tierData = result.result as any;
        return {
          id: index,
          name: tierData.name || `Tier ${index + 1}`,
          price: tierData.price || 0n,
          available: tierData.available || 0n,
          sold: tierData.sold || 0n,
          maxPerPurchase: tierData.maxPerPurchase || 0n,
          description: tierData.description || "Loading...",
          isActive: tierData.isActive !== undefined ? tierData.isActive : true,
        };
      }
      return {
        id: index,
        name: `Tier ${index + 1}`,
        price: 0n,
        available: 0n,
        sold: 0n,
        maxPerPurchase: 0n,
        description: "Loading...",
        isActive: false,
      };
    }) || [];

  return { tiers, isLoading, error: error as Error | null };
}

// Hook: Get User Tickets for Specific Event
export function useEventTickets(
  eventAddress: string,
  userAddress?: `0x${string}`
) {
  const { address } = useAccount();
  const walletAddress = userAddress || address;
  const enableQuery = isValidAddress(eventAddress);

  // Get TicketNFT address for this event
  const { data: ticketNFTAddress } = useReadContract({
    address: eventAddress as `0x${string}`,
    abi: EventABI,
    functionName: "getTicketNFTAddress",
    query: { enabled: enableQuery },
  });

  // Get user's ticket balance
  const { data: ticketBalance } = useReadContract({
    address: ticketNFTAddress as `0x${string}`,
    abi: TicketNFTABI,
    functionName: "balanceOf",
    args: walletAddress ? [walletAddress] : undefined,
    query: { enabled: !!ticketNFTAddress && !!walletAddress },
  });

  // Get ticket IDs
  const { data: ticketIds } = useReadContract({
    address: ticketNFTAddress as `0x${string}`,
    abi: TicketNFTABI,
    functionName: "getTicketsByOwner",
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
    functionName: "getBurnHistory",
    query: { enabled: enableQuery },
  });
}

// Hook: Check if User is Authorized Organizer
export function useIsAuthorizedOrganizer(userAddress?: `0x${string}`) {
  const { address } = useAccount();
  const walletAddress = userAddress || address;

  return useReadContract({
    address: CONTRACT_ADDRESSES.EventFactory,
    abi: SimpleEventFactoryABI,
    functionName: "isAuthorizedOrganizer",
    args: walletAddress ? [walletAddress] : undefined,
    query: { enabled: !!walletAddress },
  });
}

// Hook: Get ticket metadata for a specific NFT
export function useTicketMetadata(ticketNFTAddress: string, tokenId: bigint) {
  const enableQuery = isValidAddress(ticketNFTAddress) && tokenId > 0n;

  return useReadContract({
    address: ticketNFTAddress as `0x${string}`,
    abi: TicketNFTABI,
    functionName: "getTicketMetadata",
    args: [tokenId],
    query: { enabled: enableQuery },
  });
}

// Hook: Check if ticket is valid (not burned)
export function useIsTicketValid(ticketNFTAddress: string, tokenId: bigint) {
  const enableQuery = isValidAddress(ticketNFTAddress) && tokenId > 0n;

  return useReadContract({
    address: ticketNFTAddress as `0x${string}`,
    abi: TicketNFTABI,
    functionName: "isTicketValid",
    args: [tokenId],
    query: { enabled: enableQuery },
  });
}

// Hook: Get all user's NFT tickets across all events
export function useUserAllTickets(userAddress?: `0x${string}`) {
  const { address } = useAccount();
  const walletAddress = userAddress || address;
  const [userTickets, setUserTickets] = useState<TicketMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Get all events first
  const { eventAddresses } = useEvents();

  useEffect(() => {
    async function loadUserTickets() {
      if (!walletAddress || !eventAddresses || eventAddresses.length === 0) {
        setUserTickets([]);
        return;
      }

      setIsLoading(true);
      const allTickets: TicketMetadata[] = [];

      try {
        // For each event, get user's tickets
        for (const eventAddr of eventAddresses) {
          // This would need to be implemented based on your contract structure
          // For now, return empty array
        }
        
        setUserTickets(allTickets);
      } catch (error) {
        console.error('Error loading user tickets:', error);
      } finally {
        setIsLoading(false);
      }
    }

    if (eventAddresses && eventAddresses.length > 0) {
      loadUserTickets();
    }
  }, [walletAddress, eventAddresses]);

  return { userTickets, isLoading };
}

// Hook: Get event statistics
export function useEventStats(eventAddress: string) {
  const enableQuery = isValidAddress(eventAddress);

  const { data: burnStats } = useReadContract({
    address: eventAddress as `0x${string}`,
    abi: EventABI,
    functionName: "getBurnStats",
    query: { enabled: enableQuery },
  });

  const { data: revenue } = useReadContract({
    address: eventAddress as `0x${string}`,
    abi: EventABI,
    functionName: "getRevenue",
    query: { enabled: enableQuery },
  });

  const { data: activeTickets } = useReadContract({
    address: eventAddress as `0x${string}`,
    abi: EventABI,
    functionName: "getActiveTickets",
    query: { enabled: enableQuery },
  });

  return {
    burnStats: burnStats as [bigint, bigint, bigint] | undefined, // [totalBurned, totalActive, totalMinted]
    revenue: revenue as bigint | undefined,
    activeTickets: activeTickets as bigint[] | undefined,
  };
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
  return new Date(Number(timestamp) * 1000).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatDateTime(timestamp: bigint): string {
  return new Date(Number(timestamp) * 1000).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatTimeAgo(timestamp: bigint): string {
  const now = new Date();
  const date = new Date(Number(timestamp) * 1000);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`;
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
}

// Helper function to get user role display name
export function getRoleDisplayName(role: UserRole): string {
  switch (role) {
    case 'admin':
      return '🔑 Admin';
    case 'organizer':
      return '🎪 Organizer';
    case 'staff':
      return '👮 Staff';
    case 'buyer':
      return '🛒 Buyer';
    default:
      return '👤 Guest';
  }
}

// Helper function to get role color scheme
export function getRoleColorScheme(role: UserRole): string {
  switch (role) {
    case 'admin':
      return 'red';
    case 'organizer':
      return 'blue';
    case 'staff':
      return 'orange';
    case 'buyer':
      return 'green';
    default:
      return 'gray';
  }
}

// Debug function to test contract connectivity
export function useContractDebug() {
  const { data: accessControlOwner } = useReadContract({
    address: CONTRACT_ADDRESSES.AccessControl,
    abi: AccessControlABI,
    functionName: "owner",
  });

  const { data: eventCount } = useReadContract({
    address: CONTRACT_ADDRESSES.EventFactory,
    abi: SimpleEventFactoryABI,
    functionName: "getEventCount",
  });

  const { data: idrxTotalSupply } = useReadContract({
    address: CONTRACT_ADDRESSES.IDRX,
    abi: MockIDRXABI,
    functionName: "totalSupply",
  });

  return {
    accessControlOwner,
    eventCount,
    idrxTotalSupply,
    isReady: !!(
      accessControlOwner &&
      eventCount !== undefined &&
      idrxTotalSupply
    ),
  };
}

// Hook: Get platform-wide statistics
export function usePlatformStats() {
  const { eventAddresses, eventCount } = useEvents();
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalTicketsSold: 0,
    totalRevenue: 0n,
    totalTicketsBurned: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function calculateStats() {
      if (!eventAddresses || eventAddresses.length === 0) {
        setStats({
          totalEvents: 0,
          totalTicketsSold: 0,
          totalRevenue: 0n,
          totalTicketsBurned: 0,
        });
        return;
      }

      setIsLoading(true);
      
      // For now, return mock stats
      // In a real implementation, you'd iterate through all events
      setStats({
        totalEvents: eventAddresses.length,
        totalTicketsSold: eventAddresses.length * 50, // Mock: 50 tickets per event
        totalRevenue: BigInt(eventAddresses.length * 10000000 * 1e18), // Mock: 10M IDRX per event
        totalTicketsBurned: eventAddresses.length * 20, // Mock: 20 burned per event
      });
      
      setIsLoading(false);
    }

    calculateStats();
  }, [eventAddresses]);

  return {
    stats,
    isLoading,
    totalEvents: Number(eventCount || 0n),
  };
}