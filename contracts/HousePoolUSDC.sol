// SPDX-License-Identifier:  MIT
pragma solidity 0.8.10;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";
import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";
import "hardhat/console.sol";

interface claimTokenInterface {
    function burn(address account, uint256 tokens) external;
    function mint(address account, uint256 tokens) external;
    function balanceOf(address tokenOwner) external view returns (uint256 getBalance);
    function totalSupply() external view returns (uint256);
}

contract HousePoolUSDC is ReentrancyGuard, AccessControl, EIP712 {
    struct ValuesOfInterest {
        int256 expectedValue;
        int256 maxExposure;
        uint256 deadline;
        address signer;
    }

    uint256 bettingStakes;
    uint256 liquidity;
    uint256 treasuryAmount;
    int256 tvl;
    IERC20 token;
    claimTokenInterface claimToken;
    ValuesOfInterest public voi;

    uint256 constant MAX_PRECISION = 18;
    uint256 constant PRECISION_DIFFERENCE = 12;
    uint256 lpTokenPrice = 100*10**MAX_PRECISION;
    uint256 lpTokenWithdrawlPrice = 100*10**MAX_PRECISION;

    bytes32 public constant DATA_PROVIDER_ORACLE =
        keccak256("DATA_PROVIDER_ORACLE");
    bytes32 public constant HOUSE_POOL_DATA_PROVIDER =
        keccak256("HOUSEPOOL_DATA_PROVIDER");

    mapping(address => uint256) private nonces;
    mapping(address => uint256) private deposits;

    modifier onlyValid(ValuesOfInterest memory data, bytes memory signature) {
        bytes32 digest = _hashTypedDataV4(
            keccak256(
                abi.encode(
                    keccak256(
                        "VoI(address signer,int256 expectedValue,uint256 maxExposure,uint256 nonce,uint256 deadline)"
                    ),
                    data.signer,
                    data.expectedValue,
                    data.maxExposure,
                    nonces[data.signer],
                    data.deadline
                )
            )
        );
        require(
            SignatureChecker.isValidSignatureNow(data.signer, digest, signature),
            "HousePoolUSDC: invalid signature"
        );

        require(
            data.signer != address(0),
            "HousePoolUSDC: invalid signer");

        require(
            hasRole(DATA_PROVIDER_ORACLE, data.signer),
            "HousePoolUSDC: unauthorised signer"
        );

        require(
            block.number < data.deadline,
            "HousePoolUSDC: signed transaction expired"
        );

        nonces[data.signer]++;
        _;
    }

    // -- Init --
    constructor(
        address _owner,
        address _usdc,
        address _claimToken,
        string memory _name,
        string memory _version
    ) EIP712(_name, _version) {
        token = IERC20(_usdc);
        claimToken = claimTokenInterface(_claimToken);
        _setupRole(DEFAULT_ADMIN_ROLE, _owner);
    }

    // -- Authorised Functions --
    function setVOI(bytes memory sig_, ValuesOfInterest memory voi_)
        external onlyValid(voi_, sig_) onlyRole(HOUSE_POOL_DATA_PROVIDER)
    {
        _setVoi(voi_);
    }

    function deposit(uint256 amountUSDC, bytes memory approval, ValuesOfInterest memory approvedValues)
        external onlyValid(approvedValues, approval)
    {
        _setVoi(approvedValues);
        _deposit(amountUSDC);
    }

    function withdraw(uint256 amountUSDC, bytes memory approval, ValuesOfInterest memory approvedValues)
        external onlyValid(approvedValues, approval)
    {
        _setVoi(approvedValues);
        _withdraw(amountUSDC);
    }

    // -- External Functions
    function deposit_(uint usdcMicro) external {
        _deposit(usdcMicro);
    }

    function withdraw_(uint usdcMicro) external {
        _withdraw(usdcMicro);
    }

    // -- View Functions --
    function getTokenPrice() external view returns (uint256) {
        return lpTokenPrice;
    }

    function getTreasuryAmount() external view returns(uint256) {
        return treasuryAmount;
    }

    function getTokenWithdrawlPrice() external view returns(uint256) {
        return lpTokenWithdrawlPrice;
    }

    function getTVLofPool() external view returns (int256) {
        return tvl;
    }

    function getEV() external view returns (int256) {
        return voi.expectedValue;
    }

    function getMaxExposure() external view returns (int256) {
        return voi.maxExposure;
    }

    function getLiquidityStatus() external view returns (uint256) {
        return liquidity;
    }

    function getMyBalance(address _user) external view returns (uint256) {
        return deposits[_user];
    }

    // -- Internal Functions --
    function _setTokenPrice() internal {
        if(claimToken.totalSupply() != 0) {
            lpTokenPrice = (uint(tvl) * 10**MAX_PRECISION) / claimToken.totalSupply();
        }
    }

    function _setTokenWithdrawlPrice() internal {
        if(claimToken.totalSupply() != 0) {
            lpTokenWithdrawlPrice = (liquidity * 10**MAX_PRECISION) / claimToken.totalSupply();
        }
    }

    function _updateTVL(int256 expectedValue) internal {
        if(voi.expectedValue == 0){
           tvl += expectedValue;
        } else {
            tvl -= voi.expectedValue;
            tvl += expectedValue;
        }
    }

    function _setVoi(ValuesOfInterest memory _voi) internal {
        if(_voi.expectedValue != voi.expectedValue) {_setEV(_voi.expectedValue);}
        if(_voi.maxExposure != voi.maxExposure) {_setME(_voi.maxExposure);}
    }

    function _setME(int256 exposure) internal {
        voi.maxExposure = exposure;
    }

    function _setEV(int newEV) internal {
        _updateTVL(newEV);
        voi.expectedValue = newEV;
        _setTokenPrice();
    }

    function _deposit(uint256 amount) internal nonReentrant {
        require(
            amount > 0 && amount <= token.balanceOf(msg.sender),
            "USDCHousePool: Check the Balance"
        );
        liquidity += amount * 10**PRECISION_DIFFERENCE;
        tvl += int(amount * 10**PRECISION_DIFFERENCE);
        deposits[msg.sender] += amount * 10**PRECISION_DIFFERENCE;
        token.transferFrom(msg.sender, address(this), amount);
        uint256 LPTokensToMint = (amount * 10**PRECISION_DIFFERENCE * 10**MAX_PRECISION) / lpTokenPrice;
        claimToken.mint(msg.sender, LPTokensToMint);
        _setTokenPrice();
        _setTokenWithdrawlPrice();
    }

    function _withdraw(uint256 amount) internal nonReentrant {
        require(amount > 0, "USDCHousePool: Zero Amount");
        require(
            amount * 10**PRECISION_DIFFERENCE <= (claimToken.balanceOf(msg.sender) / 10**MAX_PRECISION) * lpTokenWithdrawlPrice  &&
                int(amount) * int(10**PRECISION_DIFFERENCE) < int(liquidity) - voi.maxExposure,
                "USDCHousePool : can't withdraw"
        );
        uint256 LPTokensToBurn = (amount * 10**PRECISION_DIFFERENCE * 10**MAX_PRECISION) / (lpTokenWithdrawlPrice);
        liquidity -= amount * 10**PRECISION_DIFFERENCE;
        tvl -= int(amount) * int(10**PRECISION_DIFFERENCE);
        deposits[msg.sender] -= amount * 10**PRECISION_DIFFERENCE;
        token.transfer(msg.sender, amount);
        claimToken.burn(msg.sender, LPTokensToBurn);
        _setTokenWithdrawlPrice();
        _setTokenPrice();
    }

// ********************************************  Functions to simulate the functionality **********************************

    // TODO DELETE ONCE ORDER PLACEMENT IS BUILT
    // Following methods are only for simulating end to end order placement functionality which has not been built yet
    // Outcome provider method used to simulate outcome for a particular betting stake amount
    // oucome = true represents a bet won by the user and the beAmount is the bet amount for the bet
    // outcome = false represents a bet lost by the user and the betAmount is the bet amount for the bet
    function simulateOutcome(bool outcome, uint256 betAmount) external {
        if(outcome == false) {
            treasuryAmount += betAmount/100;
            liquidity += (betAmount/100) * 99;
        } else {
            treasuryAmount += bettingStakes/100;
            bettingStakes -= betAmount;
        }
        voi.expectedValue = 0;
        voi.maxExposure = 0;
        tvl += int(treasuryAmount);
        _setTokenPrice();
        _setTokenWithdrawlPrice();
    }

    function setBettingStakes(uint256 bettingAmount) external {
        bettingStakes = bettingAmount;
    }

    function getBettingStakes() external view returns (uint256) {
        return bettingStakes;
    }
}
