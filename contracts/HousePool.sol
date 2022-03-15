// SPDX-License-Identifier:  MIT
pragma solidity 0.8.10;

import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";
import "contracts/interfaces/IClaimToken.sol";

/// @notice LunaFi's HousePool contract.
contract HousePool is
    ReentrancyGuardUpgradeable,
    AccessControl
{
    // DO NOT CHANGE THE NAME, TYPE OR ORDER OF EXISITING VARIABLES BELOW

    using SafeERC20Upgradeable for IERC20Upgradeable;
    
    uint256 constant  MAX_PRECISION = 18;
    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");
    IERC20Upgradeable token;
    IClaimToken claimToken;
    uint256 liquidity;
    uint256  public precisionDifference;
    uint256 lpTokenPrice;
    uint256 lpTokenWithdrawlPrice;

    mapping(address => uint256) private deposits;

    // DO NOT CHANGE THE NAME, TYPE OR ORDER OF EXISITING VARIABLES ABOVE

    // -- Init --
    function initialize(
        address _token,
        address _claimToken,
        uint256 poolTokenPrice,
        uint256 poolTokenWithdrawalPrice,
        uint8 precision
    ) external initializer {
        token = IERC20Upgradeable(_token);
        claimToken = IClaimToken(_claimToken);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MANAGER_ROLE, msg.sender);
        lpTokenPrice = poolTokenPrice;
        lpTokenWithdrawlPrice = poolTokenWithdrawalPrice;
        precisionDifference = precision;
    }

    // -- External Functions

    /// @notice deposit function allows user to deposit the approved tokens and mint proportionate amout of LP Tokens
    /// @param amount the amount in base units for the approved tokens
    function deposit_(uint256 amount) external {
        _deposit(amount);
    }

    /// @notice withdraw function allows user to withdraw the deposited amount and burn the proportionate amount of LP Tokens
    /// @param amount the amount in base units to be withdrawn
    function withdraw_(uint256 amount) external {
        _withdraw(amount);
    }

    // -- View Functions --

    /// @notice function returns the LP Token price
    function getTokenPrice() external view returns (uint256) {
        return lpTokenPrice;
    }

    /// @notice function returns the LP Token withdrawal price
    function getTokenWithdrawalPrice() external view returns (uint256) {
        return lpTokenWithdrawlPrice;
    }
    /// @notice function returns the liquidity of the contract
    function getLiquidityStatus() external view returns (uint256) {
        return liquidity;
    }
    /// @notice function returns the Liqudity provided by a specific user
    /// @param user address of the specific user to get the liquidity for
    function getMyLiquidity(address user) external view returns (uint256) {
        return (claimToken.balanceOf(user) * lpTokenPrice) / 10**MAX_PRECISION;
    }

    // -- Internal Functions --

    /// @notice internal deposit function used by deposit_
    function _deposit(uint256 amount) internal nonReentrant {
        require(
            amount > 0 && amount <= token.balanceOf(msg.sender),
            "HousePool: Check the Balance"
        );
        liquidity += amount * 10**precisionDifference;
        deposits[msg.sender] += amount * 10**precisionDifference;
        token.safeTransferFrom(msg.sender, address(this), amount);
        uint256 LPTokensToMint = (amount *
            10**precisionDifference *
            10**MAX_PRECISION) / lpTokenPrice;
        claimToken.mint(msg.sender, LPTokensToMint);
    }
    /// @notice internal withdraw function used by withdraw_
    function _withdraw(uint256 amount) internal nonReentrant {
        require(amount > 0, "HousePool: Zero Amount");
        require(
            amount * 10**precisionDifference <=
                (claimToken.balanceOf(msg.sender) / 10**MAX_PRECISION) *
                    lpTokenWithdrawlPrice &&
                int256(amount) * int256(10**precisionDifference) <=
                int256(liquidity),
            "HousePool : can't withdraw"
        );
        uint256 LPTokensToBurn = (amount *
            10**precisionDifference *
            10**MAX_PRECISION) / (lpTokenWithdrawlPrice);
        liquidity -= amount * 10**precisionDifference;
        deposits[msg.sender] -= amount * 10**precisionDifference;
        token.safeTransfer(msg.sender, amount);
        claimToken.burn(msg.sender, LPTokensToBurn);
    }
}
