// src/pages/EventDetail.tsx - COMPLETE REAL BLOCKCHAIN VERSION
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
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
} from '@chakra-ui/react';
import { ArrowBackIcon, CalendarIcon, InfoIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { 
  useEventDetails, 
  useEventTiers, 
  useIDRXBalance,
  useEventStats,
  formatIDRXCompact, 
  formatDateTime,
  formatIDRX,
  parseIDRX 
} from '../hooks/useBlockchain';
import { CONTRACT_ADDRESSES } from '../config/wagmi';
import { EventABI, MockIDRXABI } from '../contracts/abis';

const EventDetail: React.FC = () => {
  const { address: eventAddress } = useParams<{ address: string }>();
  const { address: userAddress, isConnected } = useAccount();
  const [selectedTier, setSelectedTier] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  // Validate event address
  const isValidAddress = eventAddress && eventAddress.length === 42 && eventAddress.startsWith('0x');

  // Get event data from blockchain
  const { 
    eventData, 
    tierCount, 
    isLoading: isLoadingEvent, 
    error: eventError 
  } = useEventDetails(eventAddress || '');

  // Get ticket tiers
  const { 
    tiers, 
    isLoading: isLoadingTiers 
  } = useEventTiers(eventAddress || '', Number(tierCount || 0n));

  // Get event statistics
  const { 
    burnStats, 
    revenue, 
    activeTickets 
  } = useEventStats(eventAddress || '');

  // Get user's IDRX balance
  const { data: userBalance } = useIDRXBalance();

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

  // Handle purchase flow
  const handlePurchase = async () => {
    if (!isConnected || !userAddress || !eventData || tiers.length === 0) {
      toast({
        title: 'Cannot purchase',
        description: 'Please connect your wallet and try again',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    const selectedTierData = tiers[selectedTier];
    if (!selectedTierData) {
      toast({
        title: 'Invalid tier selected',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    const totalCost = selectedTierData.price * BigInt(quantity);

    // Check balance
    if (typeof userBalance === 'bigint' && userBalance < totalCost) {
      toast({
        title: 'Insufficient IDRX balance',
        description: `You need ${formatIDRX(totalCost)} IDRX but only have ${formatIDRX(userBalance)} IDRX`,
        status: 'error',
        duration: 5000,
      });
      return;
    }

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

  // Handle approval success - proceed to purchase
  useEffect(() => {
    if (isApproveSuccess && eventData && tiers.length > 0) {
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
  }, [isApproveSuccess, eventData, tiers, selectedTier, quantity, eventAddress, purchaseTicket]);

  // Handle purchase success
  useEffect(() => {
    if (isPurchaseSuccess) {
      toast({
        title: 'Tickets purchased! 🎉',
        description: `${quantity} NFT ticket(s) minted to your wallet`,
        status: 'success',
        duration: 5000,
      });

      onClose();
      
      // Refresh page to show updated data
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  }, [isPurchaseSuccess, quantity, toast, onClose]);

  // Validation checks
  if (!isValidAddress) {
    return (
      <Container maxW="container.xl" py={8}>
        <Alert status="error" borderRadius="lg" mb={4}>
          <AlertIcon />
          Invalid event address format
        </Alert>
        <Button as={Link} to="/" leftIcon={<ArrowBackIcon />}>
          Back to Events
        </Button>
      </Container>
    );
  }

  // Show error state
  if (eventError) {
    console.error('Event loading error:', eventError);
    return (
      <Container maxW="container.xl" py={8}>
        <Alert status="error" borderRadius="lg" mb={4}>
          <AlertIcon />
          <VStack align="start" spacing={2}>
            <Text fontWeight="bold">Failed to load event from blockchain</Text>
            <Text fontSize="sm">Contract: {eventAddress}</Text>
            <Text fontSize="xs">Error: {eventError.message}</Text>
          </VStack>
        </Alert>
        <Button as={Link} to="/" leftIcon={<ArrowBackIcon />}>
          Back to Events
        </Button>
      </Container>
    );
  }

  // Show loading state
  if (isLoadingEvent || !eventData) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack spacing={4}>
          <Spinner size="xl" color="purple.500" />
          <Text>Loading event from blockchain...</Text>
          <Text fontSize="sm" color="gray.500" fontFamily="monospace">
            {eventAddress}
          </Text>
          <Text fontSize="xs" color="gray.400">
            Reading smart contract data...
          </Text>
        </VStack>
      </Container>
    );
  }

  const selectedTierData = tiers[selectedTier] || null;
  const totalPrice = selectedTierData ? selectedTierData.price * BigInt(quantity) : 0n;
  const remainingTickets = selectedTierData ? Number(selectedTierData.available - selectedTierData.sold) : 0;
  const selloutPercentage = selectedTierData ? Number(selectedTierData.sold) / Number(selectedTierData.available) * 100 : 0;
  const maxQuantity = selectedTierData ? Math.min(Number(selectedTierData.maxPerPurchase), remainingTickets) : 0;

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
                src={`https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&h=400&fit=crop&sig=${eventData.address.slice(-6)}`}
                alt={eventData.name}
                height="300px"
                width="100%"
                objectFit="cover"
                borderRadius="xl"
                mb={4}
              />
              
              <HStack mb={2} flexWrap="wrap">
                <Badge colorScheme="green" fontSize="sm" px={3} py={1}>
                  🔗 Real Contract
                </Badge>
                <Badge colorScheme="purple" fontSize="sm" px={3} py={1}>
                  🔥 NFT Burn System
                </Badge>
                <Badge colorScheme="blue" fontSize="sm" px={3} py={1}>
                  {Number(tierCount)} Tier{Number(tierCount) > 1 ? 's' : ''}
                </Badge>
                <Badge colorScheme="orange" fontSize="sm" px={3} py={1}>
                  Anvil Local
                </Badge>
              </HStack>
              
              <Heading size="2xl" mb={4}>
                {eventData.name}
              </Heading>
              
              <Text fontSize="lg" color="gray.600" mb={4}>
                {eventData.description}
              </Text>
              
              <HStack spacing={6} color="gray.500" flexWrap="wrap" mb={4}>
                <HStack>
                  <CalendarIcon />
                  <Text>{formatDateTime(eventData.date)}</Text>
                </HStack>
                <HStack>
                  <Text>📍</Text>
                  <Text>{eventData.venue}</Text>
                </HStack>
                <HStack>
                  <Text>👤</Text>
                  <Text fontFamily="monospace">{eventData.organizer.slice(0, 8)}...{eventData.organizer.slice(-6)}</Text>
                </HStack>
              </HStack>

              <Box p={3} bg="gray.50" borderRadius="lg">
                <Text fontSize="sm" color="gray.600">
                  <Text as="span" fontWeight="bold">Contract:</Text>{' '}
                  <Text as="span" fontFamily="monospace">{eventData.address}</Text>
                </Text>
                <Text fontSize="sm" color="gray.600">
                  <Text as="span" fontWeight="bold">NFT Contract:</Text>{' '}
                  <Text as="span" fontFamily="monospace">{eventData.ticketNFTAddress}</Text>
                </Text>
              </Box>
            </Box>

            {/* Event Statistics */}
            <Box bg="white" p={6} borderRadius="xl" boxShadow="lg">
              <Heading size="md" mb={4}>📊 Event Statistics</Heading>
              <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                <Stat>
                  <StatLabel>Total Sold</StatLabel>
                  <StatNumber color="green.500">{Number(eventData.totalSold)}</StatNumber>
                  <StatHelpText>NFT Tickets</StatHelpText>
                </Stat>
                
                <Stat>
                  <StatLabel>Revenue</StatLabel>
                  <StatNumber color="purple.500">
                    {revenue ? formatIDRXCompact(revenue) : '0'} IDRX
                  </StatNumber>
                  <StatHelpText>Total Earned</StatHelpText>
                </Stat>
                
                <Stat>
                  <StatLabel>Active Tickets</StatLabel>
                  <StatNumber color="blue.500">
                    {activeTickets ? activeTickets.length : 0}
                  </StatNumber>
                  <StatHelpText>Not Burned</StatHelpText>
                </Stat>
                
                <Stat>
                  <StatLabel>Burned</StatLabel>
                  <StatNumber color="red.500">
                    {burnStats ? Number(burnStats[0]) : 0}
                  </StatNumber>
                  <StatHelpText>Used Tickets</StatHelpText>
                </Stat>
              </SimpleGrid>
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
            {isLoadingTiers ? (
              <Box textAlign="center" py={8}>
                <Spinner size="lg" color="purple.500" mb={4} />
                <Text>Loading ticket tiers...</Text>
              </Box>
            ) : tiers.length > 0 ? (
              <Box>
                <Heading size="md" mb={4}>
                  🎫 Choose Your Ticket ({tiers.length} tier{tiers.length > 1 ? 's' : ''})
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
            ) : (
              <Alert status="warning" borderRadius="lg">
                <AlertIcon />
                <Text>No ticket tiers configured for this event</Text>
              </Alert>
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
                      max={maxQuantity}
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
                        <Text color={typeof userBalance === 'bigint' && userBalance >= totalPrice ? "green.600" : "red.600"}>
                          {typeof userBalance === 'bigint' ? formatIDRXCompact(userBalance) : '0'} IDRX
                        </Text>
                      </HStack>
                    )}
                  </VStack>

                  <Button
                    colorScheme="purple"
                    size="lg"
                    onClick={onOpen}
                    isLoading={isPurchaseInProgress}
                    loadingText={
                      isApproving || isConfirmingApprove ? "Approving..." : 
                      isPurchasing || isConfirmingPurchase ? "Purchasing..." : "Processing..."
                    }
                    isDisabled={
                      Boolean(
                        remainingTickets === 0 || 
                        !isConnected || 
                        (typeof userBalance === 'bigint' && userBalance < totalPrice) ||
                        maxQuantity === 0
                      )
                    }
                    borderRadius="lg"
                  >
                    {remainingTickets === 0
                      ? 'Sold Out'
                      : !isConnected
                      ? 'Connect Wallet'
                      : typeof userBalance === 'bigint' && userBalance < totalPrice
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

      {/* Purchase Confirmation Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Purchase</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              {selectedTierData && (
                <Box p={4} bg="purple.50" borderRadius="lg">
                  <Text fontWeight="bold" color="purple.800">
                    {selectedTierData.name}
                  </Text>
                  <Text color="purple.600">
                    {quantity} ticket{quantity > 1 ? 's' : ''} × {formatIDRX(selectedTierData.price)} IDRX
                  </Text>
                  <Text fontSize="lg" fontWeight="bold" color="purple.800">
                    Total: {formatIDRX(totalPrice)} IDRX
                  </Text>
                </Box>
              )}

              <Alert status="info" borderRadius="lg">
                <AlertIcon />
                <VStack align="start" spacing={1}>
                  <Text fontWeight="bold" fontSize="sm">🔥 NFT Burn System:</Text>
                  <Text fontSize="sm">
                    NFT tickets will be minted to your wallet. At the venue, staff will permanently burn your NFTs to grant entry.
                  </Text>
                </VStack>
              </Alert>

              <Alert status="warning" borderRadius="lg">
                <AlertIcon />
                <Text fontSize="sm">
                  This will initiate 2 blockchain transactions:
                  <br />1. Approve IDRX spending
                  <br />2. Purchase and mint NFT tickets
                </Text>
              </Alert>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="purple"
              onClick={handlePurchase}
              isLoading={isPurchaseInProgress}
              loadingText="Processing..."
            >
              🔥 Confirm Purchase
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

interface TierCardProps {
  tier: {
    id: number;
    name: string;
    price: bigint;
    available: bigint;
    sold: bigint;
    maxPerPurchase: bigint;
    description: string;
    isActive: boolean;
  };
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
      opacity={tier.isActive ? 1 : 0.6}
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
            {!tier.isActive && (
              <Badge colorScheme="gray" variant="solid">
                Inactive
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
          <Badge colorScheme={remaining > 0 && tier.isActive ? 'green' : 'red'} variant="solid">
            {remaining > 0 && tier.isActive ? 'Available' : 'Sold Out'}
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