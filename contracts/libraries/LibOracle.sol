// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import { EventStorageRepository } from '../repositories/EventStorageRepository.sol';
import { IEventUser, IProofUser } from '../interfaces/native/IEventUser.sol';

contract LibOracle is EventStorageRepository {
    function _createEvent(uint256 id, Event calldata _event) internal {
        EventsStore storage es = eventsStore();
        es.events[id] = _event;
    }

    function _addProofForEvent(uint256 id, Proof calldata _proof) internal {
        EventsStore storage es = eventsStore();
        es.events[id].proofs.push(_proof);
    }

    function _getNewEventId() internal returns (uint256 eventId) {
        EventsStore storage es = eventsStore();
        unchecked {
            es._eventIdCounter._value += 1;
        }
        eventId = es._eventIdCounter._value;
    }

    function _updateEventStatus(uint256 eventId, Status newStatus) internal {
        EventsStore storage es = eventsStore();
        es.events[eventId].eventStatus = newStatus;
    }
}
