// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import { IHousePoolUser } from '../interfaces/IHousePoolUser.sol';
// struct ERC20Data {
//     ERC20Metadata tokenMetadata;
//     address erc20Implementation;
//     address forERC20;
//     uint256 totalSupply;
//     mapping(address => uint256) balances;
//     mapping(address => mapping(address => uint256)) allowances;
// }
// struct HousePoolData {
//     IERC20DataUser.ERC20Data claimToken;
//     address owner;
//     uint256 poolLiquidity;
//     uint256  ExchangeRatio;
//     mapping(address => uint256) userDepositAmount;
// }

library HousePoolStorage {
    bytes32 internal constant HOUSEPOOL_STORE_POSITION = keccak256("lunafi.store.housepool");

    struct HousePoolStore {
        mapping(bytes32 => IHousePoolUser.HousePoolData) housePools;
    }

    function housePoolStore() internal pure
        returns (HousePoolStore storage ds)
    {
        bytes32 position = HOUSEPOOL_STORE_POSITION;
        assembly { ds.slot := position }
    }
}
