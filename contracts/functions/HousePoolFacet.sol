// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import '../libraries/LibToken.sol';
import '../libraries/LibHousePool.sol';
import '../libraries/LibDiamond.sol';

contract HousePoolFacet {
    function getExchangeRatio(bytes32 ckey)
        public view
        returns (uint256 ratio)
    {
        ratio = LibHousePool.getCurrentExchangeRatio(ckey);
    }

    function setInitialExchangeRatio(bytes32 ckey, uint256 ratio)
        external
    {
        LibDiamond.enforceIsContractOwner();
        LibHousePool.setInitialExchangeRatio(ckey,ratio);
    }

    function invest(address investor, bytes32 ckey, uint256 amountToInvest)
        external returns (bool success)
    {
        IERC20 currency = LibToken.getERC20ForClaimToken(ckey);
        currency.transferFrom(investor, address(this), amountToInvest); // TODO try-catch

        // mint claim token
        uint256 ctAmountToMint = getExchangeRatio(ckey) * amountToInvest;
        LibToken.mint(investor, ctAmountToMint, ckey);
    }
}
