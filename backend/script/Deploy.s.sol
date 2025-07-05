// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "forge-std/Script.sol";
import "../src/AccessControl.sol";
import "../src/EventFactory.sol";
import "../src/tokens/MockIDRX.sol";

/**
 * @title Deploy
 * @dev Deployment script for Lummy Burn NFT system
 */
contract Deploy is Script {
    // Wallet addresses for testing
    address constant ADMIN = 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266;
    address constant ORGANIZER_1 = 0x70997970C51812dc3A010C7d01b50e0d17dc79C8;
    address constant STAFF_1 = 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC;
    address constant BUYER_1 = 0x90F79bf6EB2c4f870365E785982E1f101E93b906;
    address constant BUYER_2 = 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65;

    // Production IDRX token address on Lisk Sepolia
    address constant IDRX_PRODUCTION = 0xD63029C1a3dA68b51c67c6D1DeC3DEe50D681661;

    function run() external {
        // Get deployment private key from environment
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("Deploying contracts...");
        console.log("Deployer address:");
        console.logAddress(deployer);
        console.log("Admin address:");  
        console.logAddress(ADMIN);
        
        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy MockIDRX for testing (skip in production)
        MockIDRX mockIDRX;
        address idrxAddress;
        
        if (block.chainid == 4202) { // Lisk Sepolia
            // Use real IDRX in production
            idrxAddress = IDRX_PRODUCTION;
            console.log("Using production IDRX:");
            console.logAddress(idrxAddress);
        } else {
            // Deploy mock IDRX for local testing
            mockIDRX = new MockIDRX();
            idrxAddress = address(mockIDRX);
            console.log("Mock IDRX deployed:");
            console.logAddress(idrxAddress);
        }

        // 2. Deploy AccessControl
        AccessControl accessControl = new AccessControl();
        console.log("AccessControl deployed:");
        console.logAddress(address(accessControl));

        // 3. Deploy EventFactory
        EventFactory eventFactory = new EventFactory(
            address(accessControl),
            idrxAddress,
            ADMIN // Fee recipient
        );
        console.log("EventFactory deployed:");
        console.logAddress(address(eventFactory));

        // 4. Setup initial roles
        console.log("Setting up roles...");
        
        // Add organizer
        accessControl.addOrganizer(ORGANIZER_1);
        console.log("Added organizer:");
        console.logAddress(ORGANIZER_1);

        // 5. Distribute test tokens if using mock IDRX
        if (address(mockIDRX) != address(0)) {
            console.log("Distributing test IDRX tokens...");
            
            // Mint tokens to test wallets
            mockIDRX.mint(BUYER_1, 1000000 * 10**18); // 1M IDRX
            mockIDRX.mint(BUYER_2, 1000000 * 10**18); // 1M IDRX
            mockIDRX.mint(ORGANIZER_1, 500000 * 10**18); // 500K IDRX
            
            console.log("IDRX distributed to test wallets");
        }

        vm.stopBroadcast();

        // 6. Log deployment addresses
        console.log("\n=== DEPLOYMENT SUMMARY ===");
        console.log("Network:", getNetworkName());
        console.log("AccessControl:", address(accessControl));
        console.log("EventFactory:", address(eventFactory));
        console.log("IDRX Token:", idrxAddress);
        
        console.log("\n=== WALLET ROLES ===");
        console.log("Admin:", ADMIN);
        console.log("Organizer 1:", ORGANIZER_1);
        console.log("Staff 1:", STAFF_1);
        console.log("Buyer 1:", BUYER_1);
        console.log("Buyer 2:", BUYER_2);

        console.log("\n=== NEXT STEPS ===");
        console.log("1. Update frontend CONTRACT_ADDRESSES in src/config/wagmi.ts");
        console.log("2. Fund buyer wallets with IDRX tokens");
        console.log("3. Organizer can now create events");
        console.log("4. Test the full workflow");

        // 7. Save deployment addresses to file
        saveDeploymentAddresses(
            address(accessControl),
            address(eventFactory),
            idrxAddress
        );
    }

    function getNetworkName() internal view returns (string memory) {
        if (block.chainid == 1) return "Ethereum Mainnet";
        if (block.chainid == 11155111) return "Sepolia";
        if (block.chainid == 4202) return "Lisk Sepolia";
        if (block.chainid == 31337) return "Local";
        return "Unknown";
    }

    function saveDeploymentAddresses(
        address accessControl,
        address eventFactory,
        address idrxToken
    ) internal {
        string memory json = "deployment";
        
        vm.serializeAddress(json, "accessControl", accessControl);
        vm.serializeAddress(json, "eventFactory", eventFactory);
        string memory finalJson = vm.serializeAddress(json, "idrxToken", idrxToken);
        
        string memory fileName = string(abi.encodePacked("deployment-", vm.toString(block.chainid), ".json"));
        vm.writeJson(finalJson, fileName);
        
        console.log("Deployment addresses saved to:", fileName);
    }
}