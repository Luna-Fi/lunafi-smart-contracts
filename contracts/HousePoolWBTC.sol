//SPDX-License-Identifier:  MIT
pragma solidity 0.8.10;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

interface WBTCclaimTokenInterface {
    function burn(address account,uint tokens)  external;
    function mint(address account,uint tokens)  external;
}

contract housePoolWBTC is ReentrancyGuard {
    IERC20 wbtcToken;
    WBTCclaimTokenInterface WBTCclaimToken;
    address owner;
    uint256 wbtcLiquidity;

    uint256 WBTCclaimTokens = 1;
    uint256 WBTCTokens = 1200;
    uint256 ExchangeRatio = WBTCclaimTokens * 10**8 / WBTCTokens * 10**8;

    mapping(address => uint256) userDepositAmount;
    /*
      WBTC Token Address on Ropsten :
      WBTC Token Address on MainNet :
    */
    constructor(address _wbtcToken, address _WBTCclaimToken) {
        wbtcToken = IERC20(_wbtcToken);
        WBTCclaimToken = WBTCclaimTokenInterface(_WBTCclaimToken);
        owner = msg.sender;
    }

    function getLiquidityStatus() view external returns(uint256) {
        return wbtcLiquidity;
    }

    function getUserBalance() view external returns(uint256) {
        return userDepositAmount[msg.sender];
    }

    function _getExchangeAmount(uint256 _amount) view internal returns (uint256) {
      return _amount * ExchangeRatio ;
    }

    function deposit(uint256 _amount) external nonReentrant {
        require(_amount > 0 && _amount <= wbtcToken.balanceOf(msg.sender));
        wbtcLiquidity += _amount;
        userDepositAmount[msg.sender] += _amount;
        wbtcToken.transferFrom(msg.sender, address(this), _amount);
        uint256 claimTokensToMint = _getExchangeAmount(_amount);
        WBTCclaimToken.mint(msg.sender, claimTokensToMint);
    }

    function withdraw(uint256 _amount) external  nonReentrant {
        require(_amount >0 && _amount <= userDepositAmount[msg.sender], "Amount exceeded");
        wbtcLiquidity -= _amount;
        userDepositAmount[msg.sender] -= _amount;
        wbtcToken.transfer(msg.sender, _amount);
        uint256 claimTokensToBurn = _getExchangeAmount(_amount);
        WBTCclaimToken.burn(msg.sender, claimTokensToBurn);
    }
}
