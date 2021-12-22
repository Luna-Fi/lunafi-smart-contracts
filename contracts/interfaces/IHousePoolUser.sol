// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import { IERC20DataUser } from '../interfaces/IERC20User.sol';
// struct ERC20Data {
//     ERC20Metadata tokenMetadata;
//     address erc20Implementation;
//     address forERC20;
//     uint256 totalSupply;
//     mapping(address => uint256) balances;
//     mapping(address => mapping(address => uint256)) allowances;
// }

interface IHousePoolUser {
    struct HousePoolData {
        uint256 totalLiquidity;
        uint256 initialExchangeRatio;
        mapping(address => uint256) userDepositAmount;
    }
}
