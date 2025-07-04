// src/pages/HomePage.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Heading,
  Text,
  SimpleGrid,
  Box,
  Button,
  VStack,
  HStack,
  Badge,
  Image,
  Spinner,
  Alert,
  AlertIcon,
  Progress,
} from '@chakra-ui/react';
import { mockEvents, formatPrice, formatDate, type MockEvent } from '../data/mockData';

const HomePage: React.FC = () => {
  const [events, setEvents] = useState<MockEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading from blockchain
    setTimeout(() => {
      setEvents(mockEvents);
      setIsLoading(false);
    }, 1500);
  }, []);

  if (isLoading) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack spacing={4}>
          <Spinner size="xl" color="purple.500" />
          <Text>Loading events from blockchain...</Text>
        </VStack>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Box textAlign="center">
          <Heading size="2xl" mb={4} bgGradient="linear(to-r, purple.600, pink.600)" bgClip="text">
            🔥 Discover Events
          </Heading>
          <Text fontSize="lg" color="gray.600" maxW="2xl" mx="auto">
            Blockchain-verified tickets that burn after use - 100% authentic, zero duplicates.
            Experience the future of ticketing with NFT burn technology.
          </Text>
        </Box>

        <Alert status="info" borderRadius="lg">
          <AlertIcon />
          <VStack align="start" spacing={1}>
            <Text fontWeight="bold">How NFT Burn Works:</Text>
            <Text fontSize="sm">
              Purchase → NFT minted to wallet → At venue → Staff burns NFT → Entry granted → Ticket destroyed forever
            </Text>
          </VStack>
        </Alert>

        {/* Events Grid */}
        {events.length > 0 ? (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {events.map((event) => (
              <EventCard key={event.address} event={event} />
            ))}
          </SimpleGrid>
        ) : (
          <Box textAlign="center" py={12}>
            <Text fontSize="lg" color="gray.500">
              No events found. Create the first event!
            </Text>
            <Button as={Link} to="/create" colorScheme="purple" mt={4}>
              Create Event
            </Button>
          </Box>
        )}
      </VStack>
    </Container>
  );
};

interface EventCardProps {
  event: MockEvent;
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const totalTickets = event.tiers.reduce((sum, tier) => sum + tier.available, 0);
  const soldTickets = event.tiers.reduce((sum, tier) => sum + tier.sold, 0);
  const selloutPercentage = (soldTickets / totalTickets) * 100;
  const lowestPrice = Math.min(...event.tiers.map(tier => tier.price));

  return (
    <Box
      bg="white"
      borderRadius="xl"
      overflow="hidden"
      boxShadow="lg"
      _hover={{ 
        boxShadow: 'xl', 
        transform: 'translateY(-4px)',
        borderColor: 'purple.300' 
      }}
      transition="all 0.3s"
      border="1px"
      borderColor="gray.100"
    >
      <Box position="relative">
        <Image
          src={event.imageUrl}
          alt={event.name}
          height="200px"
          width="100%"
          objectFit="cover"
        />
        <Badge
          position="absolute"
          top="3"
          right="3"
          colorScheme="purple"
          variant="solid"
          borderRadius="full"
          px={3}
          py={1}
        >
          🔥 NFT Burn
        </Badge>
        
        {/* Sellout indicator */}
        {selloutPercentage > 80 && (
          <Badge
            position="absolute"
            top="3"
            left="3"
            colorScheme="red"
            variant="solid"
            borderRadius="full"
            px={3}
            py={1}
          >
            {selloutPercentage >= 100 ? 'SOLD OUT' : 'ALMOST SOLD OUT'}
          </Badge>
        )}
      </Box>
      
      <VStack p={6} align="stretch" spacing={4}>
        <Box>
          <Heading size="md" noOfLines={2} mb={2}>
            {event.name}
          </Heading>
          
          <Text color="gray.600" noOfLines={2} fontSize="sm">
            {event.description}
          </Text>
        </Box>

        <VStack spacing={2} align="stretch">
          <HStack justify="space-between" fontSize="sm" color="gray.600">
            <Text>📅 {formatDate(event.date)}</Text>
            <Text>📍 {event.venue}</Text>
          </HStack>

          <HStack justify="space-between" fontSize="sm" color="gray.600">
            <Text>🎫 {soldTickets}/{totalTickets} sold</Text>
            <Text fontWeight="bold" color="purple.600">
              From {formatPrice(lowestPrice)} IDRX
            </Text>
          </HStack>

          {/* Progress bar */}
          <Progress 
            value={selloutPercentage} 
            size="sm" 
            colorScheme={selloutPercentage > 80 ? 'red' : 'purple'}
            borderRadius="full"
          />
        </VStack>
        
        <Button
          as={Link}
          to={`/event/${event.address}`}
          colorScheme="purple"
          size="md"
          borderRadius="lg"
          isDisabled={selloutPercentage >= 100}
        >
          {selloutPercentage >= 100 ? 'Sold Out' : 'View & Purchase'}
        </Button>
      </VStack>
    </Box>
  );
};

export default HomePage;