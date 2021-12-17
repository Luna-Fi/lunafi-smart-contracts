// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import { LibDiamond } from "../libraries/LibDiamond.sol";
import { LibAccess } from "../libraries/LibAccess.sol";
import 'hardhat/console.sol';

contract AccessControlFacet {
    modifier onlyRole(bytes32 _roleName) {
        require(LibAccess.hasRole(_roleName, msg.sender), "Access restricted to specific role");
        _;
    }

    modifier onlyAdmin {
        require(msg.sender == LibDiamond.contractOwner(), "Access restricted to specific role");
        _;
    }

    function initAccessControl()
        external onlyAdmin
    {
        // Initially, makes the diamond owner the default admin
        bytes32 roleName = LibAccess._getDefaultAdminRoleName();
        LibAccess._grantRole(roleName, LibDiamond.contractOwner());
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
