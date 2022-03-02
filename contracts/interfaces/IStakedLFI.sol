// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

interface IStakedLFI {
  function stake(address to, uint256 amount) external;
  function redeem(address to, uint256 amount) external;
  function cooldown() external;
  function claimRewards(address to, uint256 amount) external;
}