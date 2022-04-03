// SPDX-License-Identifier:  MIT
pragma solidity 0.8.10;

interface IClaimToken {
    function burn(address account, uint256 tokens) external;

    function mint(address account, uint256 tokens) external;

    function balanceOf(address tokenOwner)
        external
        view
        returns (uint256 getBalance);

    function totalSupply() external view returns (uint256);
}
