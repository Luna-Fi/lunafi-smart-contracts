// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { LibAccess } from "../../libraries/LibAccess.sol";

contract MarketMakerFacet {
    bytes32 public constant MM_ROLE = keccak256("lunafi.marketmaker");

    modifier onlyMarketMakers() {
        require(LibAccess.hasRole(MM_ROLE, msg.sender), "Access restricted to authorised mm");
        _;
    }

    function isMarketMaker(address account) external view returns (bool) {
        return LibAccess.hasRole(MM_ROLE, account);
    }

    function grantMMRole(address marketMaker) external
    {
        LibAccess.grantRole(MM_ROLE, marketMaker);
    }
}
