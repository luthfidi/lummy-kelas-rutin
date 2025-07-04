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
import { getEventByAddress, formatPrice, formatDateTime, type MockEvent, type MockTier } from '../data/mockData';

const EventDetail: React.FC = () => {
  const { address: eventAddress } = useParams<{ address: string }>();
  const [event, setEvent] = useState<MockEvent | null>(null);
  const [selectedTier, setSelectedTier] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const toast = useToast();

  useEffect(() => {
    // Simulate loading from blockchain
    setTimeout(() => {
      if (eventAddress) {
        const eventData = getEventByAddress(eventAddress);
        setEvent(eventData || null);
      }
      setIsLoading(false);
    }, 1000);
  }, [eventAddress]);

  const handlePurchase = async () => {
    if (!event) return;

    setIsPurchasing(true);
    
    // Simulate transaction
    setTimeout(() => {
      toast({
        title: 'Tickets purchased!',
        description: `${quantity} NFT ticket(s) minted to your wallet`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      setIsPurchasing(false);
      
      // Update sold count
      const updatedEvent = { ...event };
      updatedEvent.tiers[selectedTier].sold += quantity;
      setEvent(updatedEvent);
    }, 3000);
  };

  if (isLoading) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack spacing={4}>
          <Spinner size="xl" color="purple.500" />
          <Text>Loading event details...</Text>
        </VStack>
      </Container>
    );
  }

  if (!event) {
    return (
      <Container maxW="container.xl" py={8}>
        <Alert status="error">
          <AlertIcon />
          Event not found
        </Alert>
        <Button as={Link} to="/" mt={4} leftIcon={<ArrowBackIcon />}>
          Back to Events
        </Button>
      </Container>
    );
  }

  const selectedTierData = event.tiers[selectedTier];
  const totalPrice = selectedTierData.price * quantity;
  const remainingTickets = selectedTierData.available - selectedTierData.sold;
  const selloutPercentage = (selectedTierData.sold / selectedTierData.available) * 100;

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
                src={event.imageUrl}
                alt={event.name}
                height="300px"
                width="100%"
                objectFit="cover"
                borderRadius="xl"
                mb={4}
              />
              
              <HStack mb={2}>
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
                  <Text>{event.organizer.slice(0, 8)}...{event.organizer.slice(-6)}</Text>
                </HStack>
              </HStack>
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
            <Box>
              <Heading size="md" mb={4}>
                Choose Your Ticket
              </Heading>
              <VStack spacing={4}>
                {event.tiers.map((tier, index) => (
                  <TierCard
                    key={tier.id}
                    tier={tier}
                    isSelected={selectedTier === index}
                    onSelect={() => setSelectedTier(index)}
                  />
                ))}
              </VStack>
            </Box>
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
                  Purchase Tickets
                </Heading>
                <Text fontSize="sm" color="gray.500">
                  NFTs will be minted instantly
                </Text>
              </Box>
              
              <Divider />
              
              <Box>
                <Text fontWeight="bold" mb={2}>
                  {selectedTierData.name}
                </Text>
                <Text fontSize="sm" color="gray.600" mb={3}>
                  {selectedTierData.description}
                </Text>
                <HStack justify="space-between" align="center">
                  <Text color="purple.600" fontSize="2xl" fontWeight="bold">
                    {formatPrice(selectedTierData.price)} IDRX
                  </Text>
                  <Badge colorScheme={remainingTickets > 10 ? 'green' : 'orange'}>
                    {remainingTickets} left
                  </Badge>
                </HStack>
                
                {/* Progress bar */}
                <Progress 
                  value={selloutPercentage} 
                  size="sm" 
                  colorScheme={selloutPercentage > 80 ? 'red' : 'purple'}
                  borderRadius="full"
                  mt={2}
                />
                <Text fontSize="xs" color="gray.500" mt={1}>
                  {selectedTierData.sold} of {selectedTierData.available} sold
                </Text>
              </Box>

              <Box>
                <Text mb={2} fontWeight="medium">Quantity</Text>
                <NumberInput
                  value={quantity}
                  onChange={(_, val) => setQuantity(val)}
                  min={1}
                  max={Math.min(selectedTierData.maxPerPurchase, remainingTickets)}
                  isDisabled={remainingTickets === 0}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <Text fontSize="xs" color="gray.500" mt={1}>
                  Max {selectedTierData.maxPerPurchase} per purchase
                </Text>
              </Box>

              <Divider />

              <VStack spacing={2}>
                <HStack justify="space-between" width="100%">
                  <Text>Subtotal</Text>
                  <Text fontWeight="medium">
                    {formatPrice(totalPrice)} IDRX
                  </Text>
                </HStack>
                <HStack justify="space-between" width="100%">
                  <Text fontSize="sm" color="gray.500">Network fee</Text>
                  <Text fontSize="sm" color="gray.500">Free</Text>
                </HStack>
                <Divider />
                <HStack justify="space-between" width="100%">
                  <Text fontWeight="bold">Total</Text>
                  <Text fontSize="xl" fontWeight="bold" color="purple.600">
                    {formatPrice(totalPrice)} IDRX
                  </Text>
                </HStack>
              </VStack>

              <Button
                colorScheme="purple"
                size="lg"
                onClick={handlePurchase}
                isLoading={isPurchasing}
                loadingText="Minting NFTs..."
                isDisabled={remainingTickets === 0}
                borderRadius="lg"
              >
                {remainingTickets === 0
                  ? 'Sold Out'
                  : `🔥 Mint ${quantity} NFT Ticket${quantity > 1 ? 's' : ''}`
                }
              </Button>

              {remainingTickets > 0 && (
                <VStack spacing={1}>
                  <Text fontSize="xs" color="gray.500" textAlign="center">
                    NFTs will be burned at venue for entry
                  </Text>
                  <HStack>
                    <Icon as={InfoIcon} w={3} h={3} color="blue.500" />
                    <Text fontSize="xs" color="blue.600">
                      Connect wallet to purchase
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
  tier: MockTier;
  isSelected: boolean;
  onSelect: () => void;
}

const TierCard: React.FC<TierCardProps> = ({ tier, isSelected, onSelect }) => {
  const remaining = tier.available - tier.sold;
  const selloutPercentage = (tier.sold / tier.available) * 100;
  
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
              {formatPrice(tier.price)} IDRX
            </Text>
            <Text fontSize="sm" color="gray.500">
              {tier.sold} of {tier.available} sold
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
            Max {tier.maxPerPurchase} each
          </Text>
        </VStack>
      </HStack>
    </Box>
  );
};

export default EventDetail;