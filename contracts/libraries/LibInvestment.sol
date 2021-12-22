// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import { LibAccess } from '../libraries/LibAccess.sol';
// import { LibERC20 } from '../libraries/LibERC20.sol';

library LibInvestment {
    function invest(uint256 amountToInvest, address investor, bytes32 currency) internal {
        _validateInvestor(investor);
        /* LibERC20.acceptWETH(amountToInvest); */
        /* ClaimTokenWETHFacet.transfer(); */
        /* ClaimTokenWBTC.transfer(); */

        // mint claim tokens
        /* uint256 claimTokensMinted = LibERC20.mint(currency, amountToInvest); */

        // transfer claim tokens
        /* LibERC20.transferFrom(currency, investor, treasuryAddress, amountToInvest); */
    }

    function _validateInvestor(address investor) internal returns (bool isValidInvestor) {
        /* LibAccess.hasRole() */
    }
}
