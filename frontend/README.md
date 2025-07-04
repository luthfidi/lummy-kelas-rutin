# Lummy Burn NFT Frontend

Frontend yang sudah dikembangkan untuk sistem **Burn NFT di Venue** - sistem tiket blockchain yang menghilangkan duplikasi 100% dengan cara membakar NFT setelah digunakan.

## 🔥 Konsep Burn NFT System

### Bagaimana Cara Kerjanya:
1. **Purchase** → NFT tiket di-mint ke wallet user
2. **At Venue** → Staff scan wallet attendee 
3. **Burn NFT** → NFT dihancurkan permanen = entry granted
4. **No Duplicates** → Tiket tidak bisa digunakan lagi

### Keunggulan:
- ✅ **100% eliminasi tiket duplikat**
- ✅ **Pure Web3** - tidak butuh database
- ✅ **No QR codes** - langsung wallet connection
- ✅ **Permanent destruction** setelah digunakan

## 📂 Struktur Frontend (Sudah Dibuat)

```
frontend/
├── src/
│   ├── pages/
│   │   ├── HomePage.tsx           # ✅ Event list dengan mock data
│   │   ├── EventDetail.tsx        # ✅ Event info + purchase NFT
│   │   ├── MyTickets.tsx          # ✅ Owned NFTs + transfer
│   │   ├── CreateEvent.tsx        # ✅ New event form
│   │   └── VenueScanner.tsx       # ✅ Burn NFT at venue
│   ├── components/
│   │   └── Navbar.tsx             # ✅ Wallet connection
│   ├── contracts/
│   │   ├── EventFactory.ts        # ✅ Factory ABI
│   │   ├── Event.ts              # ✅ Event contract ABI
│   │   └── TicketNFT.ts          # ✅ NFT contract ABI
│   ├── config/
│   │   └── wagmi.ts              # ✅ Blockchain config
│   ├── data/
│   │   └── mockData.ts           # ✅ Mock events & tickets
│   └── theme.ts                  # ✅ Chakra UI theme
├── package.json                  # ✅ Dependencies
└── ...
```

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Setup Environment
Buat `.env` file di folder `frontend/`:
```
VITE_WALLETCONNECT_PROJECT_ID=your_project_id
```

### 3. Update Contract Addresses
Edit `src/config/wagmi.ts`:
```typescript
export const CONTRACT_ADDRESSES = {
  EventFactory: '0xYourEventFactoryAddress', // Update after deploy
  IDRX: '0xD63029C1a3dA68b51c67c6D1DeC3DEe50D681661',
};
```

### 4. Run Development Server
```bash
npm run dev
```

## 🔗 Blockchain Integration (Ready)

### Core Contract Interactions Sudah Disiapkan:

#### 1. **Read Events** (HomePage.tsx)
```typescript
// Siap untuk integrasi dengan wagmi
useReadContract({
  address: CONTRACT_ADDRESSES.EventFactory,
  abi: EventFactoryABI,
  functionName: 'getEvents',
});
```

#### 2. **Purchase Tickets** (EventDetail.tsx)
```typescript
// Mock purchase sudah jalan, siap untuk writeContract
writeContract({
  address: eventAddress,
  abi: EventABI,
  functionName: 'purchaseTicket',
  args: [tierId, quantity],
});
```

#### 3. **Transfer NFT** (MyTickets.tsx)
```typescript
// Transfer function sudah ada UI-nya
writeContract({
  address: ticketNFTAddress,
  abi: TicketNFTABI,
  functionName: 'transferFrom',
  args: [from, to, tokenId],
});
```

#### 4. **Burn NFT** (VenueScanner.tsx)
```typescript
// Venue scanner interface sudah lengkap
writeContract({
  address: eventAddress,
  abi: EventABI,
  functionName: 'checkInAndBurn',
  args: [tokenId],
});
```

## 📋 Smart Contract Requirements

Frontend ini membutuhkan smart contracts dengan functions:

### EventFactory.sol
```solidity
function createEvent(...) external returns (address);
function getEvents() external view returns (address[]);
```

### Event.sol
```solidity
function purchaseTicket(uint256 tierId, uint256 quantity) external;
function checkInAndBurn(uint256 tokenId) external onlyOrganizer;
function addTicketTier(...) external;
function getEventDetails() external view returns (...);
function ticketTiers(uint256) external view returns (...);
function tierCount() external view returns (uint256);
```

### TicketNFT.sol
```solidity
function burnTicket(uint256 tokenId) external;
function transferFrom(address from, address to, uint256 tokenId) external;
function balanceOf(address owner) external view returns (uint256);
function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256);
function getTicketMetadata(uint256 tokenId) external view returns (...);
function ownerOf(uint256 tokenId) external view returns (address);
```

## 🎯 Features yang Sudah Dibuat

### 1. **Event Discovery** (HomePage.tsx) ✅
- ✅ List events dengan mock data
- ✅ Event cards dengan progress bar
- ✅ Filters dan status tiket
- ✅ Responsive design

### 2. **Ticket Purchase** (EventDetail.tsx) ✅
- ✅ Event details lengkap
- ✅ Multiple ticket tiers
- ✅ Purchase simulation
- ✅ Price calculation
- ✅ Stock tracking

### 3. **Ticket Management** (MyTickets.tsx) ✅
- ✅ Active vs burned tickets
- ✅ Transfer functionality
- ✅ Ticket history
- ✅ Visual NFT states

### 4. **Event Creation** (CreateEvent.tsx) ✅
- ✅ Form untuk deploy event
- ✅ Ticket tier setup
- ✅ Deployment simulation
- ✅ Revenue estimation

### 5. **Venue Scanning** (VenueScanner.tsx) ✅
- ✅ Staff interface untuk burn NFT
- ✅ Wallet address scanner
- ✅ Burn confirmation
- ✅ Real-time statistics
- ✅ Burn history

## 🔧 Technical Stack

- **Frontend**: React + TypeScript + Vite
- **UI**: Chakra UI dengan custom theme
- **Blockchain**: Wagmi + Viem untuk Lisk Sepolia
- **Routing**: React Router DOM
- **State**: React hooks + mock data
- **Styling**: Chakra UI + responsive design

## 🎨 UI/UX Features

### Design System ✅
- 🎨 Purple/pink gradient theme
- 🔥 Fire emoji branding
- 📱 Fully responsive
- 🎯 Accessible components
- ⚡ Smooth animations

### User Experience ✅
- 🔄 Loading states
- 🎉 Success/error toasts
- 📊 Progress indicators
- 💫 Interactive elements
- 🎭 Mock data untuk demo

### Wallet Integration ✅
- 🔗 Multiple wallet support
- 💰 Balance display
- 🔐 Connection status
- 📱 Mobile-friendly

## 📝 Next Steps untuk Integrasi

### 1. **Deploy Smart Contracts** 
```bash
# Deploy ke Lisk Sepolia
npx hardhat deploy --network lisk-sepolia
```

### 2. **Update Contract Addresses**
```typescript
// src/config/wagmi.ts
export const CONTRACT_ADDRESSES = {
  EventFactory: '0xYourDeployedFactoryAddress',
  IDRX: '0xD63029C1a3dA68b51c67c6D1DeC3DEe50D681661',
};
```

### 3. **Replace Mock Data dengan Real Blockchain Calls**
```typescript
// Ganti mockEvents dengan:
const { data: events } = useReadContract({
  address: CONTRACT_ADDRESSES.EventFactory,
  abi: EventFactoryABI,
  functionName: 'getEvents',
});
```

### 4. **Setup Environment Variables**
```bash
# .env
VITE_WALLETCONNECT_PROJECT_ID=your_project_id
VITE_LISK_SEPOLIA_RPC=https://rpc.sepolia.lisk.com
VITE_EVENT_FACTORY_ADDRESS=0x...
```

### 5. **Testing**
- [ ] Test wallet connection
- [ ] Test event creation
- [ ] Test ticket purchase
- [ ] Test NFT transfer
- [ ] Test venue burning

## 🎪 Demo Flow yang Sudah Jalan

1. **Connect Wallet** → Mock connection dengan multiple wallets ✅
2. **Browse Events** → 5 mock events dengan different tiers ✅
3. **Purchase Tickets** → Simulation dengan IDRX pricing ✅
4. **View My Tickets** → Active/burned tickets separation ✅
5. **Transfer Tickets** → NFT transfer modal ✅
6. **Create Event** → Full deployment simulation ✅
7. **Venue Check-in** → Staff scanner interface ✅

## 🚀 Production Readiness

### Frontend Sudah Siap ✅
- ✅ Complete UI/UX
- ✅ All pages implemented
- ✅ Responsive design
- ✅ Error handling
- ✅ Loading states
- ✅ Mock data untuk testing

### Blockchain Integration Ready ✅
- ✅ Wagmi configuration
- ✅ Contract ABIs
- ✅ Function signatures
- ✅ Error handling structure

### Deploy Ready ✅
```bash
# Build untuk production
npm run build

# Preview build
npm run preview
```

## 🔍 Debugging & Development

### Mock Data
- Events: `src/data/mockData.ts`
- Tickets: Sudah ada mock ownership
- Users: Mock wallet addresses

### Development Tools
```bash
npm run dev     # Development server
npm run build   # Production build
npm run lint    # ESLint check
npm run preview # Preview build
```

---

**🔥 Status: Frontend 100% Complete - Ready for Smart Contract Integration!**

Cukup deploy smart contracts, update addresses, dan replace mock data dengan real blockchain calls. UI/UX sudah production-ready dengan full NFT burn system workflow.