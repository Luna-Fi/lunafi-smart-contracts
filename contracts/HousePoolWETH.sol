// SPDX-License-Identifier:  MIT
pragma solidity 0.8.10;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "contracts/interfaces/IclaimToken.sol";
import "hardhat/console.sol";

contract HousePoolWETH is
    ReentrancyGuardUpgradeable,
    AccessControl
{
    // DO NOT CHANGE THE NAME, TYPE OR ORDER OF EXISITING VARIABLES BELOW

    using SafeERC20 for IERC20;
    uint256 liquidity;
    IERC20 token;
    claimTokenInterface claimToken;

    uint256 constant MAX_PRECISION = 18;
    uint256 constant PRECISION_DIFFERENCE = 12;
    uint256 lpTokenPrice;
    uint256 lpTokenWithdrawlPrice;

    mapping(address => uint256) private deposits;

    // DO NOT CHANGE THE NAME, TYPE OR ORDER OF EXISITING VARIABLES ABOVE

    // -- Init --
    function initialize(
        address _owner,
        address _usdc,
        address _claimToken
        //string memory _name,
        //string memory _version
    ) external initializer {
       // __EIP712_init(_name, _version);
        token = IERC20(_usdc);
        claimToken = claimTokenInterface(_claimToken);
        _setupRole(DEFAULT_ADMIN_ROLE, _owner);
        lpTokenPrice = 100 * 10**MAX_PRECISION;
        lpTokenWithdrawlPrice = 100 * 10**MAX_PRECISION;
    }

    // -- External Functions
    function deposit_(uint256 wethMicro) external {
        _deposit(wethMicro);
    }

    function withdraw_(uint256 wethMicro) external {
        _withdraw(wethMicro);
    }

    // -- View Functions --
    function getTokenPrice() external view returns (uint256) {
        return lpTokenPrice;
    }

    function getTokenWithdrawlPrice() external view returns (uint256) {
        return lpTokenWithdrawlPrice;
    }

    function getLiquidityStatus() external view returns (uint256) {
        return liquidity;
    }

    function getMyLiquidity(address _user) external view returns (uint256) {
        return (claimToken.balanceOf(_user) * lpTokenPrice) / 10**MAX_PRECISION;
    }

    // -- Internal Functions --

    function _deposit(uint256 amount) internal nonReentrant {
        require(
            amount > 0 && amount <= token.balanceOf(msg.sender),
            "WETHHousePool: Check the Balance"
        );
        liquidity += amount * 10**PRECISION_DIFFERENCE;
        deposits[msg.sender] += amount * 10**PRECISION_DIFFERENCE;
        token.safeTransferFrom(msg.sender, address(this), amount);
        uint256 LPTokensToMint = (amount *
            10**PRECISION_DIFFERENCE *
            10**MAX_PRECISION) / lpTokenPrice;
        claimToken.mint(msg.sender, LPTokensToMint);
    }

    function _withdraw(uint256 amount) internal nonReentrant {
        require(amount > 0, "WETHHousePool: Zero Amount");
        require(
            amount * 10**PRECISION_DIFFERENCE <=
                (claimToken.balanceOf(msg.sender) / 10**MAX_PRECISION) *
                    lpTokenWithdrawlPrice &&
                int256(amount) * int256(10**PRECISION_DIFFERENCE) <=
                int256(liquidity),
            "WETHHousePool : can't withdraw"
        );
        uint256 LPTokensToBurn = (amount *
            10**PRECISION_DIFFERENCE *
            10**MAX_PRECISION) / (lpTokenWithdrawlPrice);
        liquidity -= amount * 10**PRECISION_DIFFERENCE;
        deposits[msg.sender] -= amount * 10**PRECISION_DIFFERENCE;
        token.safeTransfer(msg.sender, amount);
        claimToken.burn(msg.sender, LPTokensToBurn);
    }
}
