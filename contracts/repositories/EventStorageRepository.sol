// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import { IProofUser } from '../interfaces/native/IProofUser.sol';
import { IEventUser } from '../interfaces/native/IEventUser.sol';
import { Counters } from '../libraries/utils/Counters.sol';

contract EventStorageRepository is IEventUser, IProofUser {
    using Counters for Counters.Counter;

    bytes32 internal constant EVENT_STORAGE_POSITION = keccak256("lunafi.event");

    struct EventsStore {
        mapping(uint256 => Event) events;
        Counters.Counter private _eventIdCounter;
    }

    function eventsStore()
        internal pure
        returns(EventStorageRepository storage es)
    {
        bytes32 position = EVENT_STORAGE_POSITION;
        assembly { es.slot := position }
    }
}
