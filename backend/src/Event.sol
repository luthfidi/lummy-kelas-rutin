// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IEvent.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./TicketNFT.sol";
import "./AccessControl.sol";

/**
 * @title Event
 * @dev Main event contract managing ticket sales, tiers, and venue operations
 */
contract Event is IEvent, ReentrancyGuard, Pausable, Ownable {
    // Event information
    string public eventName;
    string public description;
    uint256 public eventDate;
    string public venue;
    address public organizer;
    string public ipfsMetadata;

    // Contracts
    TicketNFT public ticketNFT;
    IERC20 public idrxToken;
    AccessControl public accessControl;

    // Ticket tiers
    mapping(uint256 => TicketTier) public ticketTiers;
    uint256 public tierCount;

    // Staff management
    mapping(address => bool) public authorizedStaff;
    address[] public staffList;

    // Burn tracking
    BurnRecord[] public burnHistory;
    mapping(uint256 => bool) public burnedTickets;
    uint256[] public activeTickets;
    mapping(uint256 => uint256) public activeTicketIndex; // tokenId => index in activeTickets

    // Revenue tracking
    uint256 public totalRevenue;
    mapping(uint256 => uint256) public tierRevenue; // tierId => revenue

    // Errors
    error NotAuthorized();
    error InvalidTier();
    error InsufficientSupply();
    error InvalidQuantity();
    error PaymentFailed();
    error TicketNotFound();
    error TicketAlreadyBurned();
    error InvalidPrice();
    error TierNotActive();

    modifier onlyOrganizer() {
        if (msg.sender != organizer) revert NotAuthorized();
        _;
    }

    modifier onlyStaffOrOrganizer() {
        if (msg.sender != organizer && !authorizedStaff[msg.sender]) {
            revert NotAuthorized();
        }
        _;
    }

    constructor(
        string memory _name,
        string memory _description,
        uint256 _date,
        string memory _venue,
        string memory _ipfsMetadata,
        address _organizer,
        address _idrxToken,
        address _accessControl
    ) Ownable(_organizer) {
        eventName = _name;
        description = _description;
        eventDate = _date;
        venue = _venue;
        ipfsMetadata = _ipfsMetadata;
        organizer = _organizer;
        idrxToken = IERC20(_idrxToken);
        accessControl = AccessControl(_accessControl);

        // Deploy NFT contract
        string memory nftName = string(abi.encodePacked("Lummy: ", _name));
        string memory nftSymbol = "LUMMY";
        string memory baseURI = string(abi.encodePacked("https://api.lummy.io/metadata/", _ipfsMetadata, "/"));
        
        ticketNFT = new TicketNFT(nftName, nftSymbol, address(this), baseURI);
    }

    /**
     * @dev Get event details
     */
    function getEventDetails() external view returns (
        string memory name,
        string memory desc,
        uint256 date,
        string memory venueLocation,
        address eventOrganizer
    ) {
        return (eventName, description, eventDate, venue, organizer);
    }

    /**
     * @dev Add a new ticket tier
     */
    function addTicketTier(
        string memory name,
        uint256 price,
        uint256 available,
        uint256 maxPerPurchase,
        string memory tierDescription
    ) external onlyOrganizer {
        if (price == 0) revert InvalidPrice();
        if (available == 0) revert InvalidQuantity();

        uint256 tierId = tierCount;
        
        ticketTiers[tierId] = TicketTier({
            name: name,
            price: price,
            available: available,
            sold: 0,
            maxPerPurchase: maxPerPurchase,
            description: tierDescription,
            isActive: true
        });

        tierCount++;
        emit TicketTierAdded(tierId, name, price);
    }

    /**
     * @dev Update tier availability
     */
    function updateTierAvailability(uint256 tierId, uint256 newAmount) external onlyOrganizer {
        if (tierId >= tierCount) revert InvalidTier();
        
        TicketTier storage tier = ticketTiers[tierId];
        if (newAmount < tier.sold) revert InvalidQuantity();
        
        tier.available = newAmount;
    }

    /**
     * @dev Get tier details
     */
    function getTierDetails(uint256 tierId) external view returns (TicketTier memory) {
        if (tierId >= tierCount) revert InvalidTier();
        return ticketTiers[tierId];
    }

    /**
     * @dev Purchase tickets
     */
    function purchaseTicket(uint256 tierId, uint256 quantity) external nonReentrant whenNotPaused {
        if (tierId >= tierCount) revert InvalidTier();
        if (quantity == 0) revert InvalidQuantity();

        TicketTier storage tier = ticketTiers[tierId];
        
        if (!tier.isActive) revert TierNotActive();
        if (quantity > tier.maxPerPurchase) revert InvalidQuantity();
        if (tier.sold + quantity > tier.available) revert InsufficientSupply();

        uint256 totalCost = tier.price * quantity;

        // Transfer IDRX payment
        if (!idrxToken.transferFrom(msg.sender, organizer, totalCost)) {
            revert PaymentFailed();
        }

        // Update tier data
        tier.sold += quantity;
        totalRevenue += totalCost;
        tierRevenue[tierId] += totalCost;

        // Mint NFTs
        for (uint256 i = 0; i < quantity; i++) {
            uint256 tokenId = ticketNFT.mint(msg.sender, tierId);
            activeTickets.push(tokenId);
            activeTicketIndex[tokenId] = activeTickets.length - 1;
            
            emit TicketPurchased(msg.sender, tokenId, tierId, 1);
        }

        emit RevenueCollected(organizer, totalCost);
    }

    /**
     * @dev Add authorized staff
     */
    function addAuthorizedStaff(address staff) external onlyOrganizer {
        if (authorizedStaff[staff]) return; // Already authorized

        authorizedStaff[staff] = true;
        staffList.push(staff);

        emit StaffAdded(staff, organizer);
    }

    /**
     * @dev Remove authorized staff
     */
    function removeAuthorizedStaff(address staff) external onlyOrganizer {
        if (!authorizedStaff[staff]) return; // Not authorized

        authorizedStaff[staff] = false;

        // Remove from staff list
        for (uint256 i = 0; i < staffList.length; i++) {
            if (staffList[i] == staff) {
                staffList[i] = staffList[staffList.length - 1];
                staffList.pop();
                break;
            }
        }

        emit StaffRemoved(staff, organizer);
    }

    /**
     * @dev Check if address is authorized staff
     */
    function isAuthorizedStaff(address staff) external view returns (bool) {
        return authorizedStaff[staff];
    }

    /**
     * @dev Check in and burn ticket at venue
     */
    function checkInAndBurn(uint256 tokenId) external onlyStaffOrOrganizer nonReentrant {
        if (!ticketNFT.isTicketValid(tokenId)) revert TicketNotFound();
        if (burnedTickets[tokenId]) revert TicketAlreadyBurned();

        // Get ticket metadata before burning
        ITicketNFT.TicketMetadata memory metadata = ticketNFT.getTicketMetadata(tokenId);
        
        // Mark as burned
        burnedTickets[tokenId] = true;

        // Remove from active tickets
        uint256 index = activeTicketIndex[tokenId];
        uint256 lastIndex = activeTickets.length - 1;
        
        if (index != lastIndex) {
            uint256 lastTokenId = activeTickets[lastIndex];
            activeTickets[index] = lastTokenId;
            activeTicketIndex[lastTokenId] = index;
        }
        
        activeTickets.pop();
        delete activeTicketIndex[tokenId];

        // Add to burn history
        burnHistory.push(BurnRecord({
            tokenId: tokenId,
            attendee: metadata.currentOwner,
            burnedBy: msg.sender,
            timestamp: block.timestamp,
            tierId: metadata.tierId
        }));

        // Burn the NFT
        ticketNFT.burn(tokenId);

        emit TicketBurned(tokenId, metadata.currentOwner, msg.sender);
    }

    /**
     * @dev Get total tickets sold
     */
    function getTotalSold() external view returns (uint256) {
        uint256 total = 0;
        for (uint256 i = 0; i < tierCount; i++) {
            total += ticketTiers[i].sold;
        }
        return total;
    }

    /**
     * @dev Get total revenue
     */
    function getRevenue() external view returns (uint256) {
        return totalRevenue;
    }

    /**
     * @dev Get burn history
     */
    function getBurnHistory() external view returns (BurnRecord[] memory) {
        return burnHistory;
    }

    /**
     * @dev Get active tickets
     */
    function getActiveTickets() external view returns (uint256[] memory) {
        return activeTickets;
    }

    /**
     * @dev Get staff list
     */
    function getStaffList() external view returns (address[] memory) {
        return staffList;
    }

    /**
     * @dev Get tier revenue
     */
    function getTierRevenue(uint256 tierId) external view returns (uint256) {
        return tierRevenue[tierId];
    }

    /**
     * @dev Toggle tier active status
     */
    function toggleTierStatus(uint256 tierId) external onlyOrganizer {
        if (tierId >= tierCount) revert InvalidTier();
        ticketTiers[tierId].isActive = !ticketTiers[tierId].isActive;
    }

    /**
     * @dev Update tier price
     */
    function updateTierPrice(uint256 tierId, uint256 newPrice) external onlyOrganizer {
        if (tierId >= tierCount) revert InvalidTier();
        if (newPrice == 0) revert InvalidPrice();
        
        ticketTiers[tierId].price = newPrice;
    }

    /**
     * @dev Emergency pause
     */
    function pause() external onlyOrganizer {
        _pause();
    }

    /**
     * @dev Unpause
     */
    function unpause() external onlyOrganizer {
        _unpause();
    }

    /**
     * @dev Get ticket NFT contract address
     */
    function getTicketNFTAddress() external view returns (address) {
        return address(ticketNFT);
    }

    /**
     * @dev Get burn statistics
     */
    function getBurnStats() external view returns (
        uint256 totalBurned,
        uint256 totalActive,
        uint256 totalMinted
    ) {
        totalBurned = burnHistory.length;
        totalActive = activeTickets.length;
        totalMinted = ticketNFT.totalSupplyEver();
    }

    /**
     * @dev Check if ticket belongs to this event
     */
    function isEventTicket(uint256 tokenId) external view returns (bool) {
        try ticketNFT.getTicketMetadata(tokenId) returns (ITicketNFT.TicketMetadata memory) {
            return true;
        } catch {
            return false;
        }
    }

    /**
     * @dev Emergency withdraw function (only for stuck tokens)
     */
    function emergencyWithdraw() external onlyOrganizer {
        uint256 balance = idrxToken.balanceOf(address(this));
        if (balance > 0) {
            idrxToken.transfer(organizer, balance);
        }
    }
}