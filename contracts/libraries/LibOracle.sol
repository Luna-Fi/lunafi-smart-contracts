// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import '../repositories/EventStorage.sol';
import { IEventUser, IProofUser } from '../interfaces/IEventUser.sol';

library LibOracle {
    function _createEvent(uint256 id, IEventUser.Event calldata _event) internal {
        EventStorage.EventsStore storage es = EventStorage.eventsStore();
        es.events[id] = _event;
    }

    function _addProofForEvent(uint256 id, IProofUser.Proof calldata _proof) internal {
        EventStorage.EventsStore storage es = EventStorage.eventsStore();
        es.events[id].proofs.push(_proof);
    }

    function _getNewEventId() internal returns (uint256 eventId) {
        EventStorage.EventsStore storage es = EventStorage.eventsStore();
        unchecked {
            es._eventIdCounter._value += 1;
        }
        eventId = es._eventIdCounter._value;
    }

    // function _updateEventStatus(uint256 eventId, Status newStatus) internal {
        // EventStorage.EventsStore storage es = EventStorage.eventsStore();
        // es.events[eventId].eventStatus = newStatus;
    // }
}
