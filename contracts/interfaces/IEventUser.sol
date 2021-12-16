// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import { IProof } from '../interfaces/IProof.sol';

interface IEventUser is IProof {
    enum Status { NotConcluded, Result1, Result2, void }

    struct Event {
            bytes description;
            Status eventStatus;
            Proof[] proofs;
        }
}

interface IProofUser is IProof {}
