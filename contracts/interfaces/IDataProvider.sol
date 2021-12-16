// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import { IProofUser } from './IEventUser.sol';

interface IDataProvider is IProofUser {
    event ProofAdded(address indexed dataProvider, Proof indexed proof);
    function verifyProof(Proof calldata proofToVerify) external view returns (bool success);
}
