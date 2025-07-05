// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IEventFactory.sol";
import "./Event.sol";
import "./AccessControl.sol";

/**
 * @title EventFactory
 * @dev Factory contract for creating and managing events
 */
contract EventFactory is IEventFactory, ReentrancyGuard, Pausable, Ownable {
    // Access control contract
    AccessControl public accessControl;
    
    // IDRX token address
    address public idrxToken;
    
    // All created events
    address[] public allEvents;
    mapping(address => bool) public validEvents;
    
    // Events by organizer
    mapping(address => address[]) public organizerEvents;
    
    // Platform fee (in basis points, 100 = 1%)
    uint256 public platformFee = 250; // 2.5%
    address public feeRecipient;
    
    // Events (removed duplicate - using interface events)
    event PlatformFeeUpdated(uint256 oldFee, uint256 newFee);
    event FeeRecipientUpdated(address oldRecipient, address newRecipient);

    // Errors
    error NotAuthorizedOrganizer();
    error InvalidParameters();
    error InvalidFee();

    modifier onlyAuthorizedOrganizer() {
        if (!accessControl.isAuthorizedOrganizer(msg.sender)) {
            revert NotAuthorizedOrganizer();
        }
        _;
    }

    constructor(
        address _accessControl,
        address _idrxToken,
        address _feeRecipient
    ) Ownable(msg.sender) {
        accessControl = AccessControl(_accessControl);
        idrxToken = _idrxToken;
        feeRecipient = _feeRecipient;
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
     * @dev Get events with pagination
     */
    function getEventsPaginated(uint256 offset, uint256 limit) 
        external 
        view 
        returns (address[] memory events, uint256 total) 
    {
        total = allEvents.length;
        
        if (offset >= total) {
            return (new address[](0), total);
        }
        
        uint256 end = offset + limit;
        if (end > total) {
            end = total;
        }
        
        events = new address[](end - offset);
        for (uint256 i = offset; i < end; i++) {
            events[i - offset] = allEvents[i];
        }
        
        return (events, total);
    }

    /**
     * @dev Get recent events (last n events)
     */
    function getRecentEvents(uint256 count) external view returns (address[] memory) {
        uint256 total = allEvents.length;
        if (total == 0) {
            return new address[](0);
        }
        
        uint256 returnCount = count > total ? total : count;
        address[] memory recentEvents = new address[](returnCount);
        
        for (uint256 i = 0; i < returnCount; i++) {
            recentEvents[i] = allEvents[total - 1 - i];
        }
        
        return recentEvents;
    }

    /**
     * @dev Get events by date range
     */
    function getEventsByDateRange(uint256 startDate, uint256 endDate) 
        external 
        view 
        returns (address[] memory) 
    {
        uint256 count = 0;
        
        // First pass: count matching events
        for (uint256 i = 0; i < allEvents.length; i++) {
            Event eventContract = Event(allEvents[i]);
            uint256 eventDate = eventContract.eventDate();
            if (eventDate >= startDate && eventDate <= endDate) {
                count++;
            }
        }
        
        // Second pass: populate array
        address[] memory matchingEvents = new address[](count);
        uint256 index = 0;
        
        for (uint256 i = 0; i < allEvents.length; i++) {
            Event eventContract = Event(allEvents[i]);
            uint256 eventDate = eventContract.eventDate();
            if (eventDate >= startDate && eventDate <= endDate) {
                matchingEvents[index] = allEvents[i];
                index++;
            }
        }
        
        return matchingEvents;
    }

    /**
     * @dev Get factory statistics
     */
    function getFactoryStats() external view returns (
        uint256 totalEvents,
        uint256 totalOrganizers,
        uint256 totalTicketsSold,
        uint256 totalRevenue
    ) {
        totalEvents = allEvents.length;
        
        // Count unique organizers
        address[] memory organizers = accessControl.getOrganizers();
        totalOrganizers = organizers.length;
        
        // Calculate total tickets sold and revenue
        for (uint256 i = 0; i < allEvents.length; i++) {
            Event eventContract = Event(allEvents[i]);
            totalTicketsSold += eventContract.getTotalSold();
            totalRevenue += eventContract.getRevenue();
        }
    }

    /**
     * @dev Update platform fee
     */
    function updatePlatformFee(uint256 newFee) external onlyOwner {
        if (newFee > 1000) revert InvalidFee(); // Max 10%
        
        uint256 oldFee = platformFee;
        platformFee = newFee;
        
        emit PlatformFeeUpdated(oldFee, newFee);
    }

    /**
     * @dev Update fee recipient
     */
    function updateFeeRecipient(address newRecipient) external onlyOwner {
        if (newRecipient == address(0)) revert InvalidParameters();
        
        address oldRecipient = feeRecipient;
        feeRecipient = newRecipient;
        
        emit FeeRecipientUpdated(oldRecipient, newRecipient);
    }

    /**
     * @dev Update access control contract
     */
    function updateAccessControl(address newAccessControl) external onlyOwner {
        if (newAccessControl == address(0)) revert InvalidParameters();
        accessControl = AccessControl(newAccessControl);
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

    /**
     * @dev Remove invalid event (emergency function)
     */
    function removeInvalidEvent(address eventAddress) external onlyOwner {
        validEvents[eventAddress] = false;
    }
}