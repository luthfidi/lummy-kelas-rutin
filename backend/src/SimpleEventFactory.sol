// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IEventFactory.sol";
import "./Event.sol";
import "./AccessControl.sol";

/**
 * @title SimpleEventFactory
 * @dev Simplified factory contract for creating events (optimized for size)
 */
contract SimpleEventFactory is IEventFactory, ReentrancyGuard, Pausable, Ownable {
    // Access control contract
    AccessControl public accessControl;
    
    // IDRX token address
    address public idrxToken;
    
    // All created events
    address[] public allEvents;
    mapping(address => bool) public validEvents;
    
    // Events by organizer
    mapping(address => address[]) public organizerEvents;

    // Errors
    error NotAuthorizedOrganizer();
    error InvalidParameters();

    modifier onlyAuthorizedOrganizer() {
        if (!accessControl.isAuthorizedOrganizer(msg.sender)) {
            revert NotAuthorizedOrganizer();
        }
        _;
    }

    constructor(
        address _accessControl,
        address _idrxToken,
        address /* _feeRecipient */
    ) Ownable(msg.sender) {
        accessControl = AccessControl(_accessControl);
        idrxToken = _idrxToken;
    }

    /**
     * @dev Create a new event
     */
    function createEvent(EventParams memory params) 
        external 
        onlyAuthorizedOrganizer 
        nonReentrant 
        whenNotPaused 
        returns (address) 
    {
        // Validate parameters
        if (bytes(params.name).length == 0) revert InvalidParameters();
        if (bytes(params.venue).length == 0) revert InvalidParameters();
        if (params.date <= block.timestamp) revert InvalidParameters();

        // Deploy new Event contract
        Event newEvent = new Event(
            params.name,
            params.description,
            params.date,
            params.venue,
            params.ipfsMetadata,
            msg.sender,
            idrxToken,
            address(accessControl)
        );

        address eventAddress = address(newEvent);

        // Track the event
        allEvents.push(eventAddress);
        validEvents[eventAddress] = true;
        organizerEvents[msg.sender].push(eventAddress);

        emit EventCreated(eventAddress, msg.sender, params.name, params.date);
        
        return eventAddress;
    }

    /**
     * @dev Get all events
     */
    function getEvents() external view returns (address[] memory) {
        return allEvents;
    }

    /**
     * @dev Get events by organizer
     */
    function getEventsByOrganizer(address organizer) external view returns (address[] memory) {
        return organizerEvents[organizer];
    }

    /**
     * @dev Check if event is valid
     */
    function isValidEvent(address eventAddress) external view returns (bool) {
        return validEvents[eventAddress];
    }

    /**
     * @dev Get total event count
     */
    function getEventCount() external view returns (uint256) {
        return allEvents.length;
    }

    /**
     * @dev Check if address is authorized organizer
     */
    function isAuthorizedOrganizer(address organizer) external view returns (bool) {
        return accessControl.isAuthorizedOrganizer(organizer);
    }

    /**
     * @dev Emergency pause
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause
     */
    function unpause() external onlyOwner {
        _unpause();
    }
}