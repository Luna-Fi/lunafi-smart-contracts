//SPDX-License-Identifier:  MIT
pragma solidity 0.8.10;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

interface WBTCclaimTokenInterface {
    function burn(address account,uint tokens)  external;
    function mint(address account,uint tokens)  external;
    function balanceOf(address tokenOwner) external view  returns (uint getBalance);
}

contract HousePoolWBTC is ReentrancyGuard {
    
    IERC20 wbtcToken;
    WBTCclaimTokenInterface WBTCclaimToken;
    address owner;
    uint256 wbtcLiquidity;
    uint256  ExchangeRatio = 100 ;
    
    mapping(address => uint256) userDepositAmount;

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

    function deposit(uint256 _amount) external nonReentrant {
        require(_amount > 0 && _amount <= wbtcToken.balanceOf(msg.sender),"WBTCHousePool: Check the Balance");
        require(_amount > 100 * 10**8, "WBTCHousePool : Too less deposit");
        wbtcLiquidity += _amount;
        userDepositAmount[msg.sender] += _amount;
        wbtcToken.transferFrom(msg.sender, address(this), _amount);
        uint256 claimTokensToMint = _amount / ExchangeRatio;
        WBTCclaimToken.mint(msg.sender, claimTokensToMint);
    }

    function withdraw(uint256 _LPTokens) external nonReentrant {
        require(_LPTokens > 0,"USDCHousePool: Zero Amount");
        require(_LPTokens <= WBTCclaimToken.balanceOf(msg.sender),"WBTCHousePool: Amount exceeded");
        uint256 amountToTransfer = _LPTokens * ExchangeRatio;
        wbtcLiquidity -= amountToTransfer;
        userDepositAmount[msg.sender] -= amountToTransfer;
        wbtcToken.transfer(msg.sender,amountToTransfer);
        WBTCclaimToken.burn(msg.sender, _LPTokens);
    }
    
}