// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import { IEventUser, IProofUser } from '../interfaces/native/IEventUser.sol';

contract EventStorageRepository is IEventUser, IProofUser {

    bytes32 internal constant EVENT_STORAGE_POSITION = keccak256("lunafi.event");

    struct Counter {
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