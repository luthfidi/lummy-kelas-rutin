// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "forge-std/Script.sol";
import "../src/AccessControl.sol";
import "../src/EventFactory.sol";
import "../src/Event.sol";
import "../src/tokens/MockIDRX.sol";

/**
 * @title SetupRoles
 * @dev Script to setup roles and create a test event
 */
contract SetupRoles is Script {
    // Wallet addresses
    address constant ADMIN = 0x580B01f8CDf7606723c3BE0dD2AaD058F5aECa3d;
    address constant ORGANIZER_1 = 0x5B38Da6a701c568545dCfcB03FcB875f56beddC4;
    address constant STAFF_1 = 0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2;
    address constant BUYER_1 = 0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db;
    address constant BUYER_2 = 0x78731D3Ca6b7E34aC0F824c42a7cC18A495cabaB;

    function run() external {
        // Load deployment addresses
        string memory deploymentFile = string(abi.encodePacked("deployment-", vm.toString(block.chainid), ".json"));
        string memory json = vm.readFile(deploymentFile);
        
        address accessControlAddr = vm.parseJsonAddress(json, ".accessControl");
        address eventFactoryAddr = vm.parseJsonAddress(json, ".eventFactory");
        address idrxAddr = vm.parseJsonAddress(json, ".idrxToken");

        console.log("Setting up roles with deployed contracts...");
        console.log("AccessControl:", accessControlAddr);
        console.log("EventFactory:", eventFactoryAddr);
        console.log("IDRX:", idrxAddr);

        // Start broadcasting as admin
        uint256 adminPrivateKey = vm.envUint("ADMIN_PRIVATE_KEY");
        vm.startBroadcast(adminPrivateKey);

        AccessControl accessControl = AccessControl(accessControlAddr);
        EventFactory eventFactory = EventFactory(eventFactoryAddr);

        // Verify admin is the owner
        require(accessControl.owner() == ADMIN, "Admin not owner of AccessControl");

        // Add organizer if not already added
        if (!accessControl.authorizedOrganizers(ORGANIZER_1)) {
            accessControl.addOrganizer(ORGANIZER_1);
            console.log("Added organizer:", ORGANIZER_1);
        } else {
            console.log("Organizer already authorized:", ORGANIZER_1);
        }

        vm.stopBroadcast();

        // Switch to organizer to create event and add staff
        uint256 organizerPrivateKey = vm.envUint("ORGANIZER_PRIVATE_KEY");
        vm.startBroadcast(organizerPrivateKey);

        // Create a test event
        IEventFactory.EventParams memory eventParams = IEventFactory.EventParams({
            name: "Summer Music Festival 2025",
            description: "Join us for an amazing 3-day music festival featuring top artists from around the world. Experience the best of electronic, rock, and pop music.",
            date: block.timestamp + 30 days,
            venue: "Jakarta Convention Center",
            ipfsMetadata: "QmTestHashForEventMetadata123456789"
        });

        address eventAddress = eventFactory.createEvent(eventParams);
        console.log("Test event created:", eventAddress);

        Event testEvent = Event(eventAddress);

        // Add staff to the event
        testEvent.addAuthorizedStaff(STAFF_1);
        console.log("Added staff to event:", STAFF_1);

        // Add ticket tiers
        testEvent.addTicketTier(
            "General Admission",
            250000 * 10**18, // 250,000 IDRX
            300,
            4,
            "Standard festival access with general viewing areas"
        );

        testEvent.addTicketTier(
            "VIP Pass",
            500000 * 10**18, // 500,000 IDRX
            100,
            2,
            "Premium experience with VIP lounge and priority viewing"
        );

        testEvent.addTicketTier(
            "Backstage Experience",
            1000000 * 10**18, // 1,000,000 IDRX
            50,
            1,
            "Ultimate access including backstage tour and meet & greet"
        );

        console.log("Added 3 ticket tiers to event");

        vm.stopBroadcast();

        // Fund buyer wallets with IDRX if using mock token
        if (block.chainid != 4202) { // Not Lisk Sepolia (using mock IDRX)
            uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
            vm.startBroadcast(deployerPrivateKey);

            MockIDRX mockIDRX = MockIDRX(idrxAddr);
            
            // Give buyers more tokens
            mockIDRX.mint(BUYER_1, 5000000 * 10**18); // 5M IDRX
            mockIDRX.mint(BUYER_2, 5000000 * 10**18); // 5M IDRX

            console.log("Funded buyer wallets with IDRX");

            vm.stopBroadcast();
        }

        console.log("\n=== SETUP COMPLETE ===");
        console.log("Test Event Address:", eventAddress);
        console.log("Event Name:", testEvent.eventName());
        console.log("Event Date:", testEvent.eventDate());
        console.log("Organizer:", testEvent.organizer());
        console.log("Staff authorized:", testEvent.isAuthorizedStaff(STAFF_1));
        console.log("Tier count:", testEvent.tierCount());

        console.log("\n=== READY FOR TESTING ===");
        console.log("1. Buyers can now purchase tickets");
        console.log("2. Staff can scan and burn tickets at venue");
        console.log("3. All role-based permissions are set up");
        
        // Save event address for frontend
        saveEventAddress(eventAddress);
    }

    function saveEventAddress(address eventAddress) internal {
        string memory json = "testEvent";
        string memory finalJson = vm.serializeAddress(json, "address", eventAddress);
        
        string memory fileName = string(abi.encodePacked("test-event-", vm.toString(block.chainid), ".json"));
        vm.writeJson(finalJson, fileName);
        
        console.log("Test event address saved to:", fileName);
    }
}