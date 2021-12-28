//SPDX-License-Identifier:  MIT
pragma solidity 0.8.10;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

interface WETHclaimTokenInterface {
    function burn(address account,uint tokens)  external;
    function mint(address account,uint tokens)  external;
    function balanceOf(address tokenOwner) external view  returns (uint getBalance);
}

contract HousePoolWETH is ReentrancyGuard {
    
    IERC20 wethToken;
    WETHclaimTokenInterface WETHclaimToken;
    uint256 wethLiquidity;
    uint256  ExchangeRatio = 100 ;
    
    mapping(address => uint256) userDepositAmount;

    constructor(address _wethToken, address _WETHclaimToken) {
        wethToken = IERC20(_wethToken);
        WETHclaimToken = WETHclaimTokenInterface(_WETHclaimToken);
    }

    function getLiquidityStatus() view external returns(uint256) {
        return wethLiquidity;
    }

    function getMyBalance(address _user) view external returns(uint256) {
        return userDepositAmount[_user];
    }

    function deposit(uint256 _amount) external nonReentrant {
        require(_amount > 0 && _amount <= wethToken.balanceOf(msg.sender),"WETHHousePool: Check the Balance");
        wethLiquidity += _amount;
        userDepositAmount[msg.sender] += _amount;
        wethToken.transferFrom(msg.sender, address(this), _amount);
        uint256 claimTokensToMint = _amount / ExchangeRatio;
        WETHclaimToken.mint(msg.sender, claimTokensToMint);
    }

    function withdraw(uint256 _LPTokens) external nonReentrant {
        require(_LPTokens > 0,"USDCHousePool: Zero Amount");
        require(_LPTokens <= WETHclaimToken.balanceOf(msg.sender),"WETHHousePool: Amount exceeded");
        uint256 amountToTransfer = _LPTokens * ExchangeRatio;
        wethLiquidity -= amountToTransfer;
        userDepositAmount[msg.sender] -= amountToTransfer;
        wethToken.transfer(msg.sender,amountToTransfer);
        WETHclaimToken.burn(msg.sender, _LPTokens);
    }

}