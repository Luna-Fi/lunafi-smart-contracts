// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import { IClaimTokenDataUser } from '../interfaces/ICTUser.sol';
// struct ClaimTokenData {
//     IERC20MetadataUser.ERC20Metadata claimTokenMetadata;
//     address forERC20;
// }

library ClaimTokenStorage {
    bytes32 internal constant CLAIMTOKEN_STORE_POSITION = keccak256("lunafi.store.claimtoken");

    struct ClaimTokenStore {
        // Mapping of claim token key to information
        mapping(bytes32 => IClaimTokenDataUser.ClaimTokenData) claimTokens;
    }

    function claimTokenStore() internal pure
        returns(ClaimTokenStore storage _ts)
    {
        bytes32 position = CLAIMTOKEN_STORE_POSITION;
        assembly { _ts.slot := position }
    }
}
