# Lummy Burn NFT - Smart Contracts

🔥 **Revolutionary NFT ticketing system that permanently destroys tickets when used - eliminating duplicates forever!**

## 🎯 Overview

Lummy Burn NFT is a blockchain-based ticketing system where tickets are NFTs that get permanently **burned** (destroyed) when used at venues. This creates a 100% fraud-proof system with zero possibility of duplicate tickets.

### 🔥 How NFT Burn Works:
1. **Purchase** → NFT ticket minted to your wallet
2. **At Venue** → Staff scans your wallet address  
3. **Burn NFT** → Ticket permanently destroyed on blockchain
4. **Entry Granted** → Ticket can never be used again

## 🏗️ Architecture

### **Core Contracts:**
- **`AccessControl.sol`** - Role-based permission system (Admin, Organizers, Staff)
- **`EventFactory.sol`** - Factory for creating new events 
- **`Event.sol`** - Individual event logic with ticket management
- **`TicketNFT.sol`** - ERC721 NFT with burn functionality

### **Role System:**
- **🔑 Admin** - Platform owner, manages organizers
- **🎪 Organizers** - Create events, manage staff per event  
- **👮 Staff** - Venue personnel who can scan & burn tickets
- **🛒 Buyers** - Regular users who purchase tickets

## 🚀 Quick Start

### Prerequisites
- [Foundry](https://book.getfoundry.sh/getting-started/installation)
- [Make](https://www.gnu.org/software/make/)
- [Python 3](https://www.python.org/) (for frontend integration)

### Installation
```bash
git clone <repository>
cd lummy-burn-nft-contracts
make install
```

### Local Development
```bash
# Start local blockchain
make anvil

# In another terminal - deploy contracts
make dev-deploy

# Check everything is working
make check-balances
```

### Production Deployment (Lisk Sepolia)
```bash
# Set up environment variables
cp .env.example .env
# Edit .env with your private keys

# Deploy to Lisk Sepolia
make production-deploy
```

## 🧪 Testing

```bash
# Run all tests
make test

# Run with coverage
make test-coverage

# Run specific test types
make test-unit        # Unit tests only
make test-integration # Integration tests only

# Gas reporting
make test-gas
```

## 📝 Test Wallets

The system uses 5 pre-defined wallets for role-based testing:

| Role | Address | Purpose |
|------|---------|---------|
| 🔑 Admin | `0x580B...CaE3d` | Platform management |
| 🎪 Organizer | `0x5B38...ddC4` | Event creation |
| 👮 Staff | `0xAb84...5cb2` | Venue operations |  
| 🛒 Buyer 1 | `0x4B20...C02db` | Ticket purchases |
| 🛒 Buyer 2 | `0x7873...cabaB` | Ticket purchases |

## 🎮 Usage Examples

### 1. Admin Setup
```bash
# Deploy contracts (admin becomes owner)
make deploy-lisk

# Add organizer
forge script script/AddOrganizer.s.sol --broadcast
```

### 2. Create Event (Organizer)
```solidity
// Create event via EventFactory
EventParams memory params = EventParams({
    name: "Summer Music Festival",
    description: "3-day music festival",
    date: block.timestamp + 30 days,
    venue: "Jakarta Convention Center", 
    ipfsMetadata: "QmHash..."
});

address eventAddress = eventFactory.createEvent(params);
```

### 3. Setup Ticket Tiers (Organizer)
```solidity
Event event = Event(eventAddress);

// Add staff for venue
event.addAuthorizedStaff(staffAddress);

// Add ticket tiers
event.addTicketTier(
    "VIP Pass",
    500000 * 10**18, // 500k IDRX
    100,             // quantity
    2,               // max per purchase
    "Premium access with VIP lounge"
);
```

### 4. Purchase Tickets (Buyer)
```solidity
// Approve IDRX spending
idrxToken.approve(eventAddress, 1000000 * 10**18);

// Purchase 2 VIP tickets
event.purchaseTicket(1, 2); // tierId=1, quantity=2
```

### 5. Venue Check-in (Staff)
```solidity
// Staff scans buyer's wallet and burns ticket
event.checkInAndBurn(tokenId); // Permanently destroys NFT
```

## 🔧 Contract Interactions

### Key Functions

**AccessControl:**
```solidity
addOrganizer(address)          // Admin adds organizer
addStaff(address)             // Organizer adds staff
```

**EventFactory:**
```solidity
createEvent(EventParams)       // Create new event
getEvents()                   // Get all events
```

**Event:**
```solidity
addTicketTier(...)            // Setup ticket types
purchaseTicket(tierId, qty)   // Buy NFT tickets
checkInAndBurn(tokenId)       // Burn ticket at venue
```

**TicketNFT:**
```solidity
burn(tokenId)                 // Destroy NFT permanently
getTicketMetadata(tokenId)    // Get ticket details
isBurned(tokenId)            // Check if burned
```

## 🌐 Frontend Integration

After deployment, update frontend configuration:

```bash
# Generate ABI files for frontend
make generate-abi

# Update frontend contract addresses  
make update-frontend-config
```

Frontend files updated:
- `../frontend/src/config/wagmi.ts` - Contract addresses
- `../frontend/deployment.json` - Deployment info
- `../frontend/.env` - Environment variables

## 📊 Gas Optimization

The contracts are optimized for gas efficiency:

| Operation | Gas Cost | Notes |
|-----------|----------|-------|
| Create Event | ~2.1M | One-time deployment |
| Purchase Ticket | ~180k | NFT mint + payment |
| Burn Ticket | ~45k | Permanent destruction |
| Transfer Ticket | ~85k | Standard ERC721 |

## 🛡️ Security Features

- **Role-based Access Control** - Each function protected by appropriate roles
- **Reentrancy Protection** - Critical functions use `nonReentrant` modifier
- **Input Validation** - All parameters validated with custom errors
- **Pausable Contracts** - Emergency pause functionality
- **Upgrade Patterns** - Proxy-ready for future upgrades

## 🧪 Testing Strategy

### Unit Tests
- Individual contract functionality
- Role permission enforcement  
- Edge case handling
- Gas usage validation

### Integration Tests
- Complete workflow testing
- Cross-contract interactions
- Real-world scenarios
- Error condition testing

### Test Coverage
```bash
make test-coverage
# Target: >95% line coverage
```

## 📈 Deployment History

### Lisk Sepolia Testnet
- Network ID: 4202
- RPC: https://rpc.sepolia.lisk.com
- Explorer: https://sepolia-blockscout.lisk.com

Contract addresses will be saved to `deployment-4202.json` after deployment.

## 🔧 Development Commands

```bash
# Development workflow
make dev-setup          # Complete setup
make dev-deploy         # Local deployment
make production-deploy  # Production deployment

# Testing
make test              # All tests
make test-unit         # Unit tests only  
make test-integration  # Integration tests
make test-coverage     # With coverage

# Utilities
make format            # Format code
make lint              # Lint code  
make clean             # Clean artifacts
make docs              # Generate docs

# Wallet management
make fund-wallets      # Fund test wallets
make check-balances    # Check IDRX balances

# Security
make slither           # Security analysis
make gas-snapshot      # Gas usage snapshot
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Make changes and add tests
4. Run test suite (`make test`)
5. Commit changes (`git commit -m 'Add amazing feature'`)
6. Push to branch (`git push origin feature/amazing-feature`)
7. Open Pull Request

## 📜 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Frontend Repository**: [Frontend Code](../frontend/)
- **Documentation**: [Technical Docs](docs/)
- **Lisk Sepolia Explorer**: https://sepolia-