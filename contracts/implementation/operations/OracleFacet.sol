// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import { IEventUser } from "../../interfaces/native/IEventUser.sol";
import { LibOracle } from "../../libraries/LibOracle.sol";

contract OracleFacet is IEventUser {
    function createEvent(Event event) external {
        LibOracle.enforceIsContractOwner();
        LibOracle.createEvent(LibOracle.getNewEventId(), event);
    }
}
