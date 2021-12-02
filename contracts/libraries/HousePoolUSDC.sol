//SPDX-License-Identifier:  MIT
pragma solidity 0.8.10;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

interface USDCclaimTokenInterface {
    function burn(address account,uint tokens)  external;
    function mint(address account,uint tokens)  external;
}

contract housePoolUSDC is ReentrancyGuard {
  IERC20 usdcToken;
  USDCclaimTokenInterface USDCclaimToken;
  address owner;
  uint256 usdcLiquidity;
  uint256  ExchangeValue = 100 * 10**6;

  mapping(address => uint256) userDepositAmount;

  /*
    USDC Token Address on Ropsten :
    USDC Token Address on MainNet :
  */
  constructor(address _usdctoken, address _USDCclaimToken) {
      usdcToken = IERC20(_usdctoken);
      USDCclaimToken = USDCclaimTokenInterface(_USDCclaimToken);
      owner = msg.sender;
  }

  function getLiquidityStatus() view external returns(uint256) {
      return usdcLiquidity;
  }

  function getMyBalance() view external returns(uint256) {
      return userDepositAmount[msg.sender];
  }

  function deposit(uint256 _amount) external nonReentrant {
      require(_amount > 0 && _amount <= usdcToken.balanceOf(msg.sender),"USDCHousePool: Check the Balance");
      usdcLiquidity += _amount;
      userDepositAmount[msg.sender] += _amount;
      usdcToken.transferFrom(msg.sender,address(this),_amount);
      uint256 claimTokensToMint = _amount / ExchangeValue;
      USDCclaimToken.mint(msg.sender, claimTokensToMint);
  }

  function withdraw(uint256 _amount) external nonReentrant {
      require(_amount > 0 && _amount <= userDepositAmount[msg.sender],"USDCHousePool: Amount exceeded");
      usdcLiquidity -= _amount;
      userDepositAmount[msg.sender] -= _amount;
      usdcToken.transfer(msg.sender,_amount);
      uint256 claimTokensToBurn = _amount / ExchangeValue;
      USDCclaimToken.burn(msg.sender, claimTokensToBurn);
  }
}
