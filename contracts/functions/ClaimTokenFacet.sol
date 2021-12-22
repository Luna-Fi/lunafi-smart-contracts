// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import { LibDiamond } from '../libraries/LibDiamond.sol';
import { LibToken } from '../libraries/LibToken.sol';
import { IERC20MetadataUser } from '../interfaces/IERC20User.sol';

import 'hardhat/console.sol';

contract ClaimTokenFacet {
    function registerToken(IERC20MetadataUser.ERC20Metadata calldata _tokenMetadata,
                           address _serverAddress,
                           address _forERC20)
        external returns(bool success)
    {
        LibDiamond.enforceIsContractOwner();
        LibToken.createClaimToken(_tokenMetadata, _serverAddress, _forERC20);
    }
}
