// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import { IERC20 } from '../interfaces/IERC20.sol';
import { claimTokenInterface } from '../interfaces/claimTokenInterface.sol';
import  '../repositories/HousePoolStorageRepository.sol';
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract wbtcHousePool is  ReentrancyGuard {
    
    constructor(address _wbtctoken, address _WBTCclaimToken) {
        HousePoolStorageContract.housePoolStorage storage wbhps = HousePoolStorageContract.wbtcHousePoolStorage();
        wbhps.stableToken = IERC20(_wbtctoken);
        wbhps.claimToken = claimTokenInterface(_WBTCclaimToken);
        wbhps.owner = msg.sender;
        wbhps.ExchangeRatio = 100;
    }

    function getLiquidityStatus() view external returns(uint256) {
          HousePoolStorageContract.housePoolStorage storage wbhps = HousePoolStorageContract.wbtcHousePoolStorage();
          return wbhps.poolLiquidity;
    }

    function getMyBalance() view external returns(uint256) {
          HousePoolStorageContract.housePoolStorage storage wbhps = HousePoolStorageContract.wbtcHousePoolStorage();
          return wbhps.userDepositAmount[msg.sender];
    }

    function deposit(uint256 _amount) external nonReentrant {
          HousePoolStorageContract.housePoolStorage storage wbhps = HousePoolStorageContract.wbtcHousePoolStorage();
          require(_amount > 0 && _amount <= wbhps.stableToken.balanceOf(msg.sender),"WBTCHousePool: Check the Balance");
          require(_amount >= 100 * 10**8, "WBTCHousePool : Too less deposit");
          wbhps.poolLiquidity += _amount;
          wbhps.userDepositAmount[msg.sender] += _amount;
          wbhps.stableToken.transferFrom(msg.sender,address(this),_amount);
          uint256 LPTokensToMint = _amount / wbhps.ExchangeRatio;
          wbhps.claimToken.mint(msg.sender, LPTokensToMint);
    }

    function withdraw(uint256 _LPTokens) external nonReentrant {
        HousePoolStorageContract.housePoolStorage storage wbhps = HousePoolStorageContract.wbtcHousePoolStorage();
        require(_LPTokens > 0,"WBTCHousePool: Zero Amount");
        require(_LPTokens <= wbhps.claimToken.balanceOf(msg.sender),"WBTCHousePool: Amount exceeded");
        uint256 amountToTransfer = _LPTokens * wbhps.ExchangeRatio;
        wbhps.poolLiquidity -= amountToTransfer;
        wbhps.userDepositAmount[msg.sender] -= amountToTransfer;
        wbhps.stableToken.transfer(msg.sender,amountToTransfer);
        wbhps.claimToken.burn(msg.sender, _LPTokens);

    }
}