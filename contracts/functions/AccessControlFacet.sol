// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { LibDiamond } from "../libraries/LibDiamond.sol";
import { LibAccess } from "../libraries/LibAccess.sol";

contract AccessControlFacet {
    function init() external {
        // Initially, makes the diamond owner the default admin
        bytes32 roleName = LibAccess._getDefaultAdminRoleName();
        LibAccess._grantRole(roleName, LibDiamond.contractOwner());
    }

    modifier onlyRole(bytes32 _roleName) {
        require(LibAccess.hasRole(_roleName, msg.sender), "Access restricted to specific role");
        _;
    }

    function addDefaultAdmin(address _newDefaultAdmin)
        external onlyRole(LibAccess._getDefaultAdminRoleName())
    {
        LibAccess.grantRole(LibAccess._getDefaultAdminRoleName(), _newDefaultAdmin);
    }

    function grantRole(bytes32 roleName, address newUser) external
        onlyRole(LibAccess._getDefaultAdminRoleName())
    {
        LibAccess.grantRole(roleName, newUser);
    }
}
