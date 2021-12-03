// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

contract AccessStorageRepository {
    bytes32 internal constant ACCESS_STORAGE_POSITION = keccak256("lunafi.access");

    struct RoleData {
        mapping(address => bool) members;
        bytes32 adminRoleName;
    }
    struct AccessStore {
        bytes32 DEFAULT_ADMIN_ROLE;
        mapping(bytes32 => RoleData) _roles;
    }

    function accessStore()
        internal pure
        returns(AccessStore storage _as)
    {
        bytes32 position = ACCESS_STORAGE_POSITION;
        assembly { _as.slot := position }
    }
}
