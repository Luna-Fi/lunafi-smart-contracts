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
    struct VoI {
        int256 value;
        uint256 deadline;
        address signer;
    }

    IERC20 token;
    claimTokenInterface claimToken;
    uint256 liquidity;
    uint256 bettingStakes;
    uint256 maxExposure;
    VoI ev;
    uint256 constant POOL_PRECISION = 6 ;
    uint256 lpTokenPrice = 100*10**POOL_PRECISION ;
    uint256 lpTokenWithdrawlPrice = 100*10**POOL_PRECISION ;
    uint256 tvl ;
    uint256 treasuryAmount ;

    bytes32 public constant DATA_PROVIDER_ORACLE =
        keccak256("DATA_PROVIDER_ORACLE");
    bytes32 public constant HOUSE_POOL_DATA_PROVIDER =
        keccak256("HOUSEPOOL_DATA_PROVIDER");

    mapping(address => uint256) nonces;
    mapping(address => uint256) userDepositAmount;

    modifier onlyValid(VoI memory data, bytes memory signature) {
        bytes32 digest = _hashTypedDataV4(
            keccak256(
                abi.encode(
                    keccak256(
                        "VoI(address signer,int256 value,uint256 nonce,uint256 deadline)"
                    ),
                    data.signer,
                    data.value,
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

    constructor(
        address owner,
        address mockTokenAddress,
        address claimTokenAddress,
        string memory name,
        string memory version
    ) EIP712(name, version) {
        token = IERC20(mockTokenAddress);
        claimToken = claimTokenInterface(claimTokenAddress);
        _setupRole(DEFAULT_ADMIN_ROLE, owner);
    }

    function setEVFromSignedData(
        bytes memory signature,
        VoI memory data
    ) external onlyValid(data, signature) onlyRole(HOUSE_POOL_DATA_PROVIDER)
    {
        _setEV(data);
    }

    function setMaxExposure(uint256 exposure)
        external
        onlyRole(HOUSE_POOL_DATA_PROVIDER)
    {
        maxExposure = exposure;
    }

    function deposit(uint256 amount) external nonReentrant {
        require(
            amount > 0 && amount <= token.balanceOf(msg.sender),
            "USDCHousePool: Check the Balance"
        );
        liquidity += amount;
        tvl += amount;
        userDepositAmount[msg.sender] += amount;
        token.transferFrom(msg.sender, address(this), amount);
        uint256 LPTokensToMint = (amount * 10**POOL_PRECISION) / (lpTokenPrice);
        claimToken.mint(msg.sender, LPTokensToMint);
        setTokenPrice();
        setTokenWithdrawlPrice();
    }

    function withdraw(uint256 amount) external nonReentrant {
        require(amount > 0, "USDCHousePool: Zero Amount");
        require(
            amount <=  (
                claimToken.balanceOf(msg.sender) / 
                10**POOL_PRECISION) * lpTokenWithdrawlPrice  &&  
                amount <  liquidity - maxExposure,
                "USDCHousePool : can't withdraw"
        );
        uint256 LPTokensToBurn = (amount * 10**POOL_PRECISION) / (lpTokenWithdrawlPrice);
        liquidity -= amount;
        tvl -= amount;
        userDepositAmount[msg.sender] -= amount;
        token.transfer(msg.sender, amount);
        claimToken.burn(msg.sender, LPTokensToBurn);
        setTokenWithdrawlPrice();
        setTokenPrice();
    }

    function getTokenPrice() external view returns (uint256) {
        return lpTokenPrice;
    }

    function getTreasuryAmount() view external returns(uint256) {
        return treasuryAmount;
    }

    function getMaxExposure() external view returns (uint256) {
        return maxExposure;
    }

    function getTokenWithdrawlPrice() external view returns(uint256) {
        return lpTokenWithdrawlPrice;
    }

    function getTVLofPool() external view returns (uint256) {
        return tvl;
    }


    function getEV() external view returns (int256) {
        return ev.value;
    }

    function getLiquidityStatus() external view returns (uint256) {
        return liquidity;
    }

    function getMyBalance(address _user) external view returns (uint256) {
        return userDepositAmount[_user];
    }

    function setTokenPrice() internal {
        if(claimToken.totalSupply() != 0) {
            lpTokenPrice = (
                tvl * 10**POOL_PRECISION) / 
                claimToken.totalSupply();
        }
    }

    function setTokenWithdrawlPrice() internal {
        if(claimToken.totalSupply() != 0) {
            lpTokenWithdrawlPrice = (
                liquidity * 10**POOL_PRECISION) / 
                claimToken.totalSupply();
        }
    }

    function _setEV(VoI memory expectedValue) private {
        if(ev.value == 0){
           tvl += uint(expectedValue.value); 
        }else {
            tvl -= uint(ev.value);
            tvl += uint(expectedValue.value);
        }
        ev = expectedValue;
        setTokenPrice();
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
        ev.value = 0;
        maxExposure = 0;
        tvl += treasuryAmount;
        setTokenPrice();
        setTokenWithdrawlPrice(); 
    }

    function setBettingStakes(uint256 bettingAmount)
        external
    {
        bettingStakes = bettingAmount;
    }

    function getBettingStakes() external view returns (uint256) {
        return bettingStakes;
    }

    
}
