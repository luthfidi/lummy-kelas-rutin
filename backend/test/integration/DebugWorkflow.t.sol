// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "forge-std/Test.sol";
import "../../src/AccessControl.sol";
import "../../src/EventFactory.sol";
import "../../src/Event.sol";
import "../../src/TicketNFT.sol";
import "../../src/tokens/MockIDRX.sol";

/**
 * @title DebugCompleteWorkflow
 * @dev Debug the exact issue in testCompleteWorkflow
 */
contract DebugCompleteWorkflowTest is Test {
    AccessControl public accessControl;
    EventFactory public eventFactory;
    MockIDRX public idrxToken;
    Event public testEvent;
    TicketNFT public ticketNFT;
    
    // Test wallets
    address constant ADMIN = 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266;
    address constant ORGANIZER_1 = 0x70997970C51812dc3A010C7d01b50e0d17dc79C8;
    address constant STAFF_1 = 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC;
    address constant BUYER_1 = 0x90F79bf6EB2c4f870365E785982E1f101E93b906;
    address constant BUYER_2 = 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65;

    function setUp() public {
        // Deploy contracts as admin
        vm.startPrank(ADMIN);
        
        accessControl = new AccessControl();
        idrxToken = new MockIDRX();
        eventFactory = new EventFactory(
            address(accessControl),
            address(idrxToken),
            ADMIN
        );
        
        // Setup roles
        accessControl.addOrganizer(ORGANIZER_1);
        
        // Distribute IDRX tokens
        idrxToken.mint(BUYER_1, 10000000 * 10**18);
        idrxToken.mint(BUYER_2, 10000000 * 10**18);
        
        vm.stopPrank();
        
        // Create test event as organizer
        vm.startPrank(ORGANIZER_1);
        
        IEventFactory.EventParams memory eventParams = IEventFactory.EventParams({
            name: "Test Music Festival",
            description: "A test event for integration testing",
            date: block.timestamp + 30 days,
            venue: "Test Venue",
            ipfsMetadata: "QmTestHash123"
        });
        
        address eventAddress = eventFactory.createEvent(eventParams);
        testEvent = Event(eventAddress);
        ticketNFT = TicketNFT(testEvent.getTicketNFTAddress());
        
        // Add staff
        testEvent.addAuthorizedStaff(STAFF_1);
        
        // Add ticket tiers
        testEvent.addTicketTier(
            "General Admission",
            250000 * 10**18,
            100,
            4,
            "Standard access"
        );
        
        testEvent.addTicketTier(
            "VIP Pass",
            500000 * 10**18,
            50,
            2,
            "Premium access"
        );
        
        vm.stopPrank();
    }

    function testDebugBurnAlreadyBurnedToken() public {
        console.log("=== Testing burn already burned token ===");
        
        // 1. Purchase ticket
        vm.startPrank(BUYER_1);
        uint256 vipPrice = 500000 * 10**18;
        idrxToken.approve(address(testEvent), vipPrice);
        testEvent.purchaseTicket(1, 1); // Buy 1 VIP ticket
        vm.stopPrank();
        
        uint256[] memory tickets = ticketNFT.getTicketsByOwner(BUYER_1);
        uint256 tokenId = tickets[0];
        
        console.log("Token ID:", tokenId);
        console.log("Token valid before burn:", ticketNFT.isTicketValid(tokenId));
        
        // 2. Staff burns ticket (first time - should succeed)
        vm.prank(STAFF_1);
        testEvent.checkInAndBurn(tokenId);
        
        console.log("Token valid after burn:", ticketNFT.isTicketValid(tokenId));
        console.log("Token burned:", ticketNFT.isBurned(tokenId));
        
        // 3. Try to burn same token again (should revert)
        console.log("Attempting to burn already burned token...");
        
        vm.prank(STAFF_1);
        
        // Let's check what happens when we try to burn already burned token
        try testEvent.checkInAndBurn(tokenId) {
            console.log("ERROR: Burn succeeded when it should have failed!");
            console.log("This is the source of 'next call did not revert as expected'");
        } catch Error(string memory reason) {
            console.log("GOOD: Burn failed with reason:", reason);
        } catch (bytes memory) {
            console.log("GOOD: Burn failed with low-level error");
        }
    }

    function testDebugNonExistentToken() public {
        console.log("=== Testing burn non-existent token ===");
        
        uint256 nonExistentTokenId = 999;
        
        console.log("Attempting to burn non-existent token ID:", nonExistentTokenId);
        
        vm.prank(STAFF_1);
        
        try testEvent.checkInAndBurn(nonExistentTokenId) {
            console.log("ERROR: Burn succeeded when it should have failed!");
        } catch Error(string memory reason) {
            console.log("GOOD: Burn failed with reason:", reason);
        } catch (bytes memory) {
            console.log("GOOD: Burn failed with low-level error");
        }
    }
}