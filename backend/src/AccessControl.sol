// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title AccessControl
 * @dev Central access control for the Lummy Burn NFT platform
 * Manages roles: Admin, Organizers, and Event-specific Staff
 */
contract AccessControl is Ownable, Pausable {
    // Role constants
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant ORGANIZER_ROLE = keccak256("ORGANIZER_ROLE");
    bytes32 public constant STAFF_ROLE = keccak256("STAFF_ROLE");

    // Role mappings
    mapping(address => bool) public authorizedOrganizers;
    mapping(address => mapping(address => bool)) public organizerStaff; // organizer => staff => authorized
    mapping(address => address[]) public organizerStaffList; // organizer => staff addresses
    mapping(address => address) public staffToOrganizer; // staff => organizer

    // Track organizers
    address[] public organizerList;
    mapping(address => bool) public isOrganizerInList;

    // Events
    event OrganizerAdded(address indexed organizer, address indexed admin);
    event OrganizerRemoved(address indexed organizer, address indexed admin);
    event StaffAdded(address indexed staff, address indexed organizer);
    event StaffRemoved(address indexed staff, address indexed organizer);

    // Errors
    error NotAuthorized();
    error AlreadyAuthorized();
    error NotFound();
    error InvalidAddress();

    modifier onlyAdmin() {
        if (msg.sender != owner()) revert NotAuthorized();
        _;
    }

    modifier onlyAuthorizedOrganizer() {
        if (!authorizedOrganizers[msg.sender]) revert NotAuthorized();
        _;
    }

    constructor() Ownable(msg.sender) {
        // Contract deployer becomes the admin
    }

    /**
     * @dev Add a new authorized organizer
     * @param organizer Address to authorize as organizer
     */
    function addOrganizer(address organizer) external onlyAdmin whenNotPaused {
        if (organizer == address(0)) revert InvalidAddress();
        if (authorizedOrganizers[organizer]) revert AlreadyAuthorized();

        authorizedOrganizers[organizer] = true;
        
        if (!isOrganizerInList[organizer]) {
            organizerList.push(organizer);
            isOrganizerInList[organizer] = true;
        }

        emit OrganizerAdded(organizer, msg.sender);
    }

    /**
     * @dev Remove an organizer and all their staff
     * @param organizer Address to remove from organizers
     */
    function removeOrganizer(address organizer) external onlyAdmin {
        if (!authorizedOrganizers[organizer]) revert NotFound();

        // Remove all staff for this organizer
        address[] memory staffList = organizerStaffList[organizer];
        for (uint256 i = 0; i < staffList.length; i++) {
            address staff = staffList[i];
            organizerStaff[organizer][staff] = false;
            delete staffToOrganizer[staff];
        }
        delete organizerStaffList[organizer];

        // Remove organizer
        authorizedOrganizers[organizer] = false;

        emit OrganizerRemoved(organizer, msg.sender);
    }

    /**
     * @dev Add staff member for an organizer
     * @param staff Address to authorize as staff
     */
    function addStaff(address staff) external onlyAuthorizedOrganizer whenNotPaused {
        if (staff == address(0)) revert InvalidAddress();
        if (organizerStaff[msg.sender][staff]) revert AlreadyAuthorized();

        organizerStaff[msg.sender][staff] = true;
        organizerStaffList[msg.sender].push(staff);
        staffToOrganizer[staff] = msg.sender;

        emit StaffAdded(staff, msg.sender);
    }

    /**
     * @dev Remove staff member from an organizer
     * @param staff Address to remove from staff
     */
    function removeStaff(address staff) external onlyAuthorizedOrganizer {
        if (!organizerStaff[msg.sender][staff]) revert NotFound();

        organizerStaff[msg.sender][staff] = false;
        delete staffToOrganizer[staff];

        // Remove from staff list
        address[] storage staffList = organizerStaffList[msg.sender];
        for (uint256 i = 0; i < staffList.length; i++) {
            if (staffList[i] == staff) {
                staffList[i] = staffList[staffList.length - 1];
                staffList.pop();
                break;
            }
        }

        emit StaffRemoved(staff, msg.sender);
    }

    /**
     * @dev Check if address is authorized organizer
     */
    function isAuthorizedOrganizer(address organizer) external view returns (bool) {
        return authorizedOrganizers[organizer];
    }

    /**
     * @dev Check if address is authorized staff for specific organizer
     */
    function isAuthorizedStaff(address staff, address organizer) external view returns (bool) {
        return organizerStaff[organizer][staff];
    }

    /**
     * @dev Get all authorized organizers
     */
    function getOrganizers() external view returns (address[] memory) {
        return organizerList;
    }

    /**
     * @dev Get all staff for an organizer
     */
    function getOrganizerStaff(address organizer) external view returns (address[] memory) {
        return organizerStaffList[organizer];
    }

    /**
     * @dev Get organizer for a staff member
     */
    function getStaffOrganizer(address staff) external view returns (address) {
        return staffToOrganizer[staff];
    }

    /**
     * @dev Emergency pause function
     */
    function pause() external onlyAdmin {
        _pause();
    }

    /**
     * @dev Unpause function
     */
    function unpause() external onlyAdmin {
        _unpause();
    }
}