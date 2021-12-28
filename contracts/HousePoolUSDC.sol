// SPDX-License-Identifier:  MIT
pragma solidity 0.8.10;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface USDCclaimTokenInterface {
    function burn(address account,uint tokens)  external;
    function mint(address account,uint tokens)  external;
    function balanceOf(address tokenOwner) external view  returns (uint getBalance);
    function totalSupply() external view returns (uint256);
}

contract HousePoolUSDC is ReentrancyGuard, Ownable {
    
    IERC20 usdcToken;
    USDCclaimTokenInterface USDCclaimToken;
    uint256 usdcLiquidity;
    uint256 bettingStakes;
    uint256 maxExposure;
    uint256 ev;
    uint256 LPTokenPrice = 100;
    uint256 tvl;
    uint256  ExchangeRatio = 100 ;

    mapping(address => uint256) userDepositAmount;

    constructor(address _usdctoken, address _USDCclaimToken) {
        usdcToken = IERC20(_usdctoken);
        USDCclaimToken = USDCclaimTokenInterface(_USDCclaimToken);
    }

    function setTokenPrice() internal  {
        LPTokenPrice = tvl / usdcToken.totalSupply();     
    }

    function getTokenPrice() view external returns (uint256) {
        return LPTokenPrice;
    }

    function getTVLofPool() view external returns(uint256) {
        return tvl;
    }
    
    function setMaxExposure(uint256 exposure) external onlyOwner {
        maxExposure = exposure;
    }

    function getMaxExposure() view external returns(uint256) {
        return maxExposure;
    }

    function setEV(uint256 expectedValue) external onlyOwner {
        ev = expectedValue;
        tvl += ev;
        setTokenPrice();
    } 

    function getEV() view external returns(uint256) {
        return ev;
    }

    function setBettingStakes(uint256 bettingAmount) external onlyOwner {
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
        tvl += amount;
        userDepositAmount[msg.sender] += amount;
        usdcToken.transferFrom(msg.sender,address(this),amount);
        if(USDCclaimToken.totalSupply() != 0) {
            setTokenPrice();
        }
        uint256 LPTokensToMint = amount / LPTokenPrice;
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