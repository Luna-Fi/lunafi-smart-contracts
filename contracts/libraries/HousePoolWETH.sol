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
    uint256 ExchangeValue = 100;
    mapping(address => uint256) userDepositAmount;

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
        require(_amount > 0 && _amount <= wbtcToken.balanceOf(msg.sender),"WETHHousePool: Check the Balance");
        require(_amount > 100 * 10**18, "WETHHousePool: Not enough WETH");
        wethLiquidity += _amount;
        userDepositAmount[msg.sender] += _amount;
        wbtcToken.transferFrom(msg.sender, address(this), _amount);
        uint256 claimTokensToMint = _amount / ExchangeValue;
        WETHclaimToken.mint(msg.sender, claimTokensToMint);
    }

    function withdraw(uint256 _amount) external  nonReentrant {
        require(_amount >0 && _amount <= userDepositAmount[msg.sender], "WETHHousePool:Amount exceeded");
        wethLiquidity -= _amount;
        userDepositAmount[msg.sender] -= _amount;
        wbtcToken.transfer(msg.sender, _amount);
        uint256 claimTokensToBurn = _amount / ExchangeValue;
        WETHclaimToken.burn(msg.sender, claimTokensToBurn);
    }

}