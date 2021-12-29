// SPDX-License-Identifier: MIT

pragma solidity 0.8.10;

/// @title Safe Math Contract
/// @notice This is used for safe add and safe subtract. This overcomes the overflow errors.

contract SafeMath {
    function safeAdd(uint a, uint b) public pure returns (uint c) {
        c = a + b;
        require(c >= a, "SafeMath: addition overflow");
        return c;
    }

    function safeSub(uint a, uint b) public pure returns (uint c) {
        require(b <= a, "SafeMath: subtraction overflow"); 
        c = a - b; 
        return c;
    }

}