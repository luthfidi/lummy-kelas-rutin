// src/components/DebugPanel.tsx - FIXED VERSION
import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Alert,
  AlertIcon,
  Divider,
  useToast,
} from '@chakra-ui/react';
import { useDebugBlockchain } from '../hooks/useDebugBlockchain';
import { CONTRACT_ADDRESSES, logContractAddresses } from '../config/wagmi';

type DebugBlockchainResult = {
  isConnected: boolean;
  address?: string;
  chainId?: number;
  eventCount?: number;
  eventAddresses?: string[];
  isLoadingCount: boolean;
  isLoadingAddresses: boolean;
  countError?: { message: string };
  addressError?: { message: string };
  isCountSuccess: boolean;
  isAddressSuccess: boolean;
};

const DebugPanel: React.FC = () => {
  const toast = useToast();
  const {
    isConnected,
    address,
    chainId,
    eventAddresses,
    isLoadingAddresses,
    countError,
    addressError,
  } = useDebugBlockchain() as DebugBlockchainResult;

  return (
    <Box bg="gray.100" p={4} borderRadius="lg" fontSize="sm">
      <Text fontWeight="bold" mb={3}>🔍 Debug Panel</Text>
      
      <VStack spacing={3} align="stretch">
        {/* Connection Status */}
        <HStack justify="space-between">
          <Text>Wallet Connected:</Text>
          <Badge colorScheme={isConnected ? 'green' : 'red'}>
            {isConnected ? 'YES' : 'NO'}
          </Badge>
        </HStack>

        {address && (
          <HStack justify="space-between">
            <Text>Address:</Text>
            <Text fontFamily="monospace" fontSize="xs">
              {address.slice(0, 8)}...{address.slice(-6)}
            </Text>
          </HStack>
        )}

        <HStack justify="space-between">
          <Text>Chain ID:</Text>
          <Badge colorScheme={chainId === 31337 ? 'green' : 'yellow'}>
            {chainId}
          </Badge>
        </HStack>

        <Divider />

        {/* Contract Status */}
        <Text fontWeight="bold">📋 Contract Status:</Text>
        
        <HStack justify="space-between">
          <Text>EventFactory:</Text>
          <Text fontFamily="monospace" fontSize="xs">
            {isLoadingAddresses
              ? 'Loading...'
              : Array.isArray(eventAddresses)
                ? eventAddresses.length.toString()
                : 'N/A'
            }
          </Text>
        </HStack>

        {/* Errors */}
        {countError && typeof countError === 'object' && (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            <VStack align="start" spacing={1}>
              <Text fontSize="xs" fontWeight="bold">Count Error:</Text>
              <Text fontSize="xs">{(countError as { message: string }).message}</Text>
            </VStack>
          </Alert>
        )}

        {addressError && typeof addressError === 'object' && (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            <VStack align="start" spacing={1}>
              <Text fontSize="xs" fontWeight="bold">Address Error:</Text>
              <Text fontSize="xs">{(addressError as { message: string }).message}</Text>
            </VStack>
          </Alert>
        )}

        {/* Success Info */}
        {Array.isArray(eventAddresses) && eventAddresses.length > 0 && (
          <Alert status="success" borderRadius="md">
            <AlertIcon />
            <Text fontSize="xs">
              ✅ Found {eventAddresses.length} event contract(s)
            </Text>
          </Alert>
        )}

        {/* Event Addresses List */}
        {Array.isArray(eventAddresses) && eventAddresses.length > 0 && (
          <>
            <Divider />
            <Text fontWeight="bold" fontSize="xs">Event Addresses:</Text>
            <VStack spacing={1} align="stretch">
              {eventAddresses.slice(0, 5).map((addr: string, i: number) => (
                <Text key={addr} fontFamily="monospace" fontSize="xs" color="gray.600">
                  #{i + 1}: {addr}
                </Text>
              ))}
              {eventAddresses.length > 5 && (
                <Text fontSize="xs" color="gray.500">
                  ... and {eventAddresses.length - 5} more
                </Text>
              )}
            </VStack>
          </>
        )}
      </VStack>
    </Box>
  );
};

export default DebugPanel;