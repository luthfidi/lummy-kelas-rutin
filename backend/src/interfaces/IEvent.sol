// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

/**
 * @title IEvent
 * @dev Interface for Event contract functionality
 */
interface IEvent {
    struct TicketTier {
        string name;
        uint256 price;
        uint256 available;
        uint256 sold;
        uint256 maxPerPurchase;
        string description;
        bool isActive;
    }

    struct BurnRecord {
        uint256 tokenId;
        address attendee;
        address burnedBy;
        uint256 timestamp;
        uint256 tierId;
    }

    // Event information
    function getEventDetails() external view returns (
        string memory name,
        string memory description,
        uint256 date,
        string memory venue,
        address organizer
    );

    // Ticket tier management
    function addTicketTier(
        string memory name,
        uint256 price,
        uint256 available,
        uint256 maxPerPurchase,
        string memory description
    ) external;
    
    function updateTierAvailability(uint256 tierId, uint256 newAmount) external;
    function getTierDetails(uint256 tierId) external view returns (TicketTier memory);
    function tierCount() external view returns (uint256);

    // Ticket operations
    function purchaseTicket(uint256 tierId, uint256 quantity) external;
    function checkInAndBurn(uint256 tokenId) external;

    // Staff management
    function addAuthorizedStaff(address staff) external;
    function removeAuthorizedStaff(address staff) external;
    function isAuthorizedStaff(address staff) external view returns (bool);

    // Analytics
    function getTotalSold() external view returns (uint256);
    function getRevenue() external view returns (uint256);
    function getBurnHistory() external view returns (BurnRecord[] memory);
    function getActiveTickets() external view returns (uint256[] memory);

    // Events
    event TicketTierAdded(uint256 indexed tierId, string name, uint256 price);
    event TicketPurchased(address indexed buyer, uint256 indexed tokenId, uint256 indexed tierId, uint256 quantity);
    event StaffAdded(address indexed staff, address indexed organizer);
    event StaffRemoved(address indexed staff, address indexed organizer);
    event TicketBurned(uint256 indexed tokenId, address indexed attendee, address indexed burnedBy);
    event RevenueCollected(address indexed organizer, uint256 amount);
}