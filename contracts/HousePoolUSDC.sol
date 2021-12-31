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
        uint256 value;
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

    bytes32 public constant HOUSE_POOL_DATA_PROVIDER =
        keccak256("HOUSEPOOL_DATA_PROVIDER");
    bytes32 public constant HOUSE_POOL_OPERATOR =
        keccak256("HOUSEPOOL_OPERATOR");

    mapping(address => uint256) nonces;
    mapping(address => uint256) userDepositAmount;

    modifier onlyValid(VoI memory _data, bytes memory _signature) {
        bytes32 _digest = _hashTypedDataV4(
            keccak256(
                abi.encode(
                    keccak256(
                        "VoI(address signer,uint256 value,uint256 nonce,uint256 deadline)"
                    ),
                    _data.signer,
                    _data.value,
                    nonces[_data.signer],
                    _data.deadline
                )
            )
        );
        SignatureChecker.isValidSignatureNow(_data.signer, _digest, _signature);

        require(_data.signer != address(0), "HousePoolUSDC: invalid signer");

        require(
            hasRole(HOUSE_POOL_DATA_PROVIDER, _data.signer),
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
    ) external onlyValid(data, signature) onlyRole(HOUSE_POOL_OPERATOR)
    {
        _setEV(data);
    }

    function setTokenPrice() internal {
        LPTokenPrice = (tvl * 10**POOL_PRECISION) / USDCclaimToken.totalSupply();
    }

    function setLPTokenWithdrawlPrice() internal {
        LPTokenWithdrawlPrice = (usdcLiquidity * 10**POOL_PRECISION)/USDCclaimToken.totalSupply();
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

    function setMaxExposure(uint256 exposure)
        external
        onlyRole(HOUSE_POOL_OPERATOR)
    {
        maxExposure = exposure;
    }

    function getMaxExposure() external view returns (uint256) {
        return maxExposure;
    }

    function _setEV(VoI memory expectedValue) private {
        ev = expectedValue;
        tvl += expectedValue.value;
        setTokenPrice();
    }

    // TODO DELETE
    function setEV(uint256 expectedValue) external {
        ev.value = expectedValue;
        tvl += expectedValue;
        setTokenPrice();
    }

    function getEV() external view returns (uint256) {
        return ev.value;
    }

    function setBettingStakes(uint256 bettingAmount)
        external
        onlyRole(HOUSE_POOL_DATA_PROVIDER)
    {
        bettingStakes = bettingAmount;
    }

    function getBettingStakes() external view returns (uint256) {
        return bettingStakes;
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
        uint256 LPTokensToMint = (amount * 10**POOL_PRECISION)/ (LPTokenPrice);
        USDCclaimToken.mint(msg.sender, LPTokensToMint);
        setTokenPrice();
        setLPTokenWithdrawlPrice();
    }

    function withdraw(uint256 amount) external nonReentrant {
        require(amount > 0, "USDCHousePool: Zero Amount");
        require(
            amount <=  (USDCclaimToken.balanceOf(msg.sender) / 10**POOL_PRECISION) * LPTokenWithdrawlPrice  &&  
            amount <  usdcLiquidity - maxExposure,"USDCHousePool : can't withdraw");
        uint256 LPTokensToBurn = (amount * 10**POOL_PRECISION)/ (LPTokenWithdrawlPrice);
        usdcLiquidity -= amount;
        tvl -= amount;
        userDepositAmount[msg.sender] -= amount;
        usdcToken.transfer(msg.sender, amount);
        USDCclaimToken.burn(msg.sender, LPTokensToBurn);
        setLPTokenWithdrawlPrice();
    }
}
