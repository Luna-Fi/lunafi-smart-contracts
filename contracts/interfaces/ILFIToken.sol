// SPDX-License-Identifier:  MIT
pragma solidity 0.8.10;

interface ILFIToken {
    function balanceOf(address tokenOwner)
        external
        view
        returns (uint256 getBalance);

    function transfer(address to, uint256 tokens)
        external
        returns (bool success);

    function transferFrom(
        address from,
        address to,
        uint256 tokens
    ) external  returns (bool success);

    function permit(
    address owner,
    address spender,
    uint256 value,
    uint256 deadline,
    uint8 v,
    bytes32 r,
    bytes32 s
  ) external ;

   
}