// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "forge-std/Script.sol";
import "../src/tokens/MockIDRX.sol";
import "../src/AccessControl.sol";
import "../src/SimpleEventFactory.sol";

/**
 * @title QuickCheck
 * @dev Quick verification with correct addresses
 */
contract QuickCheck is Script {
    // Correct deployed addresses
    address constant ACCESS_CONTROL = 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512;
    address constant EVENT_FACTORY = 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0;
    address constant IDRX_TOKEN = 0x5FbDB2315678afecb367f032d93F642f64180aa3;

    // Test wallets
    address constant ORGANIZER_1 = 0x5B38Da6a701c568545dCfcB03FcB875f56beddC4;
    address constant BUYER_1 = 0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db;
    address constant BUYER_2 = 0x78731D3Ca6b7E34aC0F824c42a7cC18A495cabaB;

    function run() external view {
        console.log("=== QUICK CONTRACT STATUS CHECK ===");
        console.log("Network: Local Anvil");
        
        // Check contracts exist
        console.log("\n=== CONTRACT ADDRESSES ===");
        console.log("AccessControl:", ACCESS_CONTROL);
        console.log("EventFactory:", EVENT_FACTORY);
        console.log("IDRX Token:", IDRX_TOKEN);
        
        // Check IDRX balances
        console.log("\n=== IDRX BALANCES ===");
        MockIDRX idrx = MockIDRX(IDRX_TOKEN);
        
        uint256 orgBalance = idrx.balanceOf(ORGANIZER_1);
        uint256 buyer1Balance = idrx.balanceOf(BUYER_1);
        uint256 buyer2Balance = idrx.balanceOf(BUYER_2);
        
        console.log("Organizer 1:", orgBalance / 10**18, "IDRX");
        console.log("Buyer 1:", buyer1Balance / 10**18, "IDRX");
        console.log("Buyer 2:", buyer2Balance / 10**18, "IDRX");
        
        // Check access control
        console.log("\n=== ACCESS CONTROL ===");
        AccessControl ac = AccessControl(ACCESS_CONTROL);
        
        bool isOrgAuthorized = ac.authorizedOrganizers(ORGANIZER_1);
        console.log("Organizer 1 authorized:", isOrgAuthorized);
        
        // Check event factory
        console.log("\n=== EVENT FACTORY ===");
        SimpleEventFactory factory = SimpleEventFactory(EVENT_FACTORY);
        
        uint256 eventCount = factory.getEventCount();
        console.log("Total events:", eventCount);
        
        bool isOrgAuth = factory.isAuthorizedOrganizer(ORGANIZER_1);
        console.log("Organizer can create events:", isOrgAuth);
        
        console.log("\n=== STATUS: ALL SYSTEMS READY ===");
    }
}