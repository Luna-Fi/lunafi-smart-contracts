// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import '../libraries/helpers/Utils.sol';
import '../libraries/LibToken.sol';
import { IClaimTokenDataUser } from '../interfaces/ICTUser.sol';
    // struct ClaimTokenData {
        // address forERC20;
    // }
import "hardhat/console.sol";

library LibClaimToken {
    event Registered(address _actor, bytes32 _currencyKey);
    event UnRegistered(address _actor, bytes32 _currencyKey);

    function registerClaimToken(IClaimTokenDataUser.ClaimTokenData storage tokenInfo, bytes32 currencyKey)
        internal
    {
        // require(currencyKey != "", 'LibClaimToken: ERC20 token doesnt exist');
        // LibERC20.erc20Exists()

        // emit Registered(msg.sender, currencyKey);
    }

    function unregisterClaimToken(bytes32 tokenKey)
        internal
    {
        // ERC20StorageRepository.ClaimTokenStore storage cts = ERC20StorageRepository.claimTokenStore();
        // delete cts.currencies[tokenKey];
        emit UnRegistered(msg.sender, tokenKey);
    }
}
