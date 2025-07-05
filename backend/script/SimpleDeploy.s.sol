// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "forge-std/Script.sol";
import "../src/AccessControl.sol";
import "../src/SimpleEventFactory.sol";
import "../src/tokens/MockIDRX.sol";

/**
 * @title SimpleDeploy
 * @dev Simple deployment script without complex console.log
 */
contract SimpleDeploy is Script {
    // Wallet addresses for testing
    address constant ADMIN = 0x580B01f8CDf7606723c3BE0dD2AaD058F5aECa3d;
    address constant ORGANIZER_1 = 0x5B38Da6a701c568545dCfcB03FcB875f56beddC4;

    function run() external {
        // Use hardcoded private key for local development (Anvil account #0)
        uint256 deployerPrivateKey = 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80;
        
        console.log("=== DEPLOYING LUMMY BURN NFT CONTRACTS ===");
        
        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy MockIDRX for testing
        MockIDRX mockIDRX = new MockIDRX();
        console.log("MockIDRX deployed");

        // 2. Deploy AccessControl
        AccessControl accessControl = new AccessControl();
        console.log("AccessControl deployed");

        // 3. Deploy SimpleEventFactory
        SimpleEventFactory eventFactory = new SimpleEventFactory(
            address(accessControl),
            address(mockIDRX),
            ADMIN
        );
        console.log("SimpleEventFactory deployed");

        // 4. Setup roles
        accessControl.addOrganizer(ORGANIZER_1);
        console.log("Organizer added");

        // 5. Fund test wallets
        mockIDRX.mint(ORGANIZER_1, 10000000 * 10**18);
        mockIDRX.mint(0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db, 10000000 * 10**18);
        mockIDRX.mint(0x78731D3Ca6b7E34aC0F824c42a7cC18A495cabaB, 10000000 * 10**18);
        console.log("Test wallets funded");

        vm.stopBroadcast();

        console.log("=== DEPLOYMENT COMPLETE ===");
        console.log("Update your frontend with these addresses:");
        console.logAddress(address(accessControl));
        console.logAddress(address(eventFactory));
        console.logAddress(address(mockIDRX));
        
        console.log("Contract addresses:");
        console.log("AccessControl:", address(accessControl));
        console.log("EventFactory:", address(eventFactory)); 
        console.log("MockIDRX:", address(mockIDRX));
    }
}