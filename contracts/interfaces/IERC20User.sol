// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

interface IERC20MetadataUser {
    struct ERC20Metadata {
        uint8 decimals;
        string name;
        string symbol;
    }
}

interface IERC20DataUser is IERC20MetadataUser {
    struct ERC20Data {
        ERC20Metadata tokenMetadata;
        address erc20Implementation;
        address forERC20;
        uint256 totalSupply;
        mapping(address => uint256) balances;
        mapping(address => mapping(address => uint256)) allowances;
    }
}
