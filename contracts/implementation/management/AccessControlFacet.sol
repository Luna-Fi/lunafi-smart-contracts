// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { LibAccess } from "../../libraries/LibAccess.sol";

contract AccessControlFacet is LibAccess {
    modifier onlyOwner()
    {
        _enforceIsOwner();
        _;
    }

    function addOwner(address _newOwner) public onlyOwner {
        bytes32 name = _getDefaultAdminRoleName();
        grantRole(name, _newOwner);
    }

    function isOwner(address account) public view returns (bool) {
        bytes32 name = _getDefaultAdminRoleName();
        return hasRole(name, account);
    }
}
