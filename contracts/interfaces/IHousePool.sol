// SPDX-License-Identifier:  MIT
pragma solidity 0.8.10;

interface IHousePool {
    function getTokenPrice() external view returns (uint256);
    function getTokenWithdrawlPrice() external view returns (uint256);
    function getLiquidityStatus() external view returns (uint256);
    function getMyLiquidity(address _user) external view returns (uint256);
}