// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts v4.4.0 (access/AccessControl.sol)
pragma solidity ^0.8.10;

import '../repositories/AccessStorageRepository.sol';

library LibAccess {
    modifier onlyRole(bytes32 role) {
        AccessStorageRepository.AccessStore storage _as = AccessStorageRepository.accessStore();
        _checkRole(role, msg.sender);
        _;
    }

    function _getDefaultAdminRoleName() internal view returns (bytes32 adminRoleName_) {
        AccessStorageRepository.AccessStore storage _as = AccessStorageRepository.accessStore();
        adminRoleName_ = _as.DEFAULT_ADMIN_ROLE;
    }

    function _enforceIsDefaultAdmin() internal view {
        AccessStorageRepository.AccessStore storage _as = AccessStorageRepository.accessStore();
        require(hasRole(_as.DEFAULT_ADMIN_ROLE, msg.sender), "Access restricted to Default Admin");
    }

    /**
     * @dev Returns `true` if `account` has been granted `role`.
     */
    function hasRole(bytes32 role, address account) public view returns (bool) {
        AccessStorageRepository.AccessStore storage _as = AccessStorageRepository.accessStore();
        return _as._roles[role].members[account];
    }

    /**
     * @dev Revert with a standard message if `account` is missing `role`.
     *
     * The format of the revert reason is given by the following regular expression:
     *
     *  /^AccessControl: account (0x[0-9a-f]{40}) is missing role (0x[0-9a-f]{64})$/
     */
    function _checkRole(bytes32 role, address account) internal view {
        if (!hasRole(role, account)) {
            revert();
        }
    }

    /**
     * @dev Returns the admin role that controls `role`. See {grantRole} and
     * {revokeRole}.
     *
     * To change a role's admin, use {_setRoleAdmin}.
     */
    function getRoleAdmin(bytes32 role) public view returns (bytes32) {
        AccessStorageRepository.AccessStore storage _as = AccessStorageRepository.accessStore();
        return _as._roles[role].adminRoleName;
    }

    /**
     * @dev Grants `role` to `account`.
     *
     * If `account` had not been already granted `role`, emits a {RoleGranted}
     * event.
     *
     * Requirements:
     *
     * - the caller must have ``role``'s admin role.
     */
    function grantRole(bytes32 role, address account) public onlyRole(getRoleAdmin(role)) {
        _grantRole(role, account);
    }

    /**
     * @dev Revokes `role` from `account`.
     *
     * If `account` had been granted `role`, emits a {RoleRevoked} event.
     *
     * Requirements:
     *
     * - the caller must have ``role``'s admin role.
     */
    function revokeRole(bytes32 role, address account) public onlyRole(getRoleAdmin(role)) {
        _revokeRole(role, account);
    }

    /**
     * @dev Revokes `role` from the calling account.
     *
     * Roles are often managed via {grantRole} and {revokeRole}: this function's
     * purpose is to provide a mechanism for accounts to lose their privileges
     * if they are compromised (such as when a trusted device is misplaced).
     *
     * If the calling account had been revoked `role`, emits a {RoleRevoked}
     * event.
     *
     * Requirements:
     *
     * - the caller must be `account`.
     */
    function renounceRole(bytes32 role, address account) public {
        require(account == msg.sender, "AccessControl: can only renounce roles for self");
        _revokeRole(role, account);
    }

    /**
     * @dev Sets `adminRole` as ``role``'s admin role.
     *
     * Emits a {RoleAdminChanged} event.
     */
    function _setRoleAdmin(bytes32 role, bytes32 adminRole) internal {
        bytes32 previousAdminRole = getRoleAdmin(role);
        AccessStorageRepository.AccessStore storage _as = AccessStorageRepository.accessStore();
        _as._roles[role].adminRoleName = adminRole;
    }

    /**
     * @dev Grants `role` to `account`.
     *
     * Internal function without access restriction.
     */
    function _grantRole(bytes32 role, address account) internal {
        if (!hasRole(role, account)) {
            AccessStorageRepository.AccessStore storage _as = AccessStorageRepository.accessStore();
            _as._roles[role].members[account] = true;
        }
    }

    /**
     * @dev Revokes `role` from `account`.
     *
     * Internal function without access restriction.
     */
    function _revokeRole(bytes32 role, address account) internal {
        if (hasRole(role, account)) {
            AccessStorageRepository.AccessStore storage _as = AccessStorageRepository.accessStore();
            _as._roles[role].members[account] = false;
        }
    }
}
