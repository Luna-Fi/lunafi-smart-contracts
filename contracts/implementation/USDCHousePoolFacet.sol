// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import { IERC20 } from '../interfaces/IERC20.sol';
import { claimTokenInterface } from '../interfaces/claimTokenInterface.sol';
import  '../repositories/HousePoolStorage.sol';
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract usdcHousePool is  HousePoolStorageContract, ReentrancyGuard {
    
    constructor(address _usdctoken, address _USDCclaimToken) {
        housePoolStorage storage uhps = usdcHousePoolStorage();
        uhps.stableToken = IERC20(_usdctoken);
        uhps.claimToken = claimTokenInterface(_USDCclaimToken);
        uhps.owner = msg.sender;
        uhps.ExchangeRatio = 100;
    }

    function getLiquidityStatus() view external returns(uint256) {
      housePoolStorage storage uhps = usdcHousePoolStorage();
      return uhps.poolLiquidity;
    }

    function getMyBalance() view external returns(uint256) {
      housePoolStorage storage uhps = usdcHousePoolStorage();
      return uhps.userDepositAmount[msg.sender];
    }

    function deposit(uint256 _amount) external nonReentrant {
      housePoolStorage storage uhps = usdcHousePoolStorage();
      require(_amount > 0 && _amount <= uhps.stableToken.balanceOf(msg.sender),"USDCHousePool: Check the Balance");
      require(_amount > 100 * 10**6, "USDCHousePool : Too less deposit");
      uhps.poolLiquidity += _amount;
      uhps.userDepositAmount[msg.sender] += _amount;
      uhps.stableToken.transferFrom(msg.sender,address(this),_amount);
      uint256 LPTokensToMint = _amount / uhps.ExchangeRatio;
      uhps.claimToken.mint(msg.sender, LPTokensToMint);
    }

    function withdraw(uint256 _LPTokens) external nonReentrant {
        housePoolStorage storage uhps = usdcHousePoolStorage();
        require(_LPTokens > 0,"USDCHousePool: Zero Amount");
        require(_LPTokens <= uhps.claimToken.balanceOf(msg.sender),"USDCHousePool: Amount exceeded");
        uint256 amountToTransfer = _LPTokens * uhps.ExchangeRatio;
        uhps.poolLiquidity -= amountToTransfer;
        uhps.userDepositAmount[msg.sender] -= amountToTransfer;
        uhps.stableToken.transfer(msg.sender,amountToTransfer);
        uhps.claimToken.burn(msg.sender, _LPTokens);

    }
}