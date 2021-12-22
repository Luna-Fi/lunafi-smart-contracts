// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

// import { IERC20MetadataUser } from '../interfaces/IERC20User.sol';
// struct ERC20Metadata {
//     uint8 decimals;
//     string name;
//     string symbol;
// }

interface IClaimTokenDataUser {
    struct ClaimTokenData {
        // IERC20MetadataUser.ERC20Metadata claimTokenMetadata;
        address forERC20;
    }
}
