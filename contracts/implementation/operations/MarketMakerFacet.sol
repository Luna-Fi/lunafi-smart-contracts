// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { LibAccess } from "../../libraries/LibAccess.sol";

contract MarketMakerFacet is LibAccess {
    bytes32 public constant MM_ROLE = keccak256("lunafi.marketmaker");

    modifier onlyMarketMakers() {
        require(hasRole(MM_ROLE, msg.sender), "Access restricted to authorised mm");
        _;
    }

    function isMarketMaker(address account) external view returns (bool) {
        return hasRole(MM_ROLE, account);
    }

    function grantMMRole(address marketMaker) external
    {
        grantRole(MM_ROLE, marketMaker);
    }
}
