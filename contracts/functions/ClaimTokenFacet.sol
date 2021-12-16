// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import { LibAccess } from '../libraries/LibAccess.sol';
import { LibERC20 } from '../libraries/LibERC20.sol';
import 'hardhat/console.sol';

contract ClaimTokenFacet {
    function registerToken()
        external returns(bool success)
    {
        console.log(msg.sender);
    }
}
