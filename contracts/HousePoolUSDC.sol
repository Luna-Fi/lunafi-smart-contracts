// SPDX-License-Identifier:  MIT
pragma solidity 0.8.10;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

interface USDCclaimTokenInterface {
    function burn(address account,uint tokens)  external;
    function mint(address account,uint tokens)  external;
    function balanceOf(address tokenOwner) external view  returns (uint getBalance);
}

contract HousePoolUSDC is ReentrancyGuard {
    
    IERC20 usdcToken;
    USDCclaimTokenInterface USDCclaimToken;
    address owner;
    uint256 usdcLiquidity;
    uint256  ExchangeRatio = 100 ;

    mapping(address => uint256) userDepositAmount;

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
        require(_amount > 100 * 10**6, "USDCHousePool : Too less deposit");
        usdcLiquidity += _amount;
        userDepositAmount[msg.sender] += _amount;
        usdcToken.transferFrom(msg.sender,address(this),_amount);
        uint256 LPTokensToMint = _amount / ExchangeRatio;
        USDCclaimToken.mint(msg.sender, LPTokensToMint);
    }

    function withdraw(uint256 _LPTokens) external nonReentrant {
        require(_LPTokens > 0,"USDCHousePool: Zero Amount");
        require(_LPTokens <= USDCclaimToken.balanceOf(msg.sender),"USDCHousePool: Amount exceeded");
        uint256 amountToTransfer = _LPTokens * ExchangeRatio;
        usdcLiquidity -= amountToTransfer;
        userDepositAmount[msg.sender] -= amountToTransfer;
        usdcToken.transfer(msg.sender,amountToTransfer);
        USDCclaimToken.burn(msg.sender, _LPTokens);
    }

}