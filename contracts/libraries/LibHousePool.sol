// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import '../repositories/HousePoolStorage.sol';
import  '../repositories/TokenStorage.sol';

import "hardhat/console.sol";

library LibHousePool {
    /// @param ckey key generated from claim token name
    function setInitialExchangeRatio(bytes32 ckey, uint256 value)
        internal
    {
        HousePoolStorage.HousePoolStore storage hps = HousePoolStorage.housePoolStore();
        require(hps.housePools[ckey].initialExchangeRatio != 0,
                "LibHousePool: Initial exchange ratio is already set");
        hps.housePools[ckey].initialExchangeRatio = value;
    }

    function getCurrentExchangeRatio(bytes32 ckey)
        internal view returns (uint256 ratio)
    {
        TokenStorage.TokenStore storage ts = TokenStorage.tokenStore();
        HousePoolStorage.HousePoolStore storage hps = HousePoolStorage.housePoolStore();

        if (ts.erc20Tokens[ckey].totalSupply == 0)
            {
                return hps.housePools[ckey].initialExchangeRatio;
            }

        unchecked {
            ratio = hps.housePools[ckey].totalLiquidity / ts.erc20Tokens[ckey].totalSupply;
        }
    }
}
