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
    uint256 ExchangeValue = 100;
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
        require(_amount > 100 * 10**8, "WBTCHousePool: Not enough WBTC");
        wbtcLiquidity += _amount;
        userDepositAmount[msg.sender] += _amount;
        wbtcToken.transferFrom(msg.sender, address(this), _amount);
        uint256 claimTokensToMint = _amount / ExchangeValue;
        WBTCclaimToken.mint(msg.sender, claimTokensToMint);
    }

    function withdraw(uint256 _amount) external  nonReentrant {
        require(_amount >0 && _amount <= userDepositAmount[msg.sender], "WBTCHousePool: Amount exceeded");
        wbtcLiquidity -= _amount;
        userDepositAmount[msg.sender] -= _amount;
        wbtcToken.transfer(msg.sender, _amount);
        uint256 claimTokensToBurn = _amount / ExchangeValue;
        WBTCclaimToken.burn(msg.sender, claimTokensToBurn);
    }
    
}