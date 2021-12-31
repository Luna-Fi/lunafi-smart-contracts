// SPDX-License-Identifier:  MIT
pragma solidity 0.8.10;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";
import 'hardhat/console.sol';

interface USDCclaimTokenInterface {
    function burn(address account, uint256 tokens) external;
    function mint(address account, uint256 tokens) external;
    function balanceOf(address tokenOwner) external view returns (uint256 getBalance);
    function totalSupply() external view returns (uint256);
}

contract HousePoolUSDC is ReentrancyGuard, AccessControl, EIP712 {
    IERC20 usdcToken;
    USDCclaimTokenInterface USDCclaimToken;
    uint256 usdcLiquidity;
    uint256 bettingStakes;
    uint256 maxExposure;
    uint256 ev;
    uint256 tvl;
    uint256 constant POOL_PRECISION = 6;
    uint256 LPTokenPrice = 100 * 10**POOL_PRECISION;

    bytes32 public constant HOUSE_POOL_DATA_PROVIDER =
        keccak256("HOUSEPOOL_DATA_PROVIDER");

    mapping(address => uint256) nonces;
    mapping(address => uint256) userDepositAmount;

    constructor(
        address _owner,
        address _usdctoken,
        address _USDCclaimToken
    ) EIP712("LunaFi", "1.0.0") {
        usdcToken = IERC20(_usdctoken);
        USDCclaimToken = USDCclaimTokenInterface(_USDCclaimToken);
        _setupRole(DEFAULT_ADMIN_ROLE, _owner);
    }

    function setEVFromSignedData(
        bytes memory signature,
        address signer,
        uint256 evValue,
        uint256 deadline
    ) external // onlyRole(HOUSE_POOL_DATA_PROVIDER)
    {
        // The typehash for the data type specified in the structured data
        // https://github.com/ethereum/EIPs/blob/master/EIPS/eip-712.md#rationale-for-typehash
        // This should match whats in the client side whitelist signing code
        // https://github.com/msfeldstein/EIP712-whitelisting/blob/main/test/signWhitelist.ts#L22
        bytes32 digest = _hashTypedDataV4(
            keccak256(
                abi.encode(
                    keccak256("EVData(address signer,uint256 evValue,uint256 nonce,uint256 deadline)"),
                    signer,
                    evValue,
                    nonces[signer],
                    deadline
                )
            )
        );

        address signedBy = ECDSA.recover(digest, signature);
        require(signedBy == signer, "HousePoolUSDC: invalid signature");
        require(signedBy != address(0), "ECDSA: invalid signature");

        require(block.number < deadline, "HousePoolUSDC: signed transaction expired");
        nonces[signer]++;

        _setEV(evValue);
    }

    function setTokenPrice() internal {
        LPTokenPrice = (tvl * 10**POOL_PRECISION) / USDCclaimToken.totalSupply();
    }

    function getTokenPrice() external view returns (uint256) {
        return LPTokenPrice;
    }

    function getTVLofPool() external view returns (uint256) {
        return tvl;
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

    function _setEV(uint256 expectedValue) private {
        ev = expectedValue;
        tvl += expectedValue;
        // setTokenPrice();
    }

    // TODO DELETE
    function setEV(uint256 expectedValue) external {
        ev = expectedValue;
        tvl += expectedValue;
        setTokenPrice();
    }

    function getEV() external view returns (uint256) {
        return ev;
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
        uint256 LPTokensToMint = (amount * 10**POOL_PRECISION) / (LPTokenPrice);
        USDCclaimToken.mint(msg.sender, LPTokensToMint);
        if (USDCclaimToken.totalSupply() != 0) {
            setTokenPrice();
        }
    }

    function withdraw(uint256 amount) external nonReentrant {
        require(amount > 0, "USDCHousePool: Zero Amount");
        require(
            amount <=
                (USDCclaimToken.balanceOf(msg.sender) / 10**POOL_PRECISION) *
                    LPTokenPrice &&
                amount < usdcLiquidity - maxExposure,
            "USDCHousePool : can't withdraw"
        );
        uint256 LPTokensToBurn = (amount * 10**POOL_PRECISION) / (LPTokenPrice);
        usdcLiquidity -= amount;
        userDepositAmount[msg.sender] -= amount;
        usdcToken.transfer(msg.sender, amount);
        USDCclaimToken.burn(msg.sender, LPTokensToBurn);
    }
}