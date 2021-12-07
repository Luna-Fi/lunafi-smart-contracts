//SPDX-License-Identifier:  MIT
pragma solidity 0.8.10;

interface claimTokenInterface {
    event Burn(address from, address, uint256 value);
    event Mint(address from, address, uint256 value);
    function burn(address account,uint tokens)  external;
    function mint(address account,uint tokens)  external;
    function balanceOf(address tokenOwner) external view  returns (uint getBalance);
}