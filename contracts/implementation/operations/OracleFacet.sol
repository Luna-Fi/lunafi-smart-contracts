// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import { LibOracle } from "../../libraries/LibOracle.sol";

contract OracleFacet is LibOracle {
    function createEvent(Event calldata _event) external {
        /* LibOracle.enforceIsContractOwner(); */
        uint256 _id = LibOracle._getNewEventId();
        LibOracle._createEvent(_id, _event);
    }

    function reportOutcome(uint256 eventId, Status reportedStatus, Proof calldata reportedProof)
        external {
        /* LibOracle.enforceIsContractOwner(); */
        LibOracle._updateEventStatus(eventId, reportedStatus);
        LibOracle._addProofForEvent(eventId, reportedProof);
    }
}
