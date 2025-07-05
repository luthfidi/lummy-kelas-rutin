// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "forge-std/Test.sol";
import "../../src/AccessControl.sol";

contract AccessControlTest is Test {
    AccessControl public accessControl;
    
    address admin = address(0x1);
    address organizer1 = address(0x2);
    address organizer2 = address(0x3);
    address staff1 = address(0x4);
    address staff2 = address(0x5);
    address unauthorized = address(0x6);

    event OrganizerAdded(address indexed organizer, address indexed admin);
    event OrganizerRemoved(address indexed organizer, address indexed admin);
    event StaffAdded(address indexed staff, address indexed organizer);
    event StaffRemoved(address indexed staff, address indexed organizer);

    function setUp() public {
        vm.prank(admin);
        accessControl = new AccessControl();
    }

    function testInitialState() public {
        assertEq(accessControl.owner(), admin);
        assertFalse(accessControl.authorizedOrganizers(organizer1));
        assertFalse(accessControl.organizerStaff(organizer1, staff1));
    }

    function testAddOrganizer() public {
        vm.prank(admin);
        vm.expectEmit(true, true, false, false);
        emit OrganizerAdded(organizer1, admin);
        
        accessControl.addOrganizer(organizer1);
        
        assertTrue(accessControl.authorizedOrganizers(organizer1));
        assertTrue(accessControl.isOrganizerInList(organizer1));
        
        address[] memory organizers = accessControl.getOrganizers();
        assertEq(organizers.length, 1);
        assertEq(organizers[0], organizer1);
    }

    function testAddOrganizerOnlyAdmin() public {
        vm.prank(unauthorized);
        vm.expectRevert(AccessControl.NotAuthorized.selector);
        accessControl.addOrganizer(organizer1);
    }

    function testAddOrganizerZeroAddress() public {
        vm.prank(admin);
        vm.expectRevert(AccessControl.InvalidAddress.selector);
        accessControl.addOrganizer(address(0));
    }

    function testAddOrganizerAlreadyAuthorized() public {
        vm.prank(admin);
        accessControl.addOrganizer(organizer1);
        
        vm.prank(admin);
        vm.expectRevert(AccessControl.AlreadyAuthorized.selector);
        accessControl.addOrganizer(organizer1);
    }

    function testRemoveOrganizer() public {
        // Add organizer first
        vm.prank(admin);
        accessControl.addOrganizer(organizer1);
        
        // Add staff to organizer
        vm.prank(organizer1);
        accessControl.addStaff(staff1);
        
        // Remove organizer
        vm.prank(admin);
        vm.expectEmit(true, true, false, false);
        emit OrganizerRemoved(organizer1, admin);
        
        accessControl.removeOrganizer(organizer1);
        
        assertFalse(accessControl.authorizedOrganizers(organizer1));
        assertFalse(accessControl.organizerStaff(organizer1, staff1));
        assertEq(accessControl.staffToOrganizer(staff1), address(0));
    }

    function testRemoveOrganizerNotFound() public {
        vm.prank(admin);
        vm.expectRevert(AccessControl.NotFound.selector);
        accessControl.removeOrganizer(organizer1);
    }

    function testAddStaff() public {
        // Add organizer first
        vm.prank(admin);
        accessControl.addOrganizer(organizer1);
        
        vm.prank(organizer1);
        vm.expectEmit(true, true, false, false);
        emit StaffAdded(staff1, organizer1);
        
        accessControl.addStaff(staff1);
        
        assertTrue(accessControl.organizerStaff(organizer1, staff1));
        assertEq(accessControl.staffToOrganizer(staff1), organizer1);
        
        address[] memory staffList = accessControl.getOrganizerStaff(organizer1);
        assertEq(staffList.length, 1);
        assertEq(staffList[0], staff1);
    }

    function testAddStaffOnlyOrganizer() public {
        vm.prank(unauthorized);
        vm.expectRevert(AccessControl.NotAuthorized.selector);
        accessControl.addStaff(staff1);
    }

    function testAddStaffZeroAddress() public {
        vm.prank(admin);
        accessControl.addOrganizer(organizer1);
        
        vm.prank(organizer1);
        vm.expectRevert(AccessControl.InvalidAddress.selector);
        accessControl.addStaff(address(0));
    }

    function testRemoveStaff() public {
        // Setup
        vm.prank(admin);
        accessControl.addOrganizer(organizer1);
        
        vm.prank(organizer1);
        accessControl.addStaff(staff1);
        
        // Remove staff
        vm.prank(organizer1);
        vm.expectEmit(true, true, false, false);
        emit StaffRemoved(staff1, organizer1);
        
        accessControl.removeStaff(staff1);
        
        assertFalse(accessControl.organizerStaff(organizer1, staff1));
        assertEq(accessControl.staffToOrganizer(staff1), address(0));
        
        address[] memory staffList = accessControl.getOrganizerStaff(organizer1);
        assertEq(staffList.length, 0);
    }

    function testRemoveStaffNotFound() public {
        vm.prank(admin);
        accessControl.addOrganizer(organizer1);
        
        vm.prank(organizer1);
        vm.expectRevert(AccessControl.NotFound.selector);
        accessControl.removeStaff(staff1);
    }

    function testPause() public {
        vm.prank(admin);
        accessControl.pause();
        
        assertTrue(accessControl.paused());
        
        // Should not be able to add organizer when paused
        vm.prank(admin);
        vm.expectRevert(); // OpenZeppelin v5 uses different error format
        accessControl.addOrganizer(organizer1);
    }

    function testUnpause() public {
        vm.prank(admin);
        accessControl.pause();
        
        vm.prank(admin);
        accessControl.unpause();
        
        assertFalse(accessControl.paused());
        
        // Should be able to add organizer after unpause
        vm.prank(admin);
        accessControl.addOrganizer(organizer1);
        assertTrue(accessControl.authorizedOrganizers(organizer1));
    }

    function testMultipleOrganizers() public {
        vm.prank(admin);
        accessControl.addOrganizer(organizer1);
        
        vm.prank(admin);
        accessControl.addOrganizer(organizer2);
        
        assertTrue(accessControl.authorizedOrganizers(organizer1));
        assertTrue(accessControl.authorizedOrganizers(organizer2));
        
        address[] memory organizers = accessControl.getOrganizers();
        assertEq(organizers.length, 2);
    }

    function testStaffIsolation() public {
        // Setup two organizers
        vm.prank(admin);
        accessControl.addOrganizer(organizer1);
        
        vm.prank(admin);
        accessControl.addOrganizer(organizer2);
        
        // Organizer1 adds staff1
        vm.prank(organizer1);
        accessControl.addStaff(staff1);
        
        // Organizer2 adds staff2
        vm.prank(organizer2);
        accessControl.addStaff(staff2);
        
        // Check isolation
        assertTrue(accessControl.organizerStaff(organizer1, staff1));
        assertFalse(accessControl.organizerStaff(organizer1, staff2));
        
        assertTrue(accessControl.organizerStaff(organizer2, staff2));
        assertFalse(accessControl.organizerStaff(organizer2, staff1));
        
        assertEq(accessControl.staffToOrganizer(staff1), organizer1);
        assertEq(accessControl.staffToOrganizer(staff2), organizer2);
    }
}