// src/pages/VenueScanner.tsx
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
  Input,
  useToast,
  Alert,
  AlertIcon,
  List,
  ListItem,
  ListIcon,
  Spinner,
  Icon,
  Progress,
  Divider,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
} from '@chakra-ui/react';
import { CheckIcon, WarningIcon, ArrowBackIcon, TimeIcon } from '@chakra-ui/icons';
import { getEventByAddress, getTicketsByEvent, type MockEvent, type MockTicket } from '../data/mockData';

interface ScannedTicket extends MockTicket {
  isValid: boolean;
  error?: string;
}

interface BurnRecord {
  tokenId: number;
  attendee: string;
  timestamp: Date;
  tierName: string;
}

const VenueScanner: React.FC = () => {
  const { eventAddress } = useParams<{ eventAddress: string }>();
  const [event, setEvent] = useState<MockEvent | null>(null);
  const [attendeeAddress, setAttendeeAddress] = useState<string>('');
  const [scannedTickets, setScannedTickets] = useState<ScannedTicket[]>([]);
  const [burnHistory, setBurnHistory] = useState<BurnRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [isBurning, setIsBurning] = useState(false);
  const toast = useToast();

  useEffect(() => {
    // Simulate loading event data
    setTimeout(() => {
      if (eventAddress) {
        const eventData = getEventByAddress(eventAddress);
        setEvent(eventData || null);
        
        // Generate some mock burn history
        const mockBurnHistory: BurnRecord[] = [
          {
            tokenId: 100,
            attendee: '0x1234567890abcdef1234567890abcdef12345678',
            timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
            tierName: 'VIP Pass'
          },
          {
            tokenId: 101,
            attendee: '0x2345678901bcdef2345678901bcdef23456789',
            timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
            tierName: 'General Admission'
          },
          {
            tokenId: 102,
            attendee: '0x3456789012cdef3456789012cdef3456789012',
            timestamp: new Date(Date.now() - 25 * 60 * 1000), // 25 minutes ago
            tierName: 'VIP Pass'
          }
        ];
        setBurnHistory(mockBurnHistory);
      }
      setIsLoading(false);
    }, 1000);
  }, [eventAddress]);

  const handleScanAttendee = async () => {
    if (!attendeeAddress || attendeeAddress.length !== 42) {
      toast({
        title: 'Invalid address',
        description: 'Please enter a valid wallet address (42 characters)',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    setIsScanning(true);

    // Simulate scanning for tickets
    setTimeout(() => {
      // Generate mock tickets for this attendee
      const mockTickets: ScannedTicket[] = [
        {
          tokenId: 123,
          eventAddress: eventAddress!,
          eventName: event?.name || 'Unknown Event',
          tierName: 'VIP Pass',
          isUsed: false,
          owner: attendeeAddress,
          isValid: true,
        },
        {
          tokenId: 456,
          eventAddress: eventAddress!,
          eventName: event?.name || 'Unknown Event',
          tierName: 'General Admission',
          isUsed: false,
          owner: attendeeAddress,
          isValid: true,
        },
      ];

      setScannedTickets(mockTickets);
      setIsScanning(false);
      
      toast({
        title: 'Tickets found!',
        description: `Found ${mockTickets.length} valid ticket(s) for this attendee`,
        status: 'success',
        duration: 3000,
      });
    }, 2000);
  };

  const handleBurnTicket = async (ticket: ScannedTicket) => {
    setIsBurning(true);

    // Simulate burn transaction
    setTimeout(() => {
      toast({
        title: 'Ticket burned! 🔥',
        description: `NFT ${ticket.tokenId} has been permanently destroyed. Attendee can enter.`,
        status: 'success',
        duration: 5000,
      });

      // Add to burn history
      const newBurnRecord: BurnRecord = {
        tokenId: ticket.tokenId,
        attendee: ticket.owner,
        timestamp: new Date(),
        tierName: ticket.tierName,
      };
      setBurnHistory(prev => [newBurnRecord, ...prev]);

      // Remove from scanned tickets
      setScannedTickets(prev => prev.filter(t => t.tokenId !== ticket.tokenId));
      setIsBurning(false);
    }, 2000);
  };

  const clearScanner = () => {
    setAttendeeAddress('');
    setScannedTickets([]);
  };

  if (isLoading) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack spacing={4}>
          <Spinner size="xl" color="purple.500" />
          <Text>Loading venue scanner...</Text>
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

  const totalBurned = burnHistory.length;
  const totalTickets = event.tiers.reduce((sum, tier) => sum + tier.sold, 0);
  const checkInPercentage = totalTickets > 0 ? (totalBurned / totalTickets) * 100 : 0;

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack>
          <Button as={Link} to="/" leftIcon={<ArrowBackIcon />} variant="ghost">
            Back to Events
          </Button>
        </HStack>

        <Box textAlign="center">
          <Badge colorScheme="red" mb={2} fontSize="lg" px={4} py={2} borderRadius="full">
            🔥 VENUE SCANNER
          </Badge>
          <Heading size="2xl" mb={2} bgGradient="linear(to-r, red.600, orange.600)" bgClip="text">
            {event.name}
          </Heading>
          <Text color="gray.600" fontSize="lg">
            {new Date(event.date).toLocaleDateString()} • {event.venue}
          </Text>
        </Box>

        {/* Instructions */}
        <Alert status="info" borderRadius="lg">
          <AlertIcon />
          <VStack align="start" spacing={1}>
            <Text fontWeight="bold">🔥 NFT Burn Process:</Text>
            <Text fontSize="sm">
              1. Attendee connects wallet via WalletConnect QR<br/>
              2. Staff scans attendee's wallet address<br/>
              3. System shows all NFT tickets for this event<br/>
              4. Staff confirms burn → NFT permanently destroyed<br/>
              5. Attendee gains entry (ticket can never be used again)
            </Text>
          </VStack>
        </Alert>

        {/* Stats */}
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
          <Stat bg="white" p={4} borderRadius="lg" boxShadow="sm">
            <StatLabel>Total Checked In</StatLabel>
            <StatNumber color="green.500">{totalBurned}</StatNumber>
            <StatHelpText>NFTs burned</StatHelpText>
          </Stat>
          <Stat bg="white" p={4} borderRadius="lg" boxShadow="sm">
            <StatLabel>Total Tickets</StatLabel>
            <StatNumber color="purple.500">{totalTickets}</StatNumber>
            <StatHelpText>Sold tickets</StatHelpText>
          </Stat>
          <Stat bg="white" p={4} borderRadius="lg" boxShadow="sm">
            <StatLabel>Check-in Rate</StatLabel>
            <StatNumber color="blue.500">{checkInPercentage.toFixed(1)}%</StatNumber>
            <StatHelpText>Entry progress</StatHelpText>
          </Stat>
          <Stat bg="white" p={4} borderRadius="lg" boxShadow="sm">
            <StatLabel>Recent Activity</StatLabel>
            <StatNumber color="orange.500">
              {burnHistory.filter(b => Date.now() - b.timestamp.getTime() < 60 * 60 * 1000).length}
            </StatNumber>
            <StatHelpText>Last hour</StatHelpText>
          </Stat>
        </SimpleGrid>

        <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={8}>
          {/* Scanner Interface */}
          <GridItem>
            <VStack spacing={6} align="stretch">
              <Box bg="white" p={6} borderRadius="xl" boxShadow="lg">
                <Heading size="md" mb={4}>
                  🔍 Scan Attendee Wallet
                </Heading>
                
                <VStack spacing={4}>
                  <Box width="100%">
                    <Text mb={2} fontWeight="medium">Attendee Wallet Address:</Text>
                    <Input
                      placeholder="0x... (from attendee's WalletConnect)"
                      value={attendeeAddress}
                      onChange={(e) => setAttendeeAddress(e.target.value)}
                      fontFamily="monospace"
                      fontSize="sm"
                    />
                    <Text fontSize="xs" color="gray.500" mt={1}>
                      Scan QR code from attendee's wallet app
                    </Text>
                  </Box>
                  
                  <HStack width="100%" spacing={2}>
                    <Button
                      colorScheme="purple"
                      onClick={handleScanAttendee}
                      isLoading={isScanning}
                      loadingText="Scanning..."
                      isDisabled={!attendeeAddress}
                      flex={1}
                    >
                      🔍 Scan for Tickets
                    </Button>
                    <Button
                      variant="outline"
                      onClick={clearScanner}
                      isDisabled={isScanning || isBurning}
                    >
                      Clear
                    </Button>
                  </HStack>
                </VStack>
              </Box>

              {/* Scanned Tickets */}
              {scannedTickets.length > 0 && (
                <Box bg="white" p={6} borderRadius="xl" boxShadow="lg">
                  <Heading size="md" mb={4}>
                    🎫 Found Tickets
                  </Heading>
                  
                  <VStack spacing={3}>
                    {scannedTickets.map((ticket) => (
                      <Box
                        key={ticket.tokenId}
                        p={4}
                        borderWidth={2}
                        borderRadius="lg"
                        width="100%"
                        bg={ticket.isValid ? 'green.50' : 'red.50'}
                        borderColor={ticket.isValid ? 'green.300' : 'red.300'}
                      >
                        <HStack justify="space-between" align="start">
                          <VStack align="start" spacing={2} flex={1}>
                            <HStack>
                              <Text fontWeight="bold" fontSize="lg">
                                {ticket.tierName}
                              </Text>
                              <Badge
                                colorScheme={ticket.isValid ? 'green' : 'red'}
                                variant="solid"
                                borderRadius="full"
                              >
                                {ticket.isValid ? '✅ Valid' : '❌ Invalid'}
                              </Badge>
                            </HStack>
                            
                            <Text fontSize="sm" color="gray.600">
                              Token ID: #{ticket.tokenId}
                            </Text>
                            
                            <Text fontSize="xs" color="gray.500" fontFamily="monospace">
                              Owner: {ticket.owner.slice(0, 8)}...{ticket.owner.slice(-6)}
                            </Text>
                          </VStack>
                          
                          {ticket.isValid && (
                            <Button
                              colorScheme="red"
                              size="md"
                              onClick={() => handleBurnTicket(ticket)}
                              isLoading={isBurning}
                              loadingText="Burning..."
                              leftIcon={<Text>🔥</Text>}
                            >
                              Burn NFT
                            </Button>
                          )}
                        </HStack>
                      </Box>
                    ))}
                  </VStack>
                  
                  <Alert status="warning" mt={4} borderRadius="lg">
                    <AlertIcon />
                    <Text fontSize="sm">
                      ⚠️ Burning will permanently destroy the NFT. This action cannot be undone.
                    </Text>
                  </Alert>
                </Box>
              )}
            </VStack>
          </GridItem>

          {/* Burn History & Instructions */}
          <GridItem>
            <VStack spacing={6} align="stretch">
              {/* Recent Burns */}
              <Box bg="white" p={6} borderRadius="xl" boxShadow="lg">
                <HStack justify="space-between" mb={4}>
                  <Heading size="md">
                    🔥 Recent Burns
                  </Heading>
                  <Badge colorScheme="red" variant="outline">
                    {totalBurned} total
                  </Badge>
                </HStack>
                
                {burnHistory.length > 0 ? (
                  <List spacing={3} maxH="300px" overflowY="auto">
                    {burnHistory.slice(0, 10).map((burn, index) => (
                      <ListItem key={index}>
                        <HStack>
                          <ListIcon as={CheckIcon} color="green.500" />
                          <VStack align="start" spacing={0} flex={1}>
                            <HStack>
                              <Text fontSize="sm" fontWeight="medium">
                                #{burn.tokenId}
                              </Text>
                              <Badge size="sm" colorScheme="purple">
                                {burn.tierName}
                              </Badge>
                            </HStack>
                            <Text fontSize="xs" color="gray.500" fontFamily="monospace">
                              {burn.attendee.slice(0, 8)}...{burn.attendee.slice(-6)}
                            </Text>
                            <HStack>
                              <Icon as={TimeIcon} w={3} h={3} color="gray.400" />
                              <Text fontSize="xs" color="gray.400">
                                {burn.timestamp.toLocaleTimeString()}
                              </Text>
                            </HStack>
                          </VStack>
                        </HStack>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Text color="gray.500" textAlign="center" py={4}>
                    No tickets burned yet
                  </Text>
                )}

                {burnHistory.length > 0 && (
                  <Box mt={4}>
                    <Progress 
                      value={checkInPercentage} 
                      size="sm" 
                      colorScheme="green"
                      borderRadius="full"
                    />
                    <Text fontSize="xs" color="gray.500" mt={1} textAlign="center">
                      {checkInPercentage.toFixed(1)}% of tickets burned
                    </Text>
                  </Box>
                )}
              </Box>

              {/* Staff Instructions */}
              <Box bg="orange.50" p={6} borderRadius="xl" border="2px" borderColor="orange.200">
                <HStack mb={3}>
                  <WarningIcon color="orange.500" />
                  <Text fontWeight="bold" color="orange.800" fontSize="lg">
                    Staff Instructions
                  </Text>
                </HStack>
                
                <VStack align="start" spacing={2} color="orange.700">
                  <Text fontSize="sm">
                    <Text as="span" fontWeight="bold">1.</Text> Ask attendee to open their wallet app
                  </Text>
                  <Text fontSize="sm">
                    <Text as="span" fontWeight="bold">2.</Text> Ask them to show WalletConnect QR code
                  </Text>
                  <Text fontSize="sm">
                    <Text as="span" fontWeight="bold">3.</Text> Scan the QR to get their wallet address
                  </Text>
                  <Text fontSize="sm">
                    <Text as="span" fontWeight="bold">4.</Text> Enter address and scan for tickets
                  </Text>
                  <Text fontSize="sm">
                    <Text as="span" fontWeight="bold">5.</Text> Verify ticket details match event
                  </Text>
                  <Text fontSize="sm">
                    <Text as="span" fontWeight="bold">6.</Text> Click "Burn NFT" to destroy ticket
                  </Text>
                  <Text fontSize="sm">
                    <Text as="span" fontWeight="bold">7.</Text> Allow entry after successful burn
                  </Text>
                </VStack>

                <Divider my={3} borderColor="orange.300" />

                <Alert status="error" borderRadius="lg">
                  <AlertIcon />
                  <Text fontSize="sm" fontWeight="bold">
                    ⚠️ IMPORTANT: NFT burn is permanent and cannot be reversed!
                  </Text>
                </Alert>
              </Box>

              {/* Emergency Actions */}
              <Box bg="red.50" p={4} borderRadius="lg" border="1px" borderColor="red.200">
                <Text fontWeight="bold" color="red.800" mb={2}>
                  🚨 Emergency Actions
                </Text>
                <VStack spacing={2}>
                  <Button 
                    colorScheme="red" 
                    variant="outline" 
                    size="sm" 
                    width="100%"
                    onClick={() => toast({
                      title: 'Emergency stop activated',
                      description: 'All burning operations have been paused',
                      status: 'warning',
                      duration: 3000,
                    })}
                  >
                    🛑 Emergency Stop
                  </Button>
                  <Text fontSize="xs" color="red.600" textAlign="center">
                    Use only in case of technical issues
                  </Text>
                </VStack>
              </Box>
            </VStack>
          </GridItem>
        </Grid>
      </VStack>
    </Container>
  );
};

export default VenueScanner;