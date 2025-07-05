// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "forge-std/Script.sol";
import "../src/tokens/MockIDRX.sol";
import "../src/AccessControl.sol";
import "../src/EventFactory.sol";

/**
 * @title CheckBalances
 * @dev Script to check balances and contract states
 */
contract CheckBalances is Script {
    // Test wallet addresses
    address constant ADMIN = 0x580B01f8CDf7606723c3BE0dD2AaD058F5aECa3d;
    address constant ORGANIZER_1 = 0x5B38Da6a701c568545dCfcB03FcB875f56beddC4;
    address constant STAFF_1 = 0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2;
    address constant BUYER_1 = 0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db;
    address constant BUYER_2 = 0x78731D3Ca6b7E34aC0F824c42a7cC18A495cabaB;

    function run() external view {
        // Load deployment addresses
        string memory deploymentFile = string(abi.encodePacked("deployment-", vm.toString(block.chainid), ".json"));
        string memory json = vm.readFile(deploymentFile);
        
        address accessControlAddr = vm.parseJsonAddress(json, ".accessControl");
        address eventFactoryAddr = vm.parseJsonAddress(json, ".eventFactory");
        address idrxAddr = vm.parseJsonAddress(json, ".idrxToken");

        console.log("=== CONTRACT STATUS ===");
        console.log("Network:", getNetworkName());
        console.log("AccessControl:", accessControlAddr);
        console.log("EventFactory:", eventFactoryAddr);
        console.log("IDRX Token:", idrxAddr);

        // Check IDRX balances
        console.log("\n=== IDRX BALANCES ===");
        checkIDRXBalance(idrxAddr, ADMIN, "Admin");
        checkIDRXBalance(idrxAddr, ORGANIZER_1, "Organizer 1");
        checkIDRXBalance(idrxAddr, STAFF_1, "Staff 1");
        checkIDRXBalance(idrxAddr, BUYER_1, "Buyer 1");
        checkIDRXBalance(idrxAddr, BUYER_2, "Buyer 2");

        // Check access control roles
        console.log("\n=== ACCESS CONTROL ROLES ===");
        checkAccessControlRoles(accessControlAddr);

        // Check event factory status
        console.log("\n=== EVENT FACTORY STATUS ===");
        checkEventFactoryStatus(eventFactoryAddr);

        // Check for test event
        checkTestEvent();
    }

    function checkIDRXBalance(address tokenAddr, address wallet, string memory name) internal view {
        try MockIDRX(tokenAddr).balanceOf(wallet) returns (uint256 balance) {
            console.log(string.concat(name, " (", vm.toString(wallet), "): ", vm.toString(balance / 10**18), " IDRX"));
        } catch {
            console.log(string.concat(name, ": Error reading balance"));
        }
    }

    function checkAccessControlRoles(address accessControlAddr) internal view {
        AccessControl accessControl = AccessControl(accessControlAddr);
        
        console.log("Owner:", accessControl.owner());
        console.log("Organizer 1 authorized:", accessControl.authorizedOrganizers(ORGANIZER_1));
        console.log("Staff 1 -> Organizer 1:", accessControl.organizerStaff(ORGANIZER_1, STAFF_1));
        
        try accessControl.getOrganizers() returns (address[] memory organizers) {
            console.log("Total organizers:", organizers.length);
            for (uint i = 0; i < organizers.length; i++) {
                console.log("  - Organizer:", organizers[i]);
            }
        } catch {
            console.log("Error reading organizers");
        }
    }

    function checkEventFactoryStatus(address eventFactoryAddr) internal view {
        EventFactory eventFactory = EventFactory(eventFactoryAddr);
        
        try eventFactory.getEventCount() returns (uint256 count) {
            console.log("Total events created:", count);
            
            if (count > 0) {
                address[] memory events = eventFactory.getEvents();
                console.log("Event addresses:");
                for (uint i = 0; i < events.length; i++) {
                    console.log("  - Event:", events[i]);
                }
            }
        } catch {
            console.log("Error reading event factory status");
        }
    }

    function checkTestEvent() internal view {
        string memory testEventFile = string(abi.encodePacked("test-event-", vm.toString(block.chainid), ".json"));
        
        try vm.readFile(testEventFile) returns (string memory json) {
            address testEventAddr = vm.parseJsonAddress(json, ".address");
            console.log("\n=== TEST EVENT STATUS ===");
            console.log("Test event address:", testEventAddr);
            
            // Additional event checks could be added here
        } catch {
            console.log("\n=== TEST EVENT STATUS ===");
            console.log("No test event found. Run 'make setup-local' or 'make setup-lisk'");
        }
    }

    function getNetworkName() internal view returns (string memory) {
        if (block.chainid == 1) return "Ethereum Mainnet";
        if (block.chainid == 11155111) return "Sepolia";
        if (block.chainid == 4202) return "Lisk Sepolia";
        if (block.chainid == 31337) return "Local Anvil";
        return string(abi.encodePacked("Unknown (", vm.toString(block.chainid), ")"));
    }
}