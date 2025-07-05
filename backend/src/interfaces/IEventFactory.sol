// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

/**
 * @title IEventFactory
 * @dev Interface for EventFactory contract
 */
interface IEventFactory {
    struct EventParams {
        string name;
        string description;
        uint256 date;
        string venue;
        string ipfsMetadata;
    }

    // Event creation
    function createEvent(EventParams memory params) external returns (address);
    
    // Event queries
    function getEvents() external view returns (address[] memory);
    function getEventsByOrganizer(address organizer) external view returns (address[] memory);
    function isValidEvent(address eventAddress) external view returns (bool);
    function getEventCount() external view returns (uint256);

    // Access control
    function isAuthorizedOrganizer(address organizer) external view returns (bool);

    // Events
    event EventCreated(
        address indexed eventAddress, 
        address indexed organizer, 
        string name,
        uint256 date
    );
}