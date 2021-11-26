//SPDX-License-Identifier:  MIT
pragma solidity 0.8.3;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";


contract housePoolUSDC is ReentrancyGuard {
  IERC20 usdcToken;
  address owner;
  uint256 usdcLiquidity;

  mapping(address => uint256) userDepositAmount;

  /*
    USDC Token Address on Ropsten :
    USDC Token Address on MainNet :
  */
  constructor(address _usdctoken,address _USDCclaimToken) {
      usdcToken = IERC20(_usdctoken);
      
      owner = msg.sender;
  }

  function getLiquidityStatus() view external returns(uint256) {
      return usdcLiquidity;
  }

  function getMyBalance() view external returns(uint256) {
      return userDepositAmount[msg.sender];
  }

  function deposit(uint256 _amount) external nonReentrant {
      require(_amount > 0 && _amount <= usdcToken.balanceOf(msg.sender));
      usdcLiquidity += _amount;
      userDepositAmount[msg.sender] += _amount;
      usdcToken.transferFrom(msg.sender,address(this),_amount);
  }

  function withdraw(uint256 _amount) external nonReentrant {
      require(_amount > 0 && _amount <= userDepositAmount[msg.sender],"Amount exceeded");
      usdcLiquidity -= _amount;
      userDepositAmount[msg.sender] -= _amount;
      usdcToken.transfer(msg.sender,_amount);
  }
}
