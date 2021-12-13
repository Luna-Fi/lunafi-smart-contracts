// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import { LibInvestment } from '../../libraries/LibInvestment.sol';
import { LibAccess } from '../../libraries/LibAccess.sol';

contract InvestmentFacet {

    function init() external {
        /* bytes32 role = LibAccess._getRoleName('investor role'); */
        /* LibAccess.grantRole(role, msg.sender); */
    }

    function invest(uint256 amountToInvest) external {
        bytes32 b = 'WETH'; // = 0x5745544800000000000000000000000000000000000000000000000000000000
        _invest(amountToInvest, msg.sender, b);
    }

    function withdraw() external {}

    function _invest(uint256 amountToInvest, address investor, bytes32 currency) public {
        LibInvestment.invest(amountToInvest, investor, currency);
    }
}
