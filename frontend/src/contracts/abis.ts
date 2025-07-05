// src/contracts/abis.ts - All contract ABIs in one file

// AccessControl ABI
export const AccessControlABI = [
  {
    type: "constructor",
    inputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "addOrganizer",
    inputs: [{ name: "organizer", type: "address", internalType: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "addStaff",
    inputs: [{ name: "staff", type: "address", internalType: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "authorizedOrganizers",
    inputs: [{ name: "", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getOrganizers",
    inputs: [],
    outputs: [{ name: "", type: "address[]", internalType: "address[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "isAuthorizedOrganizer",
    inputs: [{ name: "organizer", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "owner",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
] as const;

// EventFactory ABI (using SimpleEventFactory based on your code)
export const EventFactoryABI = [
  {
    type: "constructor",
    inputs: [
      { name: "_accessControl", type: "address", internalType: "address" },
      { name: "_idrxToken", type: "address", internalType: "address" },
      { name: "", type: "address", internalType: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "createEvent",
    inputs: [
      {
        name: "params",
        type: "tuple",
        internalType: "struct IEventFactory.EventParams",
        components: [
          { name: "name", type: "string", internalType: "string" },
          { name: "description", type: "string", internalType: "string" },
          { name: "date", type: "uint256", internalType: "uint256" },
          { name: "venue", type: "string", internalType: "string" },
          { name: "ipfsMetadata", type: "string", internalType: "string" },
        ],
      },
    ],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getEvents",
    inputs: [],
    outputs: [{ name: "", type: "address[]", internalType: "address[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getEventCount",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "isAuthorizedOrganizer",
    inputs: [{ name: "organizer", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "EventCreated",
    inputs: [
      {
        name: "eventAddress",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "organizer",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      { name: "name", type: "string", indexed: false, internalType: "string" },
      {
        name: "date",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
] as const;

// Event ABI
export const EventABI = [
  {
    type: "function",
    name: "getEventDetails",
    inputs: [],
    outputs: [
      { name: "name", type: "string", internalType: "string" },
      { name: "desc", type: "string", internalType: "string" },
      { name: "date", type: "uint256", internalType: "uint256" },
      { name: "venueLocation", type: "string", internalType: "string" },
      { name: "eventOrganizer", type: "address", internalType: "address" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "addTicketTier",
    inputs: [
      { name: "name", type: "string", internalType: "string" },
      { name: "price", type: "uint256", internalType: "uint256" },
      { name: "available", type: "uint256", internalType: "uint256" },
      { name: "maxPerPurchase", type: "uint256", internalType: "uint256" },
      { name: "tierDescription", type: "string", internalType: "string" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "purchaseTicket",
    inputs: [
      { name: "tierId", type: "uint256", internalType: "uint256" },
      { name: "quantity", type: "uint256", internalType: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getTierDetails",
    inputs: [{ name: "tierId", type: "uint256", internalType: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct IEvent.TicketTier",
        components: [
          { name: "name", type: "string", internalType: "string" },
          { name: "price", type: "uint256", internalType: "uint256" },
          { name: "available", type: "uint256", internalType: "uint256" },
          { name: "sold", type: "uint256", internalType: "uint256" },
          { name: "maxPerPurchase", type: "uint256", internalType: "uint256" },
          { name: "description", type: "string", internalType: "string" },
          { name: "isActive", type: "bool", internalType: "bool" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "tierCount",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getTotalSold",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getTicketNFTAddress",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "checkInAndBurn",
    inputs: [{ name: "tokenId", type: "uint256", internalType: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "isAuthorizedStaff",
    inputs: [{ name: "staff", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "addAuthorizedStaff",
    inputs: [{ name: "staff", type: "address", internalType: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getBurnHistory",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        internalType: "struct IEvent.BurnRecord[]",
        components: [
          { name: "tokenId", type: "uint256", internalType: "uint256" },
          { name: "attendee", type: "address", internalType: "address" },
          { name: "burnedBy", type: "address", internalType: "address" },
          { name: "timestamp", type: "uint256", internalType: "uint256" },
          { name: "tierId", type: "uint256", internalType: "uint256" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "TicketPurchased",
    inputs: [
      {
        name: "buyer",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "tokenId",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "tierId",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "quantity",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
] as const;

// TicketNFT ABI
export const TicketNFTABI = [
  {
    type: "function",
    name: "balanceOf",
    inputs: [{ name: "owner", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "tokenOfOwnerByIndex",
    inputs: [
      { name: "owner", type: "address", internalType: "address" },
      { name: "index", type: "uint256", internalType: "uint256" },
    ],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getTicketMetadata",
    inputs: [{ name: "tokenId", type: "uint256", internalType: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct ITicketNFT.TicketMetadata",
        components: [
          { name: "tierId", type: "uint256", internalType: "uint256" },
          { name: "originalOwner", type: "address", internalType: "address" },
          { name: "currentOwner", type: "address", internalType: "address" },
          { name: "mintTimestamp", type: "uint256", internalType: "uint256" },
          { name: "burnTimestamp", type: "uint256", internalType: "uint256" },
          { name: "burnedBy", type: "address", internalType: "address" },
          { name: "isUsed", type: "bool", internalType: "bool" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "transferFrom",
    inputs: [
      { name: "from", type: "address", internalType: "address" },
      { name: "to", type: "address", internalType: "address" },
      { name: "tokenId", type: "uint256", internalType: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "ownerOf",
    inputs: [{ name: "tokenId", type: "uint256", internalType: "uint256" }],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "isTicketValid",
    inputs: [{ name: "tokenId", type: "uint256", internalType: "uint256" }],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "isBurned",
    inputs: [{ name: "tokenId", type: "uint256", internalType: "uint256" }],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getTicketsByOwner",
    inputs: [{ name: "owner", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "uint256[]", internalType: "uint256[]" }],
    stateMutability: "view",
  },
] as const;

// MockIDRX ABI
export const MockIDRXABI = [
  {
    type: "constructor",
    inputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "allowance",
    inputs: [
      { name: "owner", type: "address", internalType: "address" },
      { name: "spender", type: "address", internalType: "address" },
    ],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "approve",
    inputs: [
      { name: "spender", type: "address", internalType: "address" },
      { name: "value", type: "uint256", internalType: "uint256" },
    ],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "balanceOf",
    inputs: [{ name: "account", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "transfer",
    inputs: [
      { name: "to", type: "address", internalType: "address" },
      { name: "value", type: "uint256", internalType: "uint256" },
    ],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "transferFrom",
    inputs: [
      { name: "from", type: "address", internalType: "address" },
      { name: "to", type: "address", internalType: "address" },
      { name: "value", type: "uint256", internalType: "uint256" },
    ],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "faucet",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "decimals",
    inputs: [],
    outputs: [{ name: "", type: "uint8", internalType: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "totalSupply",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "Transfer",
    inputs: [
      { name: "from", type: "address", indexed: true, internalType: "address" },
      { name: "to", type: "address", indexed: true, internalType: "address" },
      {
        name: "value",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "Approval",
    inputs: [
      {
        name: "owner",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "spender",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "value",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
] as const;
