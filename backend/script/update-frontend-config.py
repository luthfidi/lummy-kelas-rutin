#!/usr/bin/env python3
"""
Update frontend configuration with deployed contract addresses
"""

import json
import os
import re

def load_deployment_addresses():
    """Load deployment addresses from JSON file"""
    deployment_file = "deployment-4202.json"  # Lisk Sepolia
    
    if not os.path.exists(deployment_file):
        print(f"❌ {deployment_file} not found")
        print("Run deployment first: make deploy-lisk")
        exit(1)
    
    with open(deployment_file, 'r') as f:
        return json.load(f)

def update_wagmi_config(addresses):
    """Update wagmi.ts configuration file"""
    wagmi_file = "../frontend/src/config/wagmi.ts"
    
    if not os.path.exists(wagmi_file):
        print(f"❌ {wagmi_file} not found")
        print("Make sure frontend directory exists")
        exit(1)
    
    # Read current file
    with open(wagmi_file, 'r') as f:
        content = f.read()
    
    # Update contract addresses
    new_content = re.sub(
        r'EventFactory: ["\']0x[a-fA-F0-9]{40}["\']',
        f'EventFactory: "{addresses["eventFactory"]}"',
        content
    )
    
    new_content = re.sub(
        r'EventFactory: ["\']0x0+["\']',
        f'EventFactory: "{addresses["eventFactory"]}"',
        new_content
    )
    
    # Write updated file
    with open(wagmi_file, 'w') as f:
        f.write(new_content)
    
    print(f"✅ Updated {wagmi_file}")

def create_frontend_deployment_file(addresses):
    """Create deployment file for frontend reference"""
    frontend_deployment = {
        "network": "lisk-sepolia",
        "chainId": 4202,
        "contracts": {
            "AccessControl": addresses["accessControl"],
            "EventFactory": addresses["eventFactory"],
            "IDRX": addresses["idrxToken"]
        },
        "wallets": {
            "admin": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
            "organizer": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
            "staff": "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
            "buyer1": "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
            "buyer2": "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65"
        }
    }
    
    frontend_file = "../frontend/deployment.json"
    with open(frontend_file, 'w') as f:
        json.dump(frontend_deployment, f, indent=2)
    
    print(f"✅ Created {frontend_file}")

def create_env_file(addresses):
    """Create .env file for frontend"""
    env_content = f"""# Lummy Burn NFT - Frontend Environment Variables

# Contract Addresses
VITE_ACCESS_CONTROL_ADDRESS={addresses["accessControl"]}
VITE_EVENT_FACTORY_ADDRESS={addresses["eventFactory"]}
VITE_IDRX_TOKEN_ADDRESS={addresses["idrxToken"]}

# Network Configuration
VITE_LISK_SEPOLIA_RPC=https://rpc.sepolia.lisk.com
VITE_CHAIN_ID=4202

# WalletConnect (replace with your project ID)
VITE_WALLETCONNECT_PROJECT_ID=d2fcae952e3bd7b4e51fb295883cacdf

# Test Wallet Addresses
VITE_ADMIN_ADDRESS=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
VITE_ORGANIZER_ADDRESS=0x70997970C51812dc3A010C7d01b50e0d17dc79C8
VITE_STAFF_ADDRESS=0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
VITE_BUYER1_ADDRESS=0x90F79bf6EB2c4f870365E785982E1f101E93b906
VITE_BUYER2_ADDRESS=0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65
"""
    
    env_file = "../frontend/.env"
    with open(env_file, 'w') as f:
        f.write(env_content)
    
    print(f"✅ Created {env_file}")

def print_integration_guide(addresses):
    """Print integration guide"""
    print("\n" + "="*60)
    print("🎯 FRONTEND INTEGRATION GUIDE")
    print("="*60)
    
    print(f"""
📋 Contract Addresses:
   • AccessControl: {addresses["accessControl"]}
   • EventFactory:  {addresses["eventFactory"]}
   • IDRX Token:    {addresses["idrxToken"]}

🔧 Next Steps:
   1. Update WalletConnect Project ID in .env
   2. Replace mock data with real contract calls
   3. Test wallet connections with the 5 test wallets
   4. Deploy frontend to staging/production

💡 Quick Test:
   cd ../frontend
   npm run dev
   
🎭 Role Testing:
   • Admin (0x580B...CaE3d): Manage organizers
   • Organizer (0x5B38...ddC4): Create events, manage staff  
   • Staff (0xAb84...5cb2): Scan & burn tickets
   • Buyers (0x4B20...C02db, 0x7873...cabaB): Purchase tickets

🔥 NFT Burn Flow:
   Purchase → Transfer → Venue Scan → Burn → Entry ✅
""")

def main():
    print("🚀 Updating frontend configuration...")
    
    # Load deployment addresses
    addresses = load_deployment_addresses()
    print(f"📝 Loaded deployment addresses")
    
    # Update frontend files
    update_wagmi_config(addresses)
    create_frontend_deployment_file(addresses)
    create_env_file(addresses)
    
    # Show integration guide
    print_integration_guide(addresses)
    
    print("\n✅ Frontend configuration update complete!")

if __name__ == "__main__":
    main()