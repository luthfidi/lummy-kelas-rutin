// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

/**
 * @title ITicketNFT
 * @dev Interface for NFT tickets with burn functionality
 */
interface ITicketNFT {
    struct TicketMetadata {
        uint256 tierId;
        address originalOwner;
        address currentOwner;
        uint256 mintTimestamp;
        uint256 burnTimestamp;
        address burnedBy;
        bool isUsed;
    }

    // Core NFT functions
    function mint(address to, uint256 tierId) external returns (uint256);
    function burn(uint256 tokenId) external;
    function burnTicket(uint256 tokenId) external;

    // Metadata functions
    function getTicketMetadata(uint256 tokenId) external view returns (TicketMetadata memory);
    function getTicketsByOwner(address owner) external view returns (uint256[] memory);
    function isTicketValid(uint256 tokenId) external view returns (bool);
    function getTicketTier(uint256 tokenId) external view returns (uint256);

    // Burn tracking
    function isBurned(uint256 tokenId) external view returns (bool);
    function getBurnTimestamp(uint256 tokenId) external view returns (uint256);
    function getBurnedBy(uint256 tokenId) external view returns (address);

    // Events
    event TicketMinted(address indexed to, uint256 indexed tokenId, uint256 indexed tierId);
    event TicketBurned(uint256 indexed tokenId, address indexed burnedBy, uint256 timestamp);
}