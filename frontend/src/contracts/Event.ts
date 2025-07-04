// src/contracts/Event.ts
export const EventABI = [
  {
    "inputs": [
      { "internalType": "uint256", "name": "tierId", "type": "uint256" },
      { "internalType": "uint256", "name": "quantity", "type": "uint256" }
    ],
    "name": "purchaseTicket",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }],
    "name": "checkInAndBurn",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "name", "type": "string" },
      { "internalType": "uint256", "name": "price", "type": "uint256" },
      { "internalType": "uint256", "name": "available", "type": "uint256" },
      { "internalType": "uint256", "name": "maxPerPurchase", "type": "uint256" }
    ],
    "name": "addTicketTier",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getEventDetails",
    "outputs": [
      { "internalType": "string", "name": "name", "type": "string" },
      { "internalType": "string", "name": "description", "type": "string" },
      { "internalType": "uint256", "name": "date", "type": "uint256" },
      { "internalType": "string", "name": "venue", "type": "string" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "tierCount",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "index", "type": "uint256" }],
    "name": "ticketTiers",
    "outputs": [
      { "internalType": "string", "name": "name", "type": "string" },
      { "internalType": "uint256", "name": "price", "type": "uint256" },
      { "internalType": "uint256", "name": "available", "type": "uint256" },
      { "internalType": "uint256", "name": "sold", "type": "uint256" },
      { "internalType": "uint256", "name": "maxPerPurchase", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;