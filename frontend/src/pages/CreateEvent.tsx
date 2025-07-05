// src/pages/CreateEvent.tsx - FIXED TO USE CORRECT ABI
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Box,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  useToast,
  Alert,
  AlertIcon,
  Divider,
  Badge,
  IconButton,
  Progress,
  SimpleGrid,
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon, ArrowBackIcon } from '@chakra-ui/icons';
import { Link } from 'react-router-dom';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useWatchContractEvent } from 'wagmi';
import { CONTRACT_ADDRESSES } from '../config/wagmi';
import { SimpleEventFactoryABI, EventABI } from '../contracts/abis'; // Fix: Use SimpleEventFactoryABI
import { useUserRole, useIsAuthorizedOrganizer, parseIDRX } from '../hooks/useBlockchain';

interface TicketTier {
  name: string;
  price: string; // Keep as string for form input
  available: number;
  maxPerPurchase: number;
  description: string;
}

const CreateEvent: React.FC = () => {
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const userRole = useUserRole();
  const { data: isAuthorized } = useIsAuthorizedOrganizer();
  const [deploymentStep, setDeploymentStep] = useState(0);
  const [createdEventAddress, setCreatedEventAddress] = useState<string>('');
  const [currentTierIndex, setCurrentTierIndex] = useState(0);
  const toast = useToast();

  // Contract write hooks
  const { 
    writeContract: createEvent, 
    data: createEventHash,
    isPending: isCreatingEvent 
  } = useWriteContract();

  const { 
    writeContract: addTier,
    data: addTierHash,
    isPending: isAddingTier
  } = useWriteContract();

  // Wait for transaction confirmations
  const { isLoading: isConfirmingCreate, isSuccess: isCreateSuccess } = useWaitForTransactionReceipt({
    hash: createEventHash,
  });

  const { isLoading: isConfirmingTier, isSuccess: isTierSuccess } = useWaitForTransactionReceipt({
    hash: addTierHash,
  });

  // Watch for EventCreated event to get the created event address
  useWatchContractEvent({
    address: CONTRACT_ADDRESSES.EventFactory,
    abi: SimpleEventFactoryABI, // Fix: Use SimpleEventFactoryABI
    eventName: 'EventCreated',
    onLogs(logs) {
      console.log('EventCreated logs:', logs);
      if (logs.length > 0) {
        // Destructure eventAddress from the args property
        const { eventAddress } = (logs[0] as any).args || {};
        if (eventAddress) {
          console.log('Event created at address:', eventAddress);
          setCreatedEventAddress(eventAddress);
        }
      }
    },
  });

  // Event form data
  const [eventData, setEventData] = useState({
    name: '',
    description: '',
    date: '',
    venue: '',
    ipfsMetadata: '',
  });

  // Ticket tiers
  const [tiers, setTiers] = useState<TicketTier[]>([
    {
      name: 'General Admission',
      price: '250000', // 250k IDRX
      available: 300,
      maxPerPurchase: 4,
      description: 'Standard event access',
    }
  ]);

  const handleInputChange = (field: string, value: string) => {
    setEventData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleTierChange = (index: number, field: keyof TicketTier, value: string | number) => {
    setTiers(prev => prev.map((tier, i) => 
      i === index ? { ...tier, [field]: value } : tier
    ));
  };

  const addTierToForm = () => {
    setTiers(prev => [...prev, {
      name: '',
      price: '0',
      available: 100,
      maxPerPurchase: 4,
      description: '',
    }]);
  };

  const removeTier = (index: number) => {
    if (tiers.length > 1) {
      setTiers(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleCreateEvent = async () => {
    if (!isConnected || !address) {
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your wallet to create an event',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    if (!isAuthorized) {
      toast({
        title: 'Not authorized',
        description: 'Only authorized organizers can create events',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    if (!eventData.name || !eventData.date || !eventData.venue) {
      toast({
        title: 'Missing required fields',
        description: 'Please fill in all required fields',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    if (tiers.some(tier => !tier.name || parseFloat(tier.price) <= 0)) {
      toast({
        title: 'Invalid ticket tiers',
        description: 'Please complete all ticket tier information',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    try {
      setDeploymentStep(1);
      
      // Convert date to timestamp
      const eventTimestamp = Math.floor(new Date(eventData.date).getTime() / 1000);
      
      // Create event parameters
      const eventParams = {
        name: eventData.name,
        description: eventData.description,
        date: BigInt(eventTimestamp),
        venue: eventData.venue,
        ipfsMetadata: eventData.ipfsMetadata || `event-${Date.now()}`,
      };

      console.log('Creating event with params:', eventParams);

      // Create the event
      createEvent({
        address: CONTRACT_ADDRESSES.EventFactory,
        abi: SimpleEventFactoryABI, // Fix: Use SimpleEventFactoryABI
        functionName: 'createEvent',
        args: [eventParams],
      });

    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        title: 'Transaction failed',
        description: 'Failed to create event. Please try again.',
        status: 'error',
        duration: 5000,
      });
      setDeploymentStep(0);
    }
  };

  // Handle successful event creation
  useEffect(() => {
    if (isCreateSuccess && createEventHash && createdEventAddress) {
      console.log('Event creation confirmed, starting tier addition...');
      setDeploymentStep(2);
      
      // Start adding tiers after a short delay
      setTimeout(() => {
        addNextTier();
      }, 2000);
    }
  }, [isCreateSuccess, createEventHash, createdEventAddress]);

  // Handle successful tier addition
  useEffect(() => {
    if (isTierSuccess && currentTierIndex < tiers.length) {
      console.log(`Tier ${currentTierIndex} added successfully`);
      
      // Move to next tier or complete
      if (currentTierIndex + 1 < tiers.length) {
        setCurrentTierIndex(prev => prev + 1);
        setTimeout(() => {
          addNextTier();
        }, 1000);
      } else {
        // All tiers added
        setDeploymentStep(4);
        setTimeout(() => {
          toast({
            title: 'Event created successfully! 🚀',
            description: `Your event is now live on the blockchain with ${tiers.length} ticket tiers`,
            status: 'success',
            duration: 5000,
          });
          
          navigate(`/event/${createdEventAddress}`);
        }, 2000);
      }
    }
  }, [isTierSuccess, currentTierIndex, tiers.length, createdEventAddress, navigate, toast]);

  const addNextTier = async () => {
    if (!createdEventAddress || currentTierIndex >= tiers.length) {
      console.error('Cannot add tier: missing event address or invalid index');
      return;
    }

    const tier = tiers[currentTierIndex];
    setDeploymentStep(3);
    
    console.log(`Adding tier ${currentTierIndex + 1}/${tiers.length}:`, tier);

    try {
      addTier({
        address: createdEventAddress as `0x${string}`,
        abi: EventABI,
        functionName: 'addTicketTier',
        args: [
          tier.name,
          parseIDRX(tier.price),
          BigInt(tier.available),
          BigInt(tier.maxPerPurchase),
          tier.description,
        ],
      });
    } catch (error) {
      console.error('Error adding tier:', error);
      toast({
        title: 'Failed to add ticket tier',
        description: `Error adding tier: ${tier.name}`,
        status: 'error',
        duration: 5000,
      });
    }
  };

  const deploymentSteps = [
    'Ready to deploy...',
    'Creating Event contract...',
    'Event deployed successfully...',
    `Adding ticket tier ${currentTierIndex + 1}/${tiers.length}...`,
    'Deployment complete!'
  ];

  const totalTickets = tiers.reduce((sum, tier) => sum + tier.available, 0);
  const estimatedRevenue = tiers.reduce((sum, tier) => sum + (parseFloat(tier.price) * tier.available), 0);
  const isDeploying = isCreatingEvent || isConfirmingCreate || isAddingTier || isConfirmingTier;

  // Check authorization
  if (!isConnected) {
    return (
      <Container maxW="container.lg" py={8}>
        <Alert status="warning" borderRadius="lg">
          <AlertIcon />
          <VStack align="start" spacing={1}>
            <Text fontWeight="bold">Wallet not connected</Text>
            <Text fontSize="sm">Please connect your wallet to create events</Text>
          </VStack>
        </Alert>
      </Container>
    );
  }

  if (userRole !== 'organizer' || !isAuthorized) {
    return (
      <Container maxW="container.lg" py={8}>
        <Alert status="error" borderRadius="lg">
          <AlertIcon />
          <VStack align="start" spacing={1}>
            <Text fontWeight="bold">Not authorized</Text>
            <Text fontSize="sm">Only authorized organizers can create events</Text>
          </VStack>
        </Alert>
      </Container>
    );
  }

  if (isDeploying) {
    return (
      <Container maxW="container.md" py={8}>
        <VStack spacing={8}>
          <Box textAlign="center">
            <Text fontSize="6xl" mb={4}>🚀</Text>
            <Heading size="xl" mb={2}>
              Deploying Your Event
            </Heading>
            <Text color="gray.600">
              Creating smart contracts on blockchain...
            </Text>
          </Box>

          <Box width="100%" maxW="md">
            <VStack spacing={4}>
              <Progress 
                value={(deploymentStep + 1) / deploymentSteps.length * 100} 
                width="100%" 
                colorScheme="purple"
                size="lg"
                borderRadius="full"
              />
              <Text fontWeight="medium" color="purple.600">
                {deploymentSteps[deploymentStep]}
              </Text>
              <Text fontSize="sm" color="gray.500">
                Step {deploymentStep + 1} of {deploymentSteps.length}
              </Text>
            </VStack>
          </Box>

          <Alert status="info" borderRadius="lg">
            <AlertIcon />
            <VStack align="start" spacing={1}>
              <Text fontWeight="bold">🔥 Deploying NFT Burn System:</Text>
              <Text fontSize="sm">
                Creating Event contract + TicketNFT contract with burn functionality.
                Then adding {tiers.length} ticket tier{tiers.length > 1 ? 's' : ''} to the contract.
              </Text>
            </VStack>
          </Alert>

          {/* Show current transaction hash */}
          {createEventHash && deploymentStep <= 2 && (
            <Box textAlign="center">
              <Text fontSize="sm" color="gray.600">
                Event Creation TX: {createEventHash.slice(0, 10)}...{createEventHash.slice(-8)}
              </Text>
            </Box>
          )}

          {addTierHash && deploymentStep >= 3 && (
            <Box textAlign="center">
              <Text fontSize="sm" color="gray.600">
                Adding Tier TX: {addTierHash.slice(0, 10)}...{addTierHash.slice(-8)}
              </Text>
            </Box>
          )}

          {createdEventAddress && (
            <Box textAlign="center">
              <Text fontSize="sm" color="green.600" fontWeight="bold">
                Event Address: {createdEventAddress.slice(0, 10)}...{createdEventAddress.slice(-8)}
              </Text>
            </Box>
          )}
        </VStack>
      </Container>
    );
  }

  return (
    <Container maxW="container.lg" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <HStack>
          <Button as={Link} to="/" leftIcon={<ArrowBackIcon />} variant="ghost">
            Back to Events
          </Button>
        </HStack>

        <Box textAlign="center">
          <Heading size="2xl" mb={2} bgGradient="linear(to-r, purple.600, pink.600)" bgClip="text">
            🎪 Create Event
          </Heading>
          <Text color="gray.600" fontSize="lg">
            Deploy a new event contract with NFT burn verification system
          </Text>
        </Box>

        {/* User Info */}
        <Alert status="success" borderRadius="lg">
          <AlertIcon />
          <VStack align="start" spacing={1}>
            <Text fontWeight="bold">✅ You are authorized as an Organizer</Text>
            <Text fontSize="sm">
              Connected as: {address?.slice(0, 8)}...{address?.slice(-6)}
            </Text>
          </VStack>
        </Alert>

        {/* Info Alert */}
        <Alert status="info" borderRadius="lg">
          <AlertIcon />
          <VStack align="start" spacing={1}>
            <Text fontWeight="bold">🔥 NFT Burn System Benefits:</Text>
            <Text fontSize="sm">
              • Tickets are NFTs that get permanently destroyed when used<br/>
              • 100% eliminates duplicate tickets and fraud<br/>
              • Pure Web3 solution - no databases required<br/>
              • Direct wallet connection at venue for burning
            </Text>
          </VStack>
        </Alert>

        <form onSubmit={(e) => { e.preventDefault(); handleCreateEvent(); }}>
          <VStack spacing={8} align="stretch">
            {/* Event Details */}
            <Box bg="white" p={6} borderRadius="xl" boxShadow="lg">
              <Heading size="md" mb={6} color="purple.600">
                📅 Event Details
              </Heading>
              
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Event Name</FormLabel>
                  <Input
                    value={eventData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g. Summer Music Festival"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Event Date</FormLabel>
                  <Input
                    type="datetime-local"
                    value={eventData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                  />
                </FormControl>
              </SimpleGrid>

              <FormControl mt={4}>
                <FormLabel>Description</FormLabel>
                <Textarea
                  value={eventData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your event..."
                  rows={3}
                />
              </FormControl>

              <FormControl mt={4} isRequired>
                <FormLabel>Venue</FormLabel>
                <Input
                  value={eventData.venue}
                  onChange={(e) => handleInputChange('venue', e.target.value)}
                  placeholder="e.g. Jakarta Convention Center"
                />
              </FormControl>

              <FormControl mt={4}>
                <FormLabel>IPFS Metadata (optional)</FormLabel>
                <Input
                  value={eventData.ipfsMetadata}
                  onChange={(e) => handleInputChange('ipfsMetadata', e.target.value)}
                  placeholder="e.g. QmHash... (auto-generated if empty)"
                />
              </FormControl>
            </Box>

            {/* Ticket Tiers */}
            <Box bg="white" p={6} borderRadius="xl" boxShadow="lg">
              <HStack justify="space-between" mb={6}>
                <Heading size="md" color="purple.600">
                  🎫 Ticket Tiers
                </Heading>
                <Button
                  leftIcon={<AddIcon />}
                  size="sm"
                  colorScheme="purple"
                  variant="outline"
                  onClick={addTierToForm}
                >
                  Add Tier
                </Button>
              </HStack>

              <VStack spacing={6}>
                {tiers.map((tier, index) => (
                  <Box
                    key={index}
                    p={4}
                    borderWidth={2}
                    borderRadius="lg"
                    borderColor="purple.200"
                    width="100%"
                    bg="purple.50"
                  >
                    <HStack justify="space-between" mb={3}>
                      <Badge colorScheme="purple" fontSize="sm" px={3} py={1}>
                        Tier {index + 1}
                      </Badge>
                      {tiers.length > 1 && (
                        <IconButton
                          aria-label="Remove tier"
                          icon={<DeleteIcon />}
                          size="sm"
                          colorScheme="red"
                          variant="ghost"
                          onClick={() => removeTier(index)}
                        />
                      )}
                    </HStack>

                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      <FormControl>
                        <FormLabel fontSize="sm">Tier Name</FormLabel>
                        <Input
                          size="sm"
                          value={tier.name}
                          onChange={(e) => handleTierChange(index, 'name', e.target.value)}
                          placeholder="e.g. General Admission, VIP"
                          bg="white"
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel fontSize="sm">Description</FormLabel>
                        <Input
                          size="sm"
                          value={tier.description}
                          onChange={(e) => handleTierChange(index, 'description', e.target.value)}
                          placeholder="Brief description"
                          bg="white"
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel fontSize="sm">Price (IDRX)</FormLabel>
                        <NumberInput
                          size="sm"
                          value={tier.price}
                          onChange={(val) => handleTierChange(index, 'price', val)}
                          min={0}
                        >
                          <NumberInputField bg="white" />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                      </FormControl>

                      <FormControl>
                        <FormLabel fontSize="sm">Available Quantity</FormLabel>
                        <NumberInput
                          size="sm"
                          value={tier.available}
                          onChange={(_, val) => handleTierChange(index, 'available', val || 0)}
                          min={1}
                        >
                          <NumberInputField bg="white" />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                      </FormControl>

                      <FormControl>
                        <FormLabel fontSize="sm">Max per Purchase</FormLabel>
                        <NumberInput
                          size="sm"
                          value={tier.maxPerPurchase}
                          onChange={(_, val) => handleTierChange(index, 'maxPerPurchase', val || 1)}
                          min={1}
                          max={10}
                        >
                          <NumberInputField bg="white" />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                      </FormControl>
                    </SimpleGrid>
                  </Box>
                ))}
              </VStack>
            </Box>

            {/* Summary */}
            <Box bg="purple.50" p={6} borderRadius="xl" border="2px" borderColor="purple.200">
              <Heading size="md" mb={4} color="purple.600">
                📊 Event Summary
              </Heading>
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                <Box textAlign="center">
                  <Text fontSize="2xl" fontWeight="bold" color="purple.600">
                    {totalTickets.toLocaleString()}
                  </Text>
                  <Text fontSize="sm" color="gray.600">Total Tickets</Text>
                </Box>
                <Box textAlign="center">
                  <Text fontSize="2xl" fontWeight="bold" color="green.600">
                    {estimatedRevenue.toLocaleString()}
                  </Text>
                  <Text fontSize="sm" color="gray.600">Max Revenue (IDRX)</Text>
                </Box>
                <Box textAlign="center">
                  <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                    {tiers.length}
                  </Text>
                  <Text fontSize="sm" color="gray.600">Ticket Tiers</Text>
                </Box>
              </SimpleGrid>
            </Box>

            <Divider />

            {/* Deploy Button */}
            <VStack spacing={4}>
              <Button
                type="submit"
                colorScheme="purple"
                size="lg"
                width="100%"
                maxW="md"
                isDisabled={!eventData.name || !eventData.date || !eventData.venue || !isConnected}
                isLoading={isDeploying}
                loadingText="Deploying..."
                leftIcon={<Text>🚀</Text>}
                borderRadius="full"
                py={6}
              >
                Deploy Event Contract to Blockchain
              </Button>

              <Text fontSize="sm" color="gray.500" textAlign="center" maxW="md">
                This will deploy smart contracts for your event with NFT burn functionality.
                Each tier will be added to the blockchain separately.
              </Text>
            </VStack>
          </VStack>
        </form>
      </VStack>
    </Container>
  );
};

export default CreateEvent;