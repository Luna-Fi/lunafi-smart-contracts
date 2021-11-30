// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

interface IEventUser {
    enum Status { NotConcluded, Result1, Result2, void }

    struct Event {
            bytes description;
            Status eventStatus;
            Proof[] proofs;
        }
}
