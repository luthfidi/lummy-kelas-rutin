// src/contracts/abis.ts - UPDATED WITH REAL CONTRACT ABIs

// Import the actual ABI files generated from contracts
import AccessControlABIJson from "./abi/AccessControl.json";
import EventFactoryABIJson from "./abi/EventFactory.json";
import SimpleEventFactoryABIJson from "./abi/SimpleEventFactory.json";
import EventABIJson from "./abi/Event.json";
import TicketNFTABIJson from "./abi/TicketNFT.json";
import MockIDRXABIJson from "./abi/MockIDRX.json";

// Export with proper const assertion for wagmi
export const AccessControlABI = AccessControlABIJson as readonly any[];
export const EventFactoryABI = EventFactoryABIJson as readonly any[];
export const SimpleEventFactoryABI = SimpleEventFactoryABIJson as readonly any[];
export const EventABI = EventABIJson as readonly any[];
export const TicketNFTABI = TicketNFTABIJson as readonly any[];
export const MockIDRXABI = MockIDRXABIJson as readonly any[];

// Helper function to get the right EventFactory ABI based on your deployment
export const getEventFactoryABI = (useSimple: boolean = true) => {
  return useSimple ? SimpleEventFactoryABI : EventFactoryABI;
};

// Export all ABIs as a single object for easier imports
export const ContractABIs = {
  AccessControl: AccessControlABI,
  EventFactory: EventFactoryABI,
  SimpleEventFactory: SimpleEventFactoryABI,
  Event: EventABI,
  TicketNFT: TicketNFTABI,
  MockIDRX: MockIDRXABI,
} as const;

// Debug function to log ABI info
export const logABIInfo = () => {
  console.log("📋 ABI Information:");
  console.log(
    "AccessControl functions:",
    AccessControlABI.filter((item: any) => item.type === "function").length
  );
  console.log(
    "EventFactory functions:",
    EventFactoryABI.filter((item) => item.type === "function").length
  );
  console.log(
    "SimpleEventFactory functions:",
    SimpleEventFactoryABI.filter((item) => item.type === "function").length
  );
  console.log(
    "Event functions:",
    EventABI.filter((item) => item.type === "function").length
  );
  console.log(
    "TicketNFT functions:",
    TicketNFTABI.filter((item) => item.type === "function").length
  );
  console.log(
    "MockIDRX functions:",
    MockIDRXABI.filter((item) => item.type === "function").length
  );
};
