// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import { LibAccess } from '../libraries/LibAccess.sol';

contract ERC20Facet {
    function initializeERC20Facet()
        external onlyRole(LibAccess._getDefaultAdminRoleName())
    {
        // bytes32 constant ERC20CREATOR_ROLE = keccak256();
    }

    modifier onlyRole(bytes32 _roleName) {
        require(LibAccess.hasRole(_roleName, msg.sender), "Access restricted to specific role");
        _;
    }

    // function createERC20()
        // external onlyRole(.)
}
