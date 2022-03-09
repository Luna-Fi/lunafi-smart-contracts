
// SPDX-License-Identifier:  MIT
pragma solidity 0.8.10;

interface IFundDistributor {
    function distributeReward(address _receiver, uint256 _amount) external;
}