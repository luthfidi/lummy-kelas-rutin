// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockIDRX
 * @dev Mock IDRX token for testing purposes
 * In production, this will be the real IDRX token at 0xD63029C1a3dA68b51c67c6D1DeC3DEe50D681661
 */
contract MockIDRX is ERC20, Ownable {
    uint8 private _decimals;

    constructor() ERC20("Mock IDRX", "IDRX") Ownable(msg.sender) {
        _decimals = 18;
        
        // Mint initial supply to deployer
        _mint(msg.sender, 1000000000 * 10**_decimals); // 1 billion IDRX
    }

    /**
     * @dev Override decimals
     */
    function decimals() public view override returns (uint8) {
        return _decimals;
    }

    /**
     * @dev Mint tokens to address (for testing)
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    /**
     * @dev Faucet function for testing - anyone can get 10000 IDRX
     */
    function faucet() external {
        require(balanceOf(msg.sender) < 50000 * 10**_decimals, "Already have enough tokens");
        _mint(msg.sender, 10000 * 10**_decimals);
    }

    /**
     * @dev Burn tokens
     */
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }

    /**
     * @dev Burn tokens from address (with allowance)
     */
    function burnFrom(address account, uint256 amount) external {
        _spendAllowance(account, msg.sender, amount);
        _burn(account, amount);
    }
}