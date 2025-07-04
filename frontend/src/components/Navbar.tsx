// src/components/Navbar.tsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Box,
  Container,
  Flex,
  Heading,
  HStack,
  Button,
  Text,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  Badge,
  useToast,
} from '@chakra-ui/react';

const Navbar: React.FC = () => {
  const location = useLocation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [balance, setBalance] = useState('1,250');
  const toast = useToast();

  const isActive = (path: string) => location.pathname === path;

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const handleConnect = () => {
    // Simulate wallet connection
    setTimeout(() => {
      const mockAddress = '0x742d35Cc6634C0532925a3b8D2C5DEB4C12345678';
      setWalletAddress(mockAddress);
      setIsConnected(true);
      setBalance('1,250');
      
      toast({
        title: 'Wallet Connected!',
        description: `Connected to ${formatAddress(mockAddress)}`,
        status: 'success',
        duration: 3000,
      });
      
      onClose();
    }, 1000);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setWalletAddress('');
    setBalance('0');
    
    toast({
      title: 'Wallet Disconnected',
      status: 'info',
      duration: 2000,
    });
  };

  return (
    <Box bg="white" borderBottom="2px" borderColor="purple.100" py={4} position="sticky" top={0} zIndex={100}>
      <Container maxW="container.xl">
        <Flex justify="space-between" align="center">
          {/* Logo */}
          <Link to="/">
            <HStack spacing={2}>
              <Text fontSize="3xl">🔥</Text>
              <Heading 
                size="xl" 
                bgGradient="linear(to-r, purple.600, pink.600)" 
                bgClip="text"
                fontWeight="bold"
              >
                Lummy
              </Heading>
              <Badge colorScheme="purple" variant="outline" fontSize="xs">
                Burn NFT
              </Badge>
            </HStack>
          </Link>

          {/* Navigation Links */}
          <HStack spacing={8}>
            <Link to="/">
              <Text
                fontWeight={isActive('/') ? 'bold' : 'medium'}
                color={isActive('/') ? 'purple.600' : 'gray.600'}
                _hover={{ color: 'purple.600' }}
                transition="color 0.2s"
              >
                🏠 Events
              </Text>
            </Link>
            <Link to="/tickets">
              <Text
                fontWeight={isActive('/tickets') ? 'bold' : 'medium'}
                color={isActive('/tickets') ? 'purple.600' : 'gray.600'}
                _hover={{ color: 'purple.600' }}
                transition="color 0.2s"
              >
                🎫 My Tickets
              </Text>
            </Link>
            <Link to="/create">
              <Text
                fontWeight={isActive('/create') ? 'bold' : 'medium'}
                color={isActive('/create') ? 'purple.600' : 'gray.600'}
                _hover={{ color: 'purple.600' }}
                transition="color 0.2s"
              >
                ➕ Create Event
              </Text>
            </Link>
          </HStack>

          {/* Wallet Section */}
          {isConnected && walletAddress ? (
            <HStack spacing={3}>
              <VStack spacing={0} align="end">
                <HStack>
                  <Badge colorScheme="green" variant="subtle" borderRadius="full">
                    🟢 Connected
                  </Badge>
                  <Text fontSize="sm" fontWeight="bold" fontFamily="monospace">
                    {formatAddress(walletAddress)}
                  </Text>
                </HStack>
                <HStack>
                  <Text fontSize="xs" color="blue.600" fontWeight="medium">
                    {balance} IDRX
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    • Lisk Sepolia
                  </Text>
                </HStack>
              </VStack>
              <Button 
                size="sm" 
                variant="outline" 
                colorScheme="red"
                onClick={handleDisconnect}
              >
                Disconnect
              </Button>
            </HStack>
          ) : (
            <Button 
              colorScheme="purple" 
              onClick={onOpen}
              leftIcon={<Text>🔗</Text>}
              borderRadius="full"
              px={6}
            >
              Connect Wallet
            </Button>
          )}
        </Flex>
      </Container>

      {/* Wallet Connect Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent>
          <ModalHeader textAlign="center">
            <VStack spacing={2}>
              <Text fontSize="2xl">🔗</Text>
              <Text>Connect Wallet</Text>
            </VStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <Text color="gray.600" textAlign="center" fontSize="sm">
                Connect your wallet to purchase NFT tickets and participate in the burn system
              </Text>
              
              {/* Mock wallet options */}
              <VStack spacing={3} width="100%">
                <Button
                  onClick={handleConnect}
                  width="100%"
                  variant="outline"
                  leftIcon={<Text>🦊</Text>}
                  _hover={{ bg: 'orange.50', borderColor: 'orange.300' }}
                >
                  MetaMask
                </Button>
                
                <Button
                  onClick={handleConnect}
                  width="100%"
                  variant="outline"
                  leftIcon={<Text>🔗</Text>}
                  _hover={{ bg: 'blue.50', borderColor: 'blue.300' }}
                >
                  WalletConnect
                </Button>
                
                <Button
                  onClick={handleConnect}
                  width="100%"
                  variant="outline"
                  leftIcon={<Text>🌟</Text>}
                  _hover={{ bg: 'purple.50', borderColor: 'purple.300' }}
                >
                  Xellar Wallet
                </Button>
              </VStack>
              
              <Box bg="blue.50" p={4} borderRadius="lg" width="100%">
                <VStack spacing={2}>
                  <Text fontWeight="bold" color="blue.800" fontSize="sm">
                    🔥 NFT Burn System
                  </Text>
                  <Text color="blue.700" fontSize="xs" textAlign="center">
                    Your tickets are NFTs that get permanently destroyed when used at venues.
                    This eliminates duplicates and ensures 100% authenticity.
                  </Text>
                </VStack>
              </Box>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Navbar;