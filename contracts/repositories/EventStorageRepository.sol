// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import { IEventUser, IProofUser } from '../interfaces/native/IEventUser.sol';
/* import { Counters } from '../libraries/utils/Counters.sol'; */

contract EventStorageRepository is IEventUser, IProofUser {

    bytes32 internal constant EVENT_STORAGE_POSITION = keccak256("lunafi.event");

    struct Counter {
        // This variable should never be directly accessed by users of the library: interactions must be restricted to
        // the library's function. As of Solidity v0.5.2, this cannot be enforced, though there is a proposal to add
        // this feature: see https://github.com/ethereum/solidity/issues/4637
        uint256 _value; // default: 0
    }

    struct EventsStore {
        Counter _eventIdCounter;
        mapping(uint256 => Event) events;
    }

    function eventsStore()
        internal pure
        returns(EventsStore storage es)
    {
        bytes32 position = EVENT_STORAGE_POSITION;
        assembly { es.slot := position }
    }
}
