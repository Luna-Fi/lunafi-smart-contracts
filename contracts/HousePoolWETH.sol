//SPDX-License-Identifier:  MIT
pragma solidity 0.8.10;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

interface WETHclaimTokenInterface {
    function burn(address account,uint tokens)  external;
    function mint(address account,uint tokens)  external;
}

contract housePoolWBTC is ReentrancyGuard {
    IERC20 wbtcToken;
    WETHclaimTokenInterface WETHclaimToken;
    address owner;
    uint256 wethLiquidity;

    uint256 WETHclaimTokens = 1;
    uint256 WETHTokens = 1200;
    uint256 ExchangeRatio =  WETHclaimTokens / WETHTokens ;

    mapping(address => uint256) userDepositAmount;
    /*
      WBTC Token Address on Ropsten :
      WBTC Token Address on MainNet :
    */
    constructor(address _wethToken, address _WETHclaimToken) {
        wbtcToken = IERC20(_wethToken);
        WETHclaimToken = WETHclaimTokenInterface(_WETHclaimToken);
        owner = msg.sender;
    }

    function getLiquidityStatus() view external returns(uint256) {
        return wethLiquidity;
    }

    function getUserBalance() view external returns(uint256) {
        return userDepositAmount[msg.sender];
    }

    function deposit(uint256 _amount) external nonReentrant {
        require(_amount > 0 && _amount <= wbtcToken.balanceOf(msg.sender));
        wethLiquidity += _amount;
        userDepositAmount[msg.sender] += _amount;
        wbtcToken.transferFrom(msg.sender, address(this), _amount);
        uint256 claimTokensToMint = _amount * ExchangeRatio;
        WETHclaimToken.mint(msg.sender, claimTokensToMint);
    }

    function withdraw(uint256 _amount) external  nonReentrant {
        require(_amount >0 && _amount <= userDepositAmount[msg.sender], "Amount exceeded");
        wethLiquidity -= _amount;
        userDepositAmount[msg.sender] -= _amount;
        wbtcToken.transfer(msg.sender, _amount);
        uint256 claimTokensToBurn = _amount * ExchangeRatio;
        WETHclaimToken.burn(msg.sender, claimTokensToBurn);
    }
}