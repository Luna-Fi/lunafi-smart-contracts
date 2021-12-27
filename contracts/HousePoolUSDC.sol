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
    uint256 bettingStakes;
    uint256 maxExposure;
    uint256 ev;
    uint256 usdcLPTokenPrice;
    uint256  ExchangeRatio = 100 ;

    mapping(address => uint256) userDepositAmount;

    constructor(address _usdctoken, address _USDCclaimToken) {
        usdcToken = IERC20(_usdctoken);
        USDCclaimToken = USDCclaimTokenInterface(_USDCclaimToken);
        owner = msg.sender;
    }

    function setTokenPrice() internal {
        uint256 TVLOfPool = usdcLiquidity + ev;
        usdcLPTokenPrice = TVLOfPool / usdcToken.totalSupply();     
    }

    function getLPPrice() view external returns(uint256) {
        return usdcLPTokenPrice;
    }

    function setMaxExposure(uint256 exposure) external {
        ev = exposure;
    }

    function getMaxExposure() view external returns(uint256) {
        return maxExposure;
    }

    function setBettingStakes(uint256 bettingAmount) external {
        bettingStakes = bettingAmount;
    }

    function getBettingStakes() view external returns(uint256) {
        return bettingStakes;
    }

    function getLiquidityStatus() view external returns(uint256) {
        return usdcLiquidity;
    }

    function getMyBalance(address _user) view external returns(uint256) {
        return userDepositAmount[_user];
    }

    function deposit(uint256 amount) external nonReentrant {
        require(amount > 0 && amount <= usdcToken.balanceOf(msg.sender),"USDCHousePool: Check the Balance");
        usdcLiquidity += amount;
        userDepositAmount[msg.sender] += amount;
        usdcToken.transferFrom(msg.sender,address(this),amount);
        setTokenPrice();
        uint256 LPTokensToMint = amount / usdcLPTokenPrice;
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