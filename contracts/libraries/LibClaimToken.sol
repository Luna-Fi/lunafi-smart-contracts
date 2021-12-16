// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

// import  '../repositories/ClaimTokenStorageRepository.sol';
import { IERC20MetadataUser } from '../interfaces/IERC20User.sol';
import "hardhat/console.sol";

library LibClaimToken {
    event Registered(address _actor, bytes32 _currencyKey);
    event UnRegistered(address _actor, bytes32 _currencyKey);

    /// @notice name of token converted to bytes32 is used as its key for storage
    function _getERC20StoreKey(string memory name)
        internal pure returns (bytes32 currency)
    {
        currency = keccak256(abi.encodePacked(name));
    }

    /// @dev name, symbol, decimals & inverse address must NOT have setters; use register instead
    function registerClaimToken(IERC20MetadataUser.ERC20Metadata storage tokenInfo_, bytes32 currencyKey)
        internal
    {
        require(currencyKey != "", 'LibERC20: token exists');
        currencyKey = _getERC20StoreKey(tokenInfo_.name);

        // ERC20StorageRepository.ClaimTokenStore storage cts = ERC20StorageRepository.claimTokenStore();
        // cts.currencies[currencyKey].tokenInfo = tokenInfo_;

        emit Registered(msg.sender, currencyKey);
    }

    function unregisterClaimToken(bytes32 tokenKey)
        internal
    {
        // ERC20StorageRepository.ClaimTokenStore storage cts = ERC20StorageRepository.claimTokenStore();
        // delete cts.currencies[tokenKey];
        emit UnRegistered(msg.sender, tokenKey);
    }
}
