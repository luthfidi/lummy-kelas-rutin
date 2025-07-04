// src/data/mockData.ts

export interface MockEvent {
  address: string;
  name: string;
  description: string;
  date: number;
  venue: string;
  organizer: string;
  imageUrl: string;
  tiers: MockTier[];
}

export interface MockTier {
  id: number;
  name: string;
  price: number; // in wei (IDRX)
  available: number;
  sold: number;
  maxPerPurchase: number;
  description: string;
}

export interface MockTicket {
  tokenId: number;
  eventAddress: string;
  eventName: string;
  tierName: string;
  isUsed: boolean;
  owner: string;
}

// Mock Events Data
export const mockEvents: MockEvent[] = [
  {
    address: '0x1234567890123456789012345678901234567890',
    name: 'Summer Music Festival',
    description: 'Join us for an amazing 3-day music festival featuring top artists from around the world. Experience the best of electronic, rock, and pop music.',
    date: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 days from now
    venue: 'Jakarta Convention Center',
    organizer: '0xabcd1234567890123456789012345678901234abcd',
    imageUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=600&h=400&fit=crop',
    tiers: [
      {
        id: 0,
        name: 'General Admission',
        price: 250000, // 250k IDRX in wei
        available: 300,
        sold: 150,
        maxPerPurchase: 4,
        description: 'Standard festival access with general viewing areas'
      },
      {
        id: 1,
        name: 'VIP Pass',
        price: 500000, // 500k IDRX in wei
        available: 100,
        sold: 30,
        maxPerPurchase: 2,
        description: 'Premium experience with VIP lounge and priority viewing'
      },
      {
        id: 2,
        name: 'Backstage Experience',
        price: 1000000, // 1M IDRX in wei
        available: 50,
        sold: 5,
        maxPerPurchase: 1,
        description: 'Ultimate access including backstage tour and meet & greet'
      }
    ]
  },
  {
    address: '0x2345678901234567890123456789012345678901',
    name: 'Tech Conference 2025',
    description: 'The biggest technology conference in Southeast Asia. Learn about AI, blockchain, and the future of tech.',
    date: Date.now() + (45 * 24 * 60 * 60 * 1000), // 45 days from now
    venue: 'Bandung Digital Hub',
    organizer: '0xefgh5678901234567890123456789012345678efgh',
    imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=400&fit=crop',
    tiers: [
      {
        id: 0,
        name: 'Standard Access',
        price: 150000, // 150k IDRX
        available: 250,
        sold: 200,
        maxPerPurchase: 5,
        description: 'Full conference access and networking lunch'
      },
      {
        id: 1,
        name: 'Premium Access',
        price: 300000, // 300k IDRX
        available: 150,
        sold: 80,
        maxPerPurchase: 2,
        description: 'Priority seating and exclusive workshop access'
      }
    ]
  },
  {
    address: '0x3456789012345678901234567890123456789012',
    name: 'Blockchain Workshop',
    description: 'Hands-on workshop to learn blockchain development and smart contract programming.',
    date: Date.now() + (15 * 24 * 60 * 60 * 1000), // 15 days from now
    venue: 'Blockchain Center Jakarta',
    organizer: '0xijkl9012345678901234567890123456789012ijkl',
    imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=400&fit=crop',
    tiers: [
      {
        id: 0,
        name: 'Workshop Ticket',
        price: 100000, // 100k IDRX
        available: 80,
        sold: 65,
        maxPerPurchase: 3,
        description: 'Full workshop access with materials'
      },
      {
        id: 1,
        name: 'Workshop + Certification',
        price: 200000, // 200k IDRX
        available: 20,
        sold: 10,
        maxPerPurchase: 1,
        description: 'Workshop access plus blockchain developer certification'
      }
    ]
  },
  {
    address: '0x4567890123456789012345678901234567890123',
    name: 'Art Exhibition: Digital Future',
    description: 'Explore the intersection of art and technology in this immersive digital art exhibition.',
    date: Date.now() + (60 * 24 * 60 * 60 * 1000), // 60 days from now
    venue: 'Modern Gallery Surabaya',
    organizer: '0xmnop3456789012345678901234567890123456mnop',
    imageUrl: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=600&h=400&fit=crop',
    tiers: [
      {
        id: 0,
        name: 'Standard Entry',
        price: 75000, // 75k IDRX
        available: 200,
        sold: 120,
        maxPerPurchase: 5,
        description: 'General exhibition access'
      },
      {
        id: 1,
        name: 'Premium Experience',
        price: 150000, // 150k IDRX
        available: 50,
        sold: 25,
        maxPerPurchase: 2,
        description: 'Guided tour and exclusive artist talk'
      }
    ]
  },
  {
    address: '0x5678901234567890123456789012345678901234',
    name: 'Food Festival Jakarta',
    description: 'Taste the best culinary delights from around Indonesia and the world.',
    date: Date.now() + (20 * 24 * 60 * 60 * 1000), // 20 days from now
    venue: 'Senayan Park',
    organizer: '0xqrst7890123456789012345678901234567890qrst',
    imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&h=400&fit=crop',
    tiers: [
      {
        id: 0,
        name: 'Food Lover Pass',
        price: 120000, // 120k IDRX
        available: 500,
        sold: 350,
        maxPerPurchase: 4,
        description: 'Access to all food stalls with 5 tasting tokens'
      },
      {
        id: 1,
        name: 'Gourmet Experience',
        price: 300000, // 300k IDRX
        available: 100,
        sold: 45,
        maxPerPurchase: 2,
        description: 'Premium tastings and chef demonstrations'
      }
    ]
  }
];

// Mock Tickets Data
export const mockTickets: MockTicket[] = [
  {
    tokenId: 123,
    eventAddress: '0x1234567890123456789012345678901234567890',
    eventName: 'Summer Music Festival',
    tierName: 'VIP Pass',
    isUsed: false,
    owner: '0x742d35Cc6634C0532925a3b8D2C5DEB4C'
  },
  {
    tokenId: 456,
    eventAddress: '0x2345678901234567890123456789012345678901',
    eventName: 'Tech Conference 2025',
    tierName: 'Standard Access',
    isUsed: false,
    owner: '0x742d35Cc6634C0532925a3b8D2C5DEB4C'
  },
  {
    tokenId: 789,
    eventAddress: '0x3456789012345678901234567890123456789012',
    eventName: 'Blockchain Workshop',
    tierName: 'Workshop + Certification',
    isUsed: true, // This one has been burned
    owner: '0x742d35Cc6634C0532925a3b8D2C5DEB4C'
  },
  {
    tokenId: 101,
    eventAddress: '0x4567890123456789012345678901234567890123',
    eventName: 'Art Exhibition: Digital Future',
    tierName: 'Premium Experience',
    isUsed: false,
    owner: '0x742d35Cc6634C0532925a3b8D2C5DEB4C'
  }
];

// Helper functions
export const getEventByAddress = (address: string): MockEvent | undefined => {
  return mockEvents.find(event => event.address.toLowerCase() === address.toLowerCase());
};

export const getTicketsByOwner = (owner: string): MockTicket[] => {
  return mockTickets.filter(ticket => ticket.owner.toLowerCase() === owner.toLowerCase());
};

export const getTicketsByEvent = (eventAddress: string): MockTicket[] => {
  return mockTickets.filter(ticket => ticket.eventAddress.toLowerCase() === eventAddress.toLowerCase());
};

// Format helpers
export const formatPrice = (priceInWei: number): string => {
  return (priceInWei / 100000).toFixed(0);
};

export const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatDateTime = (timestamp: number): string => {
  return new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};