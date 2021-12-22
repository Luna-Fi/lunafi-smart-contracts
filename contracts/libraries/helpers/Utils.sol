// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

library Utils {
    /// @notice 'name' of token converted to bytes32 is used as its key for storage
    function _getTokenStoreKey(string memory name)
        internal pure returns (bytes32 currency)
    {
        currency = keccak256(abi.encodePacked(name));
    }
}
