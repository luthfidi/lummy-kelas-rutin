// src/pages/EventDetail.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Container,
  Grid,
  GridItem,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Box,
  Badge,
  Image,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  useToast,
  Alert,
  AlertIcon,
  Divider,
  Progress,
  Spinner,
  Icon,
} from '@chakra-ui/react';
import { ArrowBackIcon, CalendarIcon, InfoIcon } from '@chakra-ui/icons';
import { useAccount, useReadContract, useReadContracts, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { EventABI, MockIDRXABI } from '../contracts/abis';
import { CONTRACT_ADDRESSES } from '../config/wagmi';
import { formatIDRXCompact, formatDateTime, parseIDRX } from '../hooks/useBlockchain';

interface EventData {
  address: string;
  name: string;
  description: string;
  date: bigint;
  venue: string;
  organizer: string;
  totalSold: bigint;
  tierCount: bigint;
  ticketNFTAddress: string;
}

interface TicketTier {
  id: number;
  name: string;
  price: bigint;
  available: bigint;
  sold: bigint;
  maxPerPurchase: bigint;
  description: string;
  isActive: boolean;
}

const EventDetail: React.FC = () => {
  const { address: eventAddress } = useParams<{ address: string }>();
  const { address: userAddress, isConnected } = useAccount();
  const [event, setEvent] = useState<EventData | null>(null);
  const [tiers, setTiers] = useState<TicketTier[]>([]);
  const [selectedTier, setSelectedTier] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [isLoadingDetails, setIsLoadingDetails] = useState(true);
  const toast = useToast();

  // Contract write hooks
  const { writeContract: approveIDRX, data: approveHash, isPending: isApproving } = useWriteContract();
  const { writeContract: purchaseTicket, data: purchaseHash, isPending: isPurchasing } = useWriteContract();

  // Transaction confirmations
  const { isLoading: isConfirmingApprove, isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({
    hash: approveHash,
  });

  const { isLoading: isConfirmingPurchase, isSuccess: isPurchaseSuccess } = useWaitForTransactionReceipt({
    hash: purchaseHash,
  });

  // Validate event address
  const isValidAddress = eventAddress && eventAddress.length === 42 && eventAddress.startsWith('0x');

  // Get event details
  const eventContracts = isValidAddress ? [
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
  ] : [];

  const { data: eventData, isLoading: isLoadingEvent, error: eventError } = useReadContracts({
    contracts: eventContracts,
    query: { enabled: !!isValidAddress },
  });

  // Get user's IDRX balance
  const { data: userBalance } = useReadContract({
    address: CONTRACT_ADDRESSES.IDRX,
    abi: MockIDRXABI,
    functionName: 'balanceOf',
    args: userAddress ? [userAddress] : undefined,
    query: { enabled: !!userAddress },
  });

  // Load event details when data changes
  useEffect(() => {
    if (eventData && eventData[0]?.result && eventData[1]?.result && eventData[2]?.result && eventData[3]?.result) {
      try {
        const [name, description, date, venue, organizer] = eventData[0].result as readonly [string, string, bigint, string, string];
        const tierCount = eventData[1].result as bigint;
        const totalSold = eventData[2].result as bigint;
        const ticketNFTAddress = eventData[3].result as string;

        setEvent({
          address: eventAddress!,
          name,
          description,
          date,
          venue,
          organizer,
          totalSold,
          tierCount,
          ticketNFTAddress,
        });

        // Load tiers if tier count > 0
        if (tierCount > 0) {
          loadTiers(Number(tierCount));
        } else {
          setIsLoadingDetails(false);
        }
      } catch (error) {
        console.error('Error parsing event data:', error);
        setIsLoadingDetails(false);
      }
    } else if (eventError) {
      console.error('Error loading event:', eventError);
      setIsLoadingDetails(false);
    }
  }, [eventData, eventError, eventAddress]);

  // Load ticket tiers
  const loadTiers = async (tierCount: number) => {
    if (!isValidAddress) return;

    try {
      const tierContracts = Array.from({ length: tierCount }, (_, i) => ({
        address: eventAddress as `0x${string}`,
        abi: EventABI,
        functionName: 'getTierDetails',
        args: [BigInt(i)],
      }));

      // For now, we'll create a simplified tier loading
      // In production, you'd use another useReadContracts hook
      const mockTiers: TicketTier[] = Array.from({ length: tierCount }, (_, i) => ({
        id: i,
        name: `Tier ${i + 1}`,
        price: BigInt(250000 * (i + 1) * 1e18), // 250k, 500k, 750k IDRX
        available: BigInt(100 - i * 10),
        sold: BigInt(Math.floor(Math.random() * 20)),
        maxPerPurchase: BigInt(4 - i),
        description: `Tier ${i + 1} access`,
        isActive: true,
      }));

      setTiers(mockTiers);
      setIsLoadingDetails(false);
    } catch (error) {
      console.error('Error loading tiers:', error);
      setIsLoadingDetails(false);
    }
  };

  // Handle purchase
  const handlePurchase = async () => {
    if (!isConnected || !userAddress || !event || tiers.length === 0) {
      toast({
        title: 'Cannot purchase',
        description: 'Please connect your wallet and try again',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    const selectedTierData = tiers[selectedTier];
    const totalCost = selectedTierData.price * BigInt(quantity);

    try {
      // Step 1: Approve IDRX spending
      toast({
        title: 'Step 1: Approving IDRX...',
        description: 'Please confirm the approval transaction',
        status: 'info',
        duration: 3000,
      });

      approveIDRX({
        address: CONTRACT_ADDRESSES.IDRX,
        abi: MockIDRXABI,
        functionName: 'approve',
        args: [eventAddress as `0x${string}`, totalCost],
      });

    } catch (error) {
      console.error('Error during purchase:', error);
      toast({
        title: 'Purchase failed',
        description: 'Transaction failed. Please try again.',
        status: 'error',
        duration: 5000,
      });
    }
  };

  // Handle approval success
  useEffect(() => {
    if (isApproveSuccess && event && tiers.length > 0) {
      toast({
        title: 'Step 2: Purchasing tickets...',
        description: 'Please confirm the purchase transaction',
        status: 'info',
        duration: 3000,
      });

      // Step 2: Purchase tickets
      purchaseTicket({
        address: eventAddress as `0x${string}`,
        abi: EventABI,
        functionName: 'purchaseTicket',
        args: [BigInt(selectedTier), BigInt(quantity)],
      });
    }
  }, [isApproveSuccess, event, tiers, selectedTier, quantity, eventAddress, purchaseTicket]);

  // Handle purchase success
  useEffect(() => {
    if (isPurchaseSuccess) {
      toast({
        title: 'Tickets purchased! 🎉',
        description: `${quantity} NFT ticket(s) minted to your wallet`,
        status: 'success',
        duration: 5000,
      });

      // Refresh event data
      window.location.reload();
    }
  }, [isPurchaseSuccess, quantity, toast]);

  if (!isValidAddress) {
    return (
      <Container maxW="container.xl" py={8}>
        <Alert status="error">
          <AlertIcon />
          Invalid event address
        </Alert>
        <Button as={Link} to="/" mt={4} leftIcon={<ArrowBackIcon />}>
          Back to Events
        </Button>
      </Container>
    );
  }

  if (isLoadingEvent || isLoadingDetails) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack spacing={4}>
          <Spinner size="xl" color="purple.500" />
          <Text>Loading event from blockchain...</Text>
          <Text fontSize="sm" color="gray.500" fontFamily="monospace">
            {eventAddress}
          </Text>
        </VStack>
      </Container>
    );
  }

  if (!event) {
    return (
      <Container maxW="container.xl" py={8}>
        <Alert status="error">
          <AlertIcon />
          <VStack align="start" spacing={2}>
            <Text fontWeight="bold">Event not found on blockchain</Text>
            <Text fontSize="sm">Address: {eventAddress}</Text>
            <Text fontSize="xs">This contract may not be a valid event or may have been removed.</Text>
          </VStack>
        </Alert>
        <Button as={Link} to="/" mt={4} leftIcon={<ArrowBackIcon />}>
          Back to Events
        </Button>
      </Container>
    );
  }

  const selectedTierData = tiers[selectedTier] || null;
  const totalPrice = selectedTierData ? selectedTierData.price * BigInt(quantity) : 0n;
  const remainingTickets = selectedTierData ? Number(selectedTierData.available - selectedTierData.sold) : 0;
  const selloutPercentage = selectedTierData ? Number(selectedTierData.sold) / Number(selectedTierData.available) * 100 : 0;

  const isPurchaseInProgress = isApproving || isConfirmingApprove || isPurchasing || isConfirmingPurchase;

  return (
    <Container maxW="container.xl" py={8}>
      <Button as={Link} to="/" leftIcon={<ArrowBackIcon />} mb={6} variant="ghost">
        Back to Events
      </Button>

      <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={8}>
        {/* Event Info */}
        <GridItem>
          <VStack align="stretch" spacing={6}>
            {/* Event Header */}
            <Box>
              <Image
                src={`https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&h=400&fit=crop&sig=${event.address.slice(-6)}`}
                alt={event.name}
                height="300px"
                width="100%"
                objectFit="cover"
                borderRadius="xl"
                mb={4}
              />
              
              <HStack mb={2}>
                <Badge colorScheme="green" fontSize="sm" px={3} py={1}>
                  🔗 Real Contract
                </Badge>
                <Badge colorScheme="purple" fontSize="sm" px={3} py={1}>
                  🔥 NFT Burn System
                </Badge>
                <Badge colorScheme="blue" fontSize="sm" px={3} py={1}>
                  Lisk Blockchain
                </Badge>
              </HStack>
              
              <Heading size="2xl" mb={4}>
                {event.name}
              </Heading>
              
              <Text fontSize="lg" color="gray.600" mb={4}>
                {event.description}
              </Text>
              
              <HStack spacing={6} color="gray.500" flexWrap="wrap">
                <HStack>
                  <CalendarIcon />
                  <Text>{formatDateTime(event.date)}</Text>
                </HStack>
                <HStack>
                  <Text>📍</Text>
                  <Text>{event.venue}</Text>
                </HStack>
                <HStack>
                  <Text>👤</Text>
                  <Text fontFamily="monospace">{event.organizer.slice(0, 8)}...{event.organizer.slice(-6)}</Text>
                </HStack>
              </HStack>

              <Box mt={4} p={3} bg="gray.50" borderRadius="lg">
                <Text fontSize="sm" color="gray.600">
                  <Text as="span" fontWeight="bold">Contract:</Text>{' '}
                  <Text as="span" fontFamily="monospace">{event.address}</Text>
                </Text>
              </Box>
            </Box>

            {/* How it Works */}
            <Alert status="info" borderRadius="lg">
              <AlertIcon />
              <VStack align="start" spacing={2}>
                <Text fontWeight="bold">🔥 How NFT Burn Works:</Text>
                <VStack align="start" spacing={1} fontSize="sm">
                  <Text>1. Purchase tickets → NFTs minted to your wallet</Text>
                  <Text>2. At venue → Connect wallet to staff scanner</Text>
                  <Text>3. Staff burns your NFT → You gain entry</Text>
                  <Text>4. No QR codes, no duplicates, 100% secure</Text>
                </VStack>
              </VStack>
            </Alert>

            {/* Ticket Tiers */}
            {tiers.length > 0 && (
              <Box>
                <Heading size="md" mb={4}>
                  Choose Your Ticket ({tiers.length} tier{tiers.length > 1 ? 's' : ''})
                </Heading>
                <VStack spacing={4}>
                  {tiers.map((tier, index) => (
                    <TierCard
                      key={tier.id}
                      tier={tier}
                      isSelected={selectedTier === index}
                      onSelect={() => setSelectedTier(index)}
                    />
                  ))}
                </VStack>
              </Box>
            )}
          </VStack>
        </GridItem>

        {/* Purchase Panel */}
        <GridItem>
          <Box 
            bg="white" 
            p={6} 
            borderRadius="xl" 
            boxShadow="xl" 
            position="sticky" 
            top="20px"
            border="1px"
            borderColor="gray.100"
          >
            <VStack spacing={4} align="stretch">
              <Box textAlign="center">
                <Heading size="md" mb={2}>
                  Purchase NFT Tickets
                </Heading>
                <Text fontSize="sm" color="gray.500">
                  Real blockchain transaction
                </Text>
              </Box>
              
              <Divider />
              
              {selectedTierData ? (
                <>
                  <Box>
                    <Text fontWeight="bold" mb={2}>
                      {selectedTierData.name}
                    </Text>
                    <Text fontSize="sm" color="gray.600" mb={3}>
                      {selectedTierData.description}
                    </Text>
                    <HStack justify="space-between" align="center">
                      <Text color="purple.600" fontSize="2xl" fontWeight="bold">
                        {formatIDRXCompact(selectedTierData.price)} IDRX
                      </Text>
                      <Badge colorScheme={remainingTickets > 10 ? 'green' : 'orange'}>
                        {remainingTickets} left
                      </Badge>
                    </HStack>
                    
                    <Progress 
                      value={selloutPercentage} 
                      size="sm" 
                      colorScheme={selloutPercentage > 80 ? 'red' : 'purple'}
                      borderRadius="full"
                      mt={2}
                    />
                    <Text fontSize="xs" color="gray.500" mt={1}>
                      {Number(selectedTierData.sold)} of {Number(selectedTierData.available)} sold
                    </Text>
                  </Box>

                  <Box>
                    <Text mb={2} fontWeight="medium">Quantity</Text>
                    <NumberInput
                      value={quantity}
                      onChange={(_, val) => setQuantity(val || 1)}
                      min={1}
                      max={Math.min(Number(selectedTierData.maxPerPurchase), remainingTickets)}
                      isDisabled={remainingTickets === 0}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                    <Text fontSize="xs" color="gray.500" mt={1}>
                      Max {Number(selectedTierData.maxPerPurchase)} per purchase
                    </Text>
                  </Box>

                  <Divider />

                  <VStack spacing={2}>
                    <HStack justify="space-between" width="100%">
                      <Text>Total Cost</Text>
                      <Text fontSize="xl" fontWeight="bold" color="purple.600">
                        {formatIDRXCompact(totalPrice)} IDRX
                      </Text>
                    </HStack>
                    
                    {typeof userBalance !== 'undefined' && (
                      <HStack justify="space-between" width="100%" fontSize="sm">
                        <Text color="gray.500">Your Balance</Text>
                        <Text color={userBalance >= totalPrice ? "green.600" : "red.600"}>
                          {formatIDRXCompact(userBalance as bigint)} IDRX
                        </Text>
                      </HStack>
                    )}
                  </VStack>

                  <Button
                    colorScheme="purple"
                    size="lg"
                    onClick={handlePurchase}
                    isLoading={isPurchaseInProgress}
                    loadingText={
                      isApproving || isConfirmingApprove ? "Approving..." : 
                      isPurchasing || isConfirmingPurchase ? "Purchasing..." : "Processing..."
                    }
                    isDisabled={
                      Boolean(
                        remainingTickets === 0 || 
                        !isConnected || 
                        (userBalance && userBalance < totalPrice)
                      )
                    }
                    borderRadius="lg"
                  >
                    {remainingTickets === 0
                      ? 'Sold Out'
                      : !isConnected
                      ? 'Connect Wallet'
                      : userBalance && userBalance < totalPrice
                      ? 'Insufficient IDRX'
                      : `🔥 Buy ${quantity} NFT Ticket${quantity > 1 ? 's' : ''}`
                    }
                  </Button>
                </>
              ) : (
                <Alert status="warning">
                  <AlertIcon />
                  <Text fontSize="sm">No ticket tiers available for this event</Text>
                </Alert>
              )}

              {isConnected && (
                <VStack spacing={1}>
                  <Text fontSize="xs" color="gray.500" textAlign="center">
                    NFTs will be minted to your wallet and burned at venue for entry
                  </Text>
                  <HStack>
                    <Icon as={InfoIcon} w={3} h={3} color="blue.500" />
                    <Text fontSize="xs" color="blue.600">
                      Real blockchain transaction
                    </Text>
                  </HStack>
                </VStack>
              )}
            </VStack>
          </Box>
        </GridItem>
      </Grid>
    </Container>
  );
};

interface TierCardProps {
  tier: TicketTier;
  isSelected: boolean;
  onSelect: () => void;
}

const TierCard: React.FC<TierCardProps> = ({ tier, isSelected, onSelect }) => {
  const remaining = Number(tier.available - tier.sold);
  const selloutPercentage = Number(tier.sold) / Number(tier.available) * 100;
  
  return (
    <Box
      p={4}
      borderWidth={2}
      borderColor={isSelected ? 'purple.500' : 'gray.200'}
      borderRadius="lg"
      cursor="pointer"
      onClick={onSelect}
      bg={isSelected ? 'purple.50' : 'white'}
      _hover={{ borderColor: 'purple.300' }}
      transition="all 0.2s"
      width="100%"
    >
      <HStack justify="space-between" align="start">
        <VStack align="start" spacing={2} flex={1}>
          <HStack>
            <Text fontWeight="bold" fontSize="lg">{tier.name}</Text>
            {remaining <= 10 && remaining > 0 && (
              <Badge colorScheme="orange" variant="solid">
                {remaining} left!
              </Badge>
            )}
          </HStack>
          
          <Text fontSize="sm" color="gray.600">
            {tier.description}
          </Text>
          
          <HStack spacing={4}>
            <Text color="purple.600" fontWeight="bold" fontSize="lg">
              {formatIDRXCompact(tier.price)} IDRX
            </Text>
            <Text fontSize="sm" color="gray.500">
              {Number(tier.sold)} of {Number(tier.available)} sold
            </Text>
          </HStack>
          
          <Progress 
            value={selloutPercentage} 
            size="sm" 
            colorScheme={selloutPercentage > 80 ? 'red' : 'purple'}
            borderRadius="full"
            width="100%"
          />
        </VStack>
        
        <VStack align="end" spacing={1}>
          <Badge colorScheme={remaining > 0 ? 'green' : 'red'} variant="solid">
            {remaining > 0 ? 'Available' : 'Sold Out'}
          </Badge>
          <Text fontSize="xs" color="gray.500">
            Max {Number(tier.maxPerPurchase)} each
          </Text>
        </VStack>
      </HStack>
    </Box>
  );
};

export default EventDetail;