// src/pages/CreateEvent.tsx
import React, { useState } from 'react';
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

interface TicketTier {
  name: string;
  price: number;
  available: number;
  maxPerPurchase: number;
  description: string;
}

const CreateEvent: React.FC = () => {
  const navigate = useNavigate();
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentStep, setDeploymentStep] = useState(0);
  const toast = useToast();

  // Event form data
  const [eventData, setEventData] = useState({
    name: '',
    description: '',
    date: '',
    venue: '',
  });

  // Ticket tiers
  const [tiers, setTiers] = useState<TicketTier[]>([
    {
      name: 'General Admission',
      price: 250, // in IDRX (not wei for simplicity)
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

  const addTier = () => {
    setTiers(prev => [...prev, {
      name: '',
      price: 0,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!eventData.name || !eventData.date || !eventData.venue) {
      toast({
        title: 'Missing required fields',
        description: 'Please fill in all required fields',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    if (tiers.some(tier => !tier.name || tier.price <= 0)) {
      toast({
        title: 'Invalid ticket tiers',
        description: 'Please complete all ticket tier information',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    setIsDeploying(true);
    setDeploymentStep(0);

    // Simulate deployment steps
    const steps = [
      'Validating event data...',
      'Deploying Event contract...',
      'Deploying TicketNFT contract...',
      'Setting up ticket tiers...',
      'Finalizing deployment...'
    ];

    for (let i = 0; i < steps.length; i++) {
      setDeploymentStep(i);
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    // Generate mock contract address
    const mockContractAddress = '0x' + Math.random().toString(16).substring(2, 42);

    toast({
      title: 'Event deployed successfully! 🚀',
      description: `Contract deployed at ${mockContractAddress.slice(0, 8)}...${mockContractAddress.slice(-6)}`,
      status: 'success',
      duration: 5000,
    });

    setIsDeploying(false);
    navigate('/');
  };

  const deploymentSteps = [
    'Validating event data...',
    'Deploying Event contract...',
    'Deploying TicketNFT contract...',
    'Setting up ticket tiers...',
    'Finalizing deployment...'
  ];

  const totalTickets = tiers.reduce((sum, tier) => sum + tier.available, 0);
  const estimatedRevenue = tiers.reduce((sum, tier) => sum + (tier.price * tier.available), 0);

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
              Creating smart contracts on Lisk Sepolia...
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
              <Text fontWeight="bold">Deploying NFT Burn System:</Text>
              <Text fontSize="sm">
                Creating Event contract + TicketNFT contract with burn functionality.
                This enables permanent ticket destruction at venue for 100% security.
              </Text>
            </VStack>
          </Alert>
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

        <form onSubmit={handleSubmit}>
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
                  onClick={addTier}
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
                          onChange={(_, val) => handleTierChange(index, 'price', val || 0)}
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
            <Box bg="gradient-to-r from-purple-50 to-pink-50" p={6} borderRadius="xl" border="2px" borderColor="purple.200">
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
                isDisabled={!eventData.name || !eventData.date || !eventData.venue}
                leftIcon={<Text>🚀</Text>}
                borderRadius="full"
                py={6}
              >
                Deploy Event Contract to Lisk Sepolia
              </Button>

              <Text fontSize="sm" color="gray.500" textAlign="center" maxW="md">
                This will deploy smart contracts for your event with NFT burn functionality.
                Gas fees are paid automatically by the platform.
              </Text>
            </VStack>
          </VStack>
        </form>
      </VStack>
    </Container>
  );
};

export default CreateEvent;