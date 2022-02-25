// SPDX-License-Identifier:  MIT
pragma solidity 0.8.10;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/draft-EIP712Upgradeable.sol";
import "hardhat/console.sol";

interface claimTokenInterface {
    function burn(address account, uint256 tokens) external;
    function mint(address account, uint256 tokens) external;
    function balanceOf(address tokenOwner) external view returns (uint256 getBalance);
    function totalSupply() external view returns (uint256);
}

interface tokenInterface {
    function permit(address owner, address spender, uint value, uint deadline, uint8 v, bytes32 r, bytes32 s) external;
    function transfer(address to, uint value) external returns (bool);
    function transferFrom(address from, address to, uint value) external returns (bool);
    function balanceOf(address owner) external view returns (uint);
}

interface farmsInterface {
    function deposit(uint fid, uint lpAmount, address benefitor) external;
    function withdraw(uint fid, uint LPTokenAmount, address receiver) external;
}

contract DAOStakingPool is ReentrancyGuardUpgradeable, AccessControl, EIP712Upgradeable {
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
    tokenInterface token;
    claimTokenInterface claimToken;
    ValuesOfInterest public voi;
    farmsInterface farm;

    uint256 constant MAX_PRECISION = 18;
    uint256 constant PRECISION_DIFFERENCE = 8;
    uint8 constant LFIFARMID = 0;
    uint256 lpTokenPrice;
    uint256 lpTokenWithdrawlPrice;

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
            "DAOStakingPool: invalid signature"
        );

        require(
            data.signer != address(0),
            "DAOStakingPool: invalid signer");

        require(
            hasRole(DATA_PROVIDER_ORACLE, data.signer),
            "DAOStakingPool: unauthorised signer"
        );

        require(
            block.number < data.deadline,
            "DAOStakingPool: signed transaction expired"
        );

        //nonces[data.signer]++;
        _;
    }

    // -- Init --
    function initialize (
        address _owner,
        address _usdc,
        address _claimToken,
        string memory _name,
        string memory _version
    ) external initializer {
        __EIP712_init(_name, _version);
        token = tokenInterface(_usdc);
        claimToken = claimTokenInterface(_claimToken);
        _setupRole(DEFAULT_ADMIN_ROLE, _owner);
        lpTokenPrice = 1000*10**MAX_PRECISION;
        lpTokenWithdrawlPrice = 1000*10**MAX_PRECISION;
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

    function permit(address owner, address spender, uint value, uint deadline, uint8 v, bytes32 r, bytes32 s) internal {
        token.permit(owner,spender,value,deadline,v,r,s);
    }


    function newDeposit(address owner, address spender, uint256 value,uint256 deadline, uint256 amount, uint8 v, bytes32 r, bytes32 s) external {
        permit(owner,spender,value,deadline,v,r,s);
        _deposit(amount);
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

    function getMyLiquidity(address _user) external view returns (uint256) {
        return (claimToken.balanceOf(_user) * lpTokenPrice) / 10**MAX_PRECISION;
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
            "DAOStakingPool: Check the Balance"
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
        require(amount > 0, "DAOStakingPool: Zero Amount");
        require(
            amount * 10**PRECISION_DIFFERENCE <= (claimToken.balanceOf(msg.sender) / 10**MAX_PRECISION) * lpTokenWithdrawlPrice  &&
                int(amount) * int(10**PRECISION_DIFFERENCE) <= int(liquidity) - voi.maxExposure,
                "DAOStakingPool : can't withdraw"
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
}
