// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import { LibDiamond } from '../libraries/LibDiamond.sol';
import { EventStorageRepository } from '../repositories/EventStorageRepository.sol';

contract LibOracle is LibDiamond, EventStorageRepository {
    function createEvent(uint256 id, Event event) internal {
        EventsStore storage es = eventsStore();
        es.events[id] = event;
    }

    function addProofForEvent(uint256 id, Proof proof) {
        EventsStore storage es = eventsStore();
        es.events[id].proofs.push(proof);
    }

    function getNewEventId() internal returns (uint256 eventId) {
        EventsStore storage es = eventsStore();
        es._eventIdCounter.increment();
        eventId = es._eventIdCounter.current();
    }
}
