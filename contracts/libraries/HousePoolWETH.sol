//SPDX-License-Identifier:  MIT
pragma solidity 0.8.3;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract housePoolWETH is ReentrancyGuard {
    IERC20 wethToken;
    address owner;
    uint256 wethLiquidity;

    mapping(address => uint256) userDepositAmount;
    /*
       WETH Token Address on Ropsten :
       WETH Token Address on MainNet :
    */
    constructor(address _wethToken) {
        wethToken = IERC20(_wethToken);
        owner = msg.sender;
    }

    function getLiquidityStatus() view external returns(uint256) {
        return wethLiquidity;
    }

    function getUserBalance() view external returns(uint256) {
        return userDepositAmount[msg.sender];
    }

    function deposit(uint256 _amount) external nonReentrant {
        require(_amount > 0 && _amount <= wethToken.balanceOf(msg.sender));
        wethLiquidity += _amount;
        userDepositAmount[msg.sender] += _amount;
        wethToken.transferFrom(msg.sender, address(this), _amount);
    }

    function withdraw(uint256 _amount) external nonReentrant {
        require(_amount <= userDepositAmount[msg.sender], "Amount exceeded");
        wethLiquidity -= _amount;
        userDepositAmount[msg.sender] -= _amount;
        wethToken.transfer(msg.sender, _amount);
    }
}
