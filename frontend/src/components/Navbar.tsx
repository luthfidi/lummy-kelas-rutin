// src/components/Navbar.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Box,
  Container,
  Flex,
  Heading,
  HStack,
  Button,
  Text,
  VStack,
  Badge,
  useToast,
} from '@chakra-ui/react';
import { useAccount, useConnect, useDisconnect, useChainId } from 'wagmi';
import { injected, walletConnect } from 'wagmi/connectors';
import { useUserRole, useIDRXBalance, formatIDRXCompact } from '../hooks/useBlockchain';

const Navbar: React.FC = () => {
  const location = useLocation();
  const chainId = useChainId();
  const { address, isConnected, isConnecting } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const toast = useToast();

  // Get user role and IDRX balance
  const userRole = useUserRole();
  const { data: balance } = useIDRXBalance();

  const isActive = (path: string) => location.pathname === path;

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const getNetworkName = (chainId: number) => {
    switch (chainId) {
      case 31337:
        return 'Anvil Local';
      case 4202:
        return 'Lisk Sepolia';
      default:
        return `Chain ${chainId}`;
    }
  };

  const getRoleColor = (role: string | null) => {
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
  };

  const handleConnect = async (connectorType: 'injected' | 'walletConnect') => {
    try {
      const connector = connectorType === 'injected' ? injected() : walletConnect({
        projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'd2fcae952e3bd7b4e51fb295883cacdf',
      });
      
      await connect({ connector });
      
      toast({
        title: 'Wallet Connected!',
        description: 'Successfully connected to blockchain',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      console.error('Connection error:', error);
      toast({
        title: 'Connection Failed',
        description: 'Failed to connect wallet. Please try again.',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleDisconnect = () => {
    disconnect();
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
            
            {/* Role-based navigation */}
            {userRole === 'organizer' && (
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
            )}
            
            {userRole === 'staff' && (
              <Link to="/scanner">
                <Text
                  fontWeight={isActive('/scanner') ? 'bold' : 'medium'}
                  color={isActive('/scanner') ? 'purple.600' : 'gray.600'}
                  _hover={{ color: 'purple.600' }}
                  transition="color 0.2s"
                >
                  🔍 Scanner
                </Text>
              </Link>
            )}
            
            {userRole === 'admin' && (
              <Link to="/admin">
                <Text
                  fontWeight={isActive('/admin') ? 'bold' : 'medium'}
                  color={isActive('/admin') ? 'purple.600' : 'gray.600'}
                  _hover={{ color: 'purple.600' }}
                  transition="color 0.2s"
                >
                  🔑 Admin
                </Text>
              </Link>
            )}
          </HStack>

          {/* Wallet Section */}
          {isConnected && address ? (
            <HStack spacing={3}>
              <VStack spacing={0} align="end">
                <HStack spacing={2}>
                  <Badge 
                    colorScheme="green" 
                    variant="subtle" 
                    borderRadius="full"
                    fontSize="xs"
                  >
                    🟢 Connected
                  </Badge>
                  
                  {userRole && (
                    <Badge 
                      colorScheme={getRoleColor(userRole)} 
                      variant="solid" 
                      borderRadius="full"
                      fontSize="xs"
                      textTransform="capitalize"
                    >
                      {userRole}
                    </Badge>
                  )}
                  
                  <Text fontSize="sm" fontWeight="bold" fontFamily="monospace">
                    {formatAddress(address)}
                  </Text>
                </HStack>
                
                <HStack spacing={2}>
                  <Text fontSize="xs" color="blue.600" fontWeight="medium">
                    {balance ? formatIDRXCompact(balance) : '0'} IDRX
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    • {getNetworkName(chainId)}
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
            <HStack spacing={2}>
              {isConnecting && (
                <Text fontSize="sm" color="gray.500">
                  Connecting...
                </Text>
              )}
              
              <Button 
                colorScheme="purple" 
                onClick={() => handleConnect('injected')}
                leftIcon={<Text>🦊</Text>}
                borderRadius="full"
                px={6}
                isLoading={isConnecting}
                loadingText="Connecting..."
              >
                Connect Wallet
              </Button>
              
              <Button 
                variant="outline"
                colorScheme="purple" 
                onClick={() => handleConnect('walletConnect')}
                leftIcon={<Text>🔗</Text>}
                borderRadius="full"
                px={4}
                isLoading={isConnecting}
                size="md"
              >
                WC
              </Button>
            </HStack>
          )}
        </Flex>
      </Container>

      {/* Network Warning */}
      {isConnected && chainId !== 31337 && chainId !== 4202 && (
        <Box bg="orange.100" py={2}>
          <Container maxW="container.xl">
            <Text fontSize="sm" color="orange.800" textAlign="center">
              ⚠️ Unsupported network. Please switch to Anvil Local (31337) or Lisk Sepolia (4202)
            </Text>
          </Container>
        </Box>
      )}
    </Box>
  );
};

export default Navbar;