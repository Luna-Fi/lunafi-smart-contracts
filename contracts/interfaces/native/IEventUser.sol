// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import { IProofUser } from '../native/IProofUser.sol';

interface IEventUser is IProofUser {
    enum Status { NotConcluded, Result1, Result2, void }

    struct Event {
            bytes description;
            Status eventStatus;
            Proof[] proofs;
        }
}
