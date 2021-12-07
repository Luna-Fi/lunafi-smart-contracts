// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import { IERC20 } from '../interfaces/IERC20.sol';
import { claimTokenInterface } from '../interfaces/claimTokenInterface.sol';
import  '../repositories/HousePoolStorage.sol';
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract wethHousePool is  HousePoolStorageContract, ReentrancyGuard {
    
    constructor(address _wethtoken, address _WETHclaimToken) {
        housePoolStorage storage wehps = wethHousePoolStorage();
        wehps.stableToken = IERC20(_wethtoken);
        wehps.claimToken = claimTokenInterface(_WETHclaimToken);
        wehps.owner = msg.sender;
        wehps.ExchangeRatio = 100;
    }

    function getLiquidityStatus() view external returns(uint256) {
        housePoolStorage storage wehps = wethHousePoolStorage();
        return wehps.poolLiquidity;
    }

    function getMyBalance() view external returns(uint256) {
        housePoolStorage storage wehps = wethHousePoolStorage();
        return wehps.userDepositAmount[msg.sender];
    }

    function deposit(uint256 _amount) external nonReentrant {
        housePoolStorage storage wehps = wethHousePoolStorage();
        require(_amount > 0 && _amount <= wehps.stableToken.balanceOf(msg.sender),"WETHHousePool: Check the Balance");
        require(_amount > 100 * 10**6, "WETHHousePool : Too less deposit");
        wehps.poolLiquidity += _amount;
        wehps.userDepositAmount[msg.sender] += _amount;
        wehps.stableToken.transferFrom(msg.sender,address(this),_amount);
        uint256 LPTokensToMint = _amount / wehps.ExchangeRatio;
        wehps.claimToken.mint(msg.sender, LPTokensToMint);
    }

    function withdraw(uint256 _LPTokens) external nonReentrant {
        housePoolStorage storage wehps = wethHousePoolStorage();
        require(_LPTokens > 0,"WETHHousePool: Zero Amount");
        require(_LPTokens <= wehps.claimToken.balanceOf(msg.sender),"WETHHousePool: Amount exceeded");
        uint256 amountToTransfer = _LPTokens * wehps.ExchangeRatio;
        wehps.poolLiquidity -= amountToTransfer;
        wehps.userDepositAmount[msg.sender] -= amountToTransfer;
        wehps.stableToken.transfer(msg.sender,amountToTransfer);
        wehps.claimToken.burn(msg.sender, _LPTokens);

    }
}