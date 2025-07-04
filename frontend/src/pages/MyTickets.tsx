// src/pages/MyTickets.tsx
import React, { useState, useEffect } from 'react';
import {
  Container,
  Heading,
  Text,
  SimpleGrid,
  Box,
  VStack,
  HStack,
  Button,
  Badge,
  Input,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Alert,
  AlertIcon,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Spinner,
  Image,
  Divider,
} from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import { mockTickets, getEventByAddress, type MockTicket } from '../data/mockData';

const MyTickets: React.FC = () => {
  const [tickets, setTickets] = useState<MockTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<MockTicket | null>(null);
  const [transferTo, setTransferTo] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isTransferring, setIsTransferring] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    // Simulate loading from blockchain
    setTimeout(() => {
      // Filter tickets for current user (mock address)
      const userTickets = mockTickets.filter(ticket => 
        ticket.owner === '0x742d35Cc6634C0532925a3b8D2C5DEB4C'
      );
      setTickets(userTickets);
      setIsLoading(false);
    }, 1500);
  }, []);

  const handleTransfer = async () => {
    if (!selectedTicket || !transferTo) {
      toast({
        title: 'Missing information',
        description: 'Please enter a valid wallet address',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    setIsTransferring(true);

    // Simulate transfer transaction
    setTimeout(() => {
      toast({
        title: 'Transfer successful!',
        description: `NFT transferred to ${transferTo.slice(0, 8)}...${transferTo.slice(-6)}`,
        status: 'success',
        duration: 5000,
      });
      
      // Remove ticket from user's collection
      setTickets(prev => prev.filter(t => t.tokenId !== selectedTicket.tokenId));
      
      setIsTransferring(false);
      onClose();
      setTransferTo('');
      setSelectedTicket(null);
    }, 2000);
  };

  const activeTickets = tickets.filter(ticket => !ticket.isUsed);
  const burnedTickets = tickets.filter(ticket => ticket.isUsed);

  if (isLoading) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack spacing={4}>
          <Spinner size="xl" color="purple.500" />
          <Text>Loading your NFT tickets...</Text>
        </VStack>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Box>
          <Heading size="2xl" mb={2} bgGradient="linear(to-r, purple.600, pink.600)" bgClip="text">
            🎫 My NFT Tickets
          </Heading>
          <Text color="gray.600" fontSize="lg">
            Your blockchain-verified tickets. Burned tickets have been permanently destroyed.
          </Text>
        </Box>

        {/* Info Alert */}
        <Alert status="info" borderRadius="lg">
          <AlertIcon />
          <VStack align="start" spacing={1}>
            <Text fontWeight="bold">NFT Burn System:</Text>
            <Text fontSize="sm">
              Active tickets can be transferred. At the venue, staff will burn your NFT for entry - 
              this permanently destroys the ticket and prevents any future use.
            </Text>
          </VStack>
        </Alert>

        {/* Tabs */}
        <Tabs colorScheme="purple" variant="enclosed">
          <TabList>
            <Tab>
              <HStack>
                <Text>🔥 Active Tickets</Text>
                <Badge colorScheme="green" borderRadius="full">
                  {activeTickets.length}
                </Badge>
              </HStack>
            </Tab>
            <Tab>
              <HStack>
                <Text>💀 Burned Tickets</Text>
                <Badge colorScheme="gray" borderRadius="full">
                  {burnedTickets.length}
                </Badge>
              </HStack>
            </Tab>
          </TabList>

          <TabPanels>
            {/* Active Tickets */}
            <TabPanel px={0} py={6}>
              {activeTickets.length > 0 ? (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                  {activeTickets.map((ticket) => (
                    <TicketCard
                      key={ticket.tokenId}
                      ticket={ticket}
                      onTransfer={() => {
                        setSelectedTicket(ticket);
                        onOpen();
                      }}
                    />
                  ))}
                </SimpleGrid>
              ) : (
                <Box textAlign="center" py={12}>
                  <Text fontSize="6xl" mb={4}>🎫</Text>
                  <Text fontSize="lg" color="gray.500" mb={2}>
                    No active tickets
                  </Text>
                  <Text color="gray.400">
                    Purchase some NFT tickets to get started!
                  </Text>
                </Box>
              )}
            </TabPanel>

            {/* Burned Tickets */}
            <TabPanel px={0} py={6}>
              {burnedTickets.length > 0 ? (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                  {burnedTickets.map((ticket) => (
                    <BurnedTicketCard key={ticket.tokenId} ticket={ticket} />
                  ))}
                </SimpleGrid>
              ) : (
                <Box textAlign="center" py={12}>
                  <Text fontSize="6xl" mb={4}>💀</Text>
                  <Text fontSize="lg" color="gray.500" mb={2}>
                    No burned tickets
                  </Text>
                  <Text color="gray.400">
                    Tickets you use at venues will appear here
                  </Text>
                </Box>
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>

      {/* Transfer Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Transfer NFT Ticket</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              {selectedTicket && (
                <Box p={4} bg="purple.50" borderRadius="lg">
                  <Text fontWeight="bold" color="purple.800">
                    {getEventByAddress(selectedTicket.eventAddress)?.name}
                  </Text>
                  <Text color="purple.600">
                    {selectedTicket.tierName}
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    Token ID: #{selectedTicket.tokenId}
                  </Text>
                </Box>
              )}

              <Alert status="warning" borderRadius="lg">
                <AlertIcon />
                <Text fontSize="sm">
                  Transferring will move the NFT to another wallet. You will lose access to this ticket permanently.
                </Text>
              </Alert>

              <Box>
                <Text mb={2} fontWeight="medium">Recipient Wallet Address:</Text>
                <Input
                  placeholder="0x..."
                  value={transferTo}
                  onChange={(e) => setTransferTo(e.target.value)}
                  fontFamily="monospace"
                />
                <Text fontSize="xs" color="gray.500" mt={1}>
                  Enter the complete wallet address (42 characters)
                </Text>
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="purple"
              onClick={handleTransfer}
              isLoading={isTransferring}
              loadingText="Transferring..."
              isDisabled={!transferTo || transferTo.length !== 42}
            >
              Transfer NFT
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

interface TicketCardProps {
  ticket: MockTicket;
  onTransfer: () => void;
}

const TicketCard: React.FC<TicketCardProps> = ({ ticket, onTransfer }) => {
  const event = getEventByAddress(ticket.eventAddress);

  return (
    <Box
      bg="white"
      borderRadius="xl"
      overflow="hidden"
      boxShadow="lg"
      _hover={{ boxShadow: 'xl', transform: 'translateY(-2px)' }}
      transition="all 0.3s"
      border="2px"
      borderColor="green.200"
    >
      {event && (
        <Image
          src={event.imageUrl}
          alt={event.name}
          height="150px"
          width="100%"
          objectFit="cover"
        />
      )}
      
      <Box p={4}>
        <VStack align="stretch" spacing={3}>
          <HStack justify="space-between">
            <Badge colorScheme="green" variant="solid" borderRadius="full" px={3}>
              🔥 ACTIVE
            </Badge>
            <Text fontSize="sm" color="gray.500" fontFamily="monospace">
              #{ticket.tokenId}
            </Text>
          </HStack>

          <Box>
            <Text fontWeight="bold" fontSize="lg" noOfLines={2}>
              {event?.name || 'Unknown Event'}
            </Text>
            <Text color="purple.600" fontWeight="medium">
              {ticket.tierName}
            </Text>
            <Text fontSize="sm" color="gray.500">
              📅 {event ? new Date(event.date).toLocaleDateString() : 'TBA'}
            </Text>
          </Box>

          <Divider />

          <VStack spacing={2}>
            <Text fontSize="sm" color="green.600" fontWeight="medium" textAlign="center">
              ✅ Ready for venue scanning
            </Text>
            <Text fontSize="xs" color="gray.500" textAlign="center">
              This NFT will be burned when used at the venue
            </Text>
            
            <Button
              size="sm"
              variant="outline"
              colorScheme="purple"
              onClick={onTransfer}
              width="100%"
              leftIcon={<ExternalLinkIcon />}
            >
              Transfer NFT
            </Button>
          </VStack>
        </VStack>
      </Box>
    </Box>
  );
};

interface BurnedTicketCardProps {
  ticket: MockTicket;
}

const BurnedTicketCard: React.FC<BurnedTicketCardProps> = ({ ticket }) => {
  const event = getEventByAddress(ticket.eventAddress);

  return (
    <Box
      bg="gray.50"
      borderRadius="xl"
      overflow="hidden"
      boxShadow="sm"
      opacity={0.7}
      border="2px"
      borderColor="gray.300"
    >
      {event && (
        <Box position="relative">
          <Image
            src={event.imageUrl}
            alt={event.name}
            height="150px"
            width="100%"
            objectFit="cover"
            filter="grayscale(100%)"
          />
          <Badge
            position="absolute"
            top="3"
            right="3"
            colorScheme="red"
            variant="solid"
            borderRadius="full"
            px={3}
          >
            💀 BURNED
          </Badge>
        </Box>
      )}
      
      <Box p={4}>
        <VStack align="stretch" spacing={3}>
          <HStack justify="space-between">
            <Badge colorScheme="gray" variant="solid" borderRadius="full" px={3}>
              🔥 DESTROYED
            </Badge>
            <Text fontSize="sm" color="gray.500" fontFamily="monospace">
              #{ticket.tokenId}
            </Text>
          </HStack>

          <Box>
            <Text fontWeight="bold" fontSize="lg" noOfLines={2} color="gray.600">
              {event?.name || 'Unknown Event'}
            </Text>
            <Text color="gray.500" fontWeight="medium">
              {ticket.tierName}
            </Text>
          </Box>

          <Box>
            <Text fontSize="sm" color="red.600" fontWeight="medium" mb={2}>
              ❌ NFT permanently destroyed
            </Text>
            <Text fontSize="xs" color="gray.500">
              This ticket was burned at the venue and can never be used again.
              The NFT has been permanently removed from the blockchain.
            </Text>
          </Box>
        </VStack>
      </Box>
    </Box>
  );
};

export default MyTickets;