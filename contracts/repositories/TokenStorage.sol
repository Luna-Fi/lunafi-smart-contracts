// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import { IERC20DataUser } from '../interfaces/IERC20User.sol';
// struct ERC20Metadata {
//     uint8 decimals;
//     string name;
//     string symbol;
// }
// struct ERC20Data {
//     ERC20Metadata tokenMetadata;
//     address erc20Implementation;
//     address forERC20;
//     uint256 totalSupply;
//     mapping(address => uint256) balances;
//     mapping(address => mapping(address => uint256)) allowances;
// }

library TokenStorage {
    bytes32 internal constant ERC20_STORE_POSITION  = keccak256("lunafi.store.erc20");

    /// @notice storage for all tokens in LunaFi Protocol
    struct TokenStore {
        // Mapping of ERC20 key to information
        mapping(bytes32 => IERC20DataUser.ERC20Data) erc20Tokens;
    }

    function tokenStore() internal pure
        returns(TokenStore storage _ts)
    {
        bytes32 position = ERC20_STORE_POSITION;
        assembly { _ts.slot := position }
    }
}
