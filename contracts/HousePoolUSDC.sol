// SPDX-License-Identifier:  MIT
pragma solidity 0.8.10;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";
import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";
import "hardhat/console.sol";

interface USDCclaimTokenInterface {
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
    IERC20 usdcToken;
    USDCclaimTokenInterface USDCclaimToken;
    uint256 usdcLiquidity;
    uint256 bettingStakes;
    uint256 maxExposure;
    VoI ev;
    uint256 constant POOL_PRECISION = 6 ;
    uint256 LPTokenPrice = 100*10**POOL_PRECISION ;
    uint256 LPTokenWithdrawlPrice = 100*10**POOL_PRECISION ;
    uint256 tvl ;
    uint256 treasuryAmount ;

    bytes32 public constant DATA_PROVIDER_ORACLE =
        keccak256("DATA_PROVIDER_ORACLE");
    bytes32 public constant HOUSE_POOL_DATA_PROVIDER =
        keccak256("HOUSEPOOL_DATA_PROVIDER");

    mapping(address => uint256) nonces;
    mapping(address => uint256) userDepositAmount;

    modifier onlyValid(VoI memory _data, bytes memory _signature) {
        bytes32 _digest = _hashTypedDataV4(
            keccak256(
                abi.encode(
                    keccak256(
                        "VoI(address signer,int256 value,uint256 nonce,uint256 deadline)"
                    ),
                    _data.signer,
                    _data.value,
                    nonces[_data.signer],
                    _data.deadline
                )
            )
        );
        require(
            SignatureChecker.isValidSignatureNow(_data.signer, _digest, _signature),
            "HousePoolUSDC: invalid signature"
        );

        require(
            _data.signer != address(0),
            "HousePoolUSDC: invalid signer");

        require(
            hasRole(DATA_PROVIDER_ORACLE, _data.signer),
            "HousePoolUSDC: unauthorised signer"
        );

        require(
            block.number < _data.deadline,
            "HousePoolUSDC: signed transaction expired"
        );

        nonces[_data.signer]++;
        _;
    }

    constructor(
        address _owner,
        address _usdctoken,
        address _USDCclaimToken,
        string memory _name,
        string memory _version
    ) EIP712(_name, _version) {
        usdcToken = IERC20(_usdctoken);
        USDCclaimToken = USDCclaimTokenInterface(_USDCclaimToken);
        _setupRole(DEFAULT_ADMIN_ROLE, _owner);
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

    function getMaxExposure() external view returns (uint256) {
        return maxExposure;
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

    function getEV() external view returns (int256) {
        return ev.value;
    }


    function getLiquidityStatus() external view returns (uint256) {
        return usdcLiquidity;
    }

    function getMyBalance(address _user) external view returns (uint256) {
        return userDepositAmount[_user];
    }

    function deposit(uint256 amount) external nonReentrant {
        require(
            amount > 0 && amount <= usdcToken.balanceOf(msg.sender),
            "USDCHousePool: Check the Balance"
        );
        usdcLiquidity += amount;
        tvl += amount;
        userDepositAmount[msg.sender] += amount;
        usdcToken.transferFrom(msg.sender, address(this), amount);
        uint256 LPTokensToMint = (amount * 10**POOL_PRECISION) / (LPTokenPrice);
        USDCclaimToken.mint(msg.sender, LPTokensToMint);
        setTokenPrice();
        setLPTokenWithdrawlPrice();
    }

    function withdraw(uint256 amount) external nonReentrant {
        require(amount > 0, "USDCHousePool: Zero Amount");
        require(
            amount <=  (USDCclaimToken.balanceOf(msg.sender) / 10**POOL_PRECISION) * LPTokenWithdrawlPrice  &&  
            amount <  usdcLiquidity - maxExposure,
            "USDCHousePool : can't withdraw"
        );
        uint256 LPTokensToBurn = (amount * 10**POOL_PRECISION) / (LPTokenWithdrawlPrice);
        usdcLiquidity -= amount;
        tvl -= amount;
        userDepositAmount[msg.sender] -= amount;
        usdcToken.transfer(msg.sender, amount);
        USDCclaimToken.burn(msg.sender, LPTokensToBurn);
        setLPTokenWithdrawlPrice();
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
            usdcLiquidity += (betAmount/100) * 99;
        } else {
            treasuryAmount += bettingStakes/100;
            bettingStakes -= betAmount;
        }
        ev.value = 0;
        maxExposure = 0;
        tvl += treasuryAmount;
        setTokenPrice();
        setLPTokenWithdrawlPrice(); 
    }

    function getTreasuryAmount() view external returns(uint256) {
        return treasuryAmount;
    }

    function setTokenPrice() internal {
        if(USDCclaimToken.totalSupply() != 0) {
            LPTokenPrice = (tvl * 10**POOL_PRECISION) / USDCclaimToken.totalSupply();
        }
    }

    function setLPTokenWithdrawlPrice() internal {
        if(USDCclaimToken.totalSupply() != 0) {
            LPTokenWithdrawlPrice = (usdcLiquidity * 10**POOL_PRECISION) / USDCclaimToken.totalSupply();
        }
    }

    function setTokenPrice() internal {
        if(USDCclaimToken.totalSupply() != 0) {
            LPTokenPrice = (tvl * 10**POOL_PRECISION) / USDCclaimToken.totalSupply();
        }
    }

    function setLPTokenWithdrawlPrice() internal {
        if(USDCclaimToken.totalSupply() != 0) {
            LPTokenWithdrawlPrice = (usdcLiquidity * 10**POOL_PRECISION) / USDCclaimToken.totalSupply();
        }
    }

    function getTokenPrice() external view returns (uint256) {
        return LPTokenPrice;
    }

    function getTokenWithdrawlPrice() external view returns(uint256) {
        return LPTokenWithdrawlPrice;
    }

    function getTVLofPool() external view returns (uint256) {
        return tvl;
    }

    function setBettingStakes(uint256 bettingAmount)
        external
        onlyRole(DATA_PROVIDER_ORACLE)
    {
        bettingStakes = bettingAmount;
    }

    function getBettingStakes() external view returns (uint256) {
        return bettingStakes;
    }

    
}
