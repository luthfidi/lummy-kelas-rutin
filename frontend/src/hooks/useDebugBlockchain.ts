// src/hooks/useDebugBlockchain.ts - Debugging helper
import { useAccount, useReadContract, useChainId } from 'wagmi';
import { CONTRACT_ADDRESSES } from '../config/wagmi';
import EventFactoryABI from '../contracts/abi/EventFactory.json';
import { useEffect } from 'react';

export function useDebugBlockchain() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();

  // Test EventFactory contract
  const { 
    data: eventCount, 
    isLoading: isLoadingCount,
    error: countError,
    isSuccess: isCountSuccess 
  } = useReadContract({
    address: CONTRACT_ADDRESSES.EventFactory,
    abi: EventFactoryABI,
    functionName: 'getEventCount',
    query: {
      retry: 2,
      refetchOnWindowFocus: false,
    }
  });

  const { 
    data: eventAddresses, 
    isLoading: isLoadingAddresses,
    error: addressError,
    isSuccess: isAddressSuccess 
  } = useReadContract({
    address: CONTRACT_ADDRESSES.EventFactory,
    abi: EventFactoryABI,
    functionName: 'getEvents',
    query: {
      retry: 2,
      refetchOnWindowFocus: false,
    }
  });

  // Debug logging
  useEffect(() => {
    console.log('🔍 BLOCKCHAIN DEBUG INFO:');
    console.log('─'.repeat(50));
    console.log('Wallet Connected:', isConnected);
    console.log('Wallet Address:', address);
    console.log('Chain ID:', chainId);
    console.log('Expected Chain:', 31337);
    console.log('─'.repeat(50));
    console.log('EventFactory Address:', CONTRACT_ADDRESSES.EventFactory);
    console.log('Event Count:', eventCount?.toString());
    console.log('Event Count Loading:', isLoadingCount);
    console.log('Event Count Success:', isCountSuccess);
    console.log('Event Count Error:', countError?.message);
    console.log('─'.repeat(50));
    console.log('Event Addresses:', eventAddresses);
    console.log('Addresses Loading:', isLoadingAddresses);
    console.log('Addresses Success:', isAddressSuccess);
    console.log('Addresses Error:', addressError?.message);
    console.log('─'.repeat(50));
    
    if (countError) {
      console.error('❌ EventFactory.getEventCount() failed:', countError);
    }
    
    if (addressError) {
      console.error('❌ EventFactory.getEvents() failed:', addressError);
    }
    
    if (isCountSuccess && eventCount !== undefined) {
      console.log('✅ EventFactory.getEventCount() success:', (eventCount as bigint | number).toString());
    }
    
    if (isAddressSuccess && Array.isArray(eventAddresses)) {
      console.log('✅ EventFactory.getEvents() success:', eventAddresses.length, 'events');
      (eventAddresses as string[]).forEach((addr: string, i: number) => {
        console.log(`  ${i + 1}. ${addr}`);
      });
    }
  }, [
    isConnected,
    address,
    chainId,
    eventCount,
    isLoadingCount,
    isCountSuccess,
    countError,
    eventAddresses,
    isLoadingAddresses,
    isAddressSuccess,
    addressError
  ]);

  return {
    isConnected,
    address,
    chainId,
    eventCount,
    eventAddresses,
    isLoadingCount,
    isLoadingAddresses,
    countError,
    addressError,
    isCountSuccess,
    isAddressSuccess,
  };
}