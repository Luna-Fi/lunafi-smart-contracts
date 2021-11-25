//SPDX-License-Identifier:  MIT
pragma solidity 0.8.3;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract housePoolWBTC is ReentrancyGuard {
    IERC20 wbtcToken;
    address owner;
    uint256 wbtcLiquidity;

    mapping(address => uint256) userDepositAmount;
    /*
      WBTC Token Address on Ropsten :
      WBTC Token Address on MainNet :
    */
    constructor(address _wbtcToken) {
        wbtcToken = IERC20(_wbtcToken);
        owner = msg.sender;
    }

    function getLiquidityStatus() view external returns(uint256) {
        return wbtcLiquidity;
    }

    function getUserBalance() view external returns(uint256) {
        return userDepositAmount[msg.sender];
    }

    function deposit(uint256 _amount) external nonReentrant {
        require(_amount > 0 && _amount <= wbtcToken.balanceOf(msg.sender));
        wbtcLiquidity += _amount;
        userDepositAmount[msg.sender] += _amount;
        wbtcToken.transferFrom(msg.sender, address(this), _amount);
    }

    function withdraw(uint256 _amount) external  nonReentrant {
        require(_amount >0 && _amount <= userDepositAmount[msg.sender], "Amount exceeded");
        wbtcLiquidity -= _amount;
        userDepositAmount[msg.sender] -= _amount;
        wbtcToken.transfer(msg.sender, _amount);
    }
}
