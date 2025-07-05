// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "forge-std/Script.sol";
import "../src/tokens/MockIDRX.sol";

/**
 * @title FundWallets
 * @dev Script to fund test wallets with IDRX tokens
 */
contract FundWallets is Script {
    // Test wallet addresses
    address constant ORGANIZER_1 = 0x5B38Da6a701c568545dCfcB03FcB875f56beddC4;
    address constant STAFF_1 = 0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2;
    address constant BUYER_1 = 0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db;
    address constant BUYER_2 = 0x78731D3Ca6b7E34aC0F824c42a7cC18A495cabaB;

    function run() external {
        // Load deployment addresses
        string memory deploymentFile = string(abi.encodePacked("deployment-", vm.toString(block.chainid), ".json"));
        string memory json = vm.readFile(deploymentFile);
        address idrxAddr = vm.parseJsonAddress(json, ".idrxToken");

        console.log("Funding test wallets with IDRX...");
        console.log("IDRX Token:", idrxAddr);

        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        MockIDRX idrx = MockIDRX(idrxAddr);

        // Fund each wallet with 10M IDRX
        uint256 fundAmount = 10000000 * 10**18;

        idrx.mint(ORGANIZER_1, fundAmount);
        console.log("Funded Organizer 1 with 10M IDRX");

        idrx.mint(STAFF_1, fundAmount);
        console.log("Funded Staff 1 with 10M IDRX");

        idrx.mint(BUYER_1, fundAmount);
        console.log("Funded Buyer 1 with 10M IDRX");

        idrx.mint(BUYER_2, fundAmount);
        console.log("Funded Buyer 2 with 10M IDRX");

        vm.stopBroadcast();

        console.log("All wallets funded successfully!");
        console.log("Each wallet now has 10,000,000 IDRX tokens");
    }
}