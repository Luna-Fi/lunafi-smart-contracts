// SPDX-License-Identifier:  MIT
pragma solidity 0.8.10;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
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

interface IFundDistributor {
    function distributeTo(address _receiver, uint256 _amount) external;
}

interface IRewardToken is IERC20 {
    function mint(address _recipient, uint256 _amount) external;
}

contract HousePoolUSDC is ReentrancyGuard, AccessControl, EIP712 {
    using SafeERC20 for IERC20;

    struct ValuesOfInterest {
        int256 expectedValue;
        int256 maxExposure;
        uint256 deadline;
        address signer;
    }

    struct FarmInfo {
        uint accRewardPerShare;
        uint lastRewardTime;
        uint allocPoint;
    }
    struct UserInfo {
        uint amount;
        int rewardDebt;
    }

    FarmInfo[] public farmInfo;
    IERC20[] public lpTokens;
    IRewardToken public reward;

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

    /// @notice Info of each user that stakes LP tokens.
    mapping (uint256 => mapping (address => UserInfo)) public userInfo;
    /// @dev Total allocation points. Must be the sum of all allocation points in all pools.
    uint256 public totalAllocPoint = 0;

    uint256 public rewardPerSecond;
    uint256 private constant ACC_REWARD_PRECISION = 1e12;
    event RewardPerSecondUpdated(uint newRewardPerSecond);
    event FarmCreated(uint256 indexed fid, uint256 allocatedPoints, IERC20 indexed lpToken);
    event FarmDeposit(address indexed depositor, uint256 indexed fid, uint256 amount, address indexed benefitor);
    event FarmWithdraw(address indexed requestor, uint256 indexed fid, uint256 amount, address indexed receiver);
    event FarmHarvest(address indexed requestor, uint256 indexed fid, uint256 amount, address indexed receiver);
    event FarmUpdated(uint256 indexed fid, uint256 lastRewardTime, uint256 lpSupply, uint256 accRewardPerShare);

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
        address _rewardToken,
        string memory _name,
        string memory _version
    ) EIP712(_name, _version) {
        token = IERC20(_usdc);
        claimToken = claimTokenInterface(_claimToken);
        reward = IRewardToken(_rewardToken);
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

    function createFarm(uint allocPoint, IERC20 lpToken) external onlyRole(DEFAULT_ADMIN_ROLE) {
        checkFarmDoesntExist(lpToken);

        totalAllocPoint += allocPoint;
        farmInfo.push(FarmInfo({
            accRewardPerShare: 0,
            lastRewardTime: block.timestamp,
            allocPoint: allocPoint
        }));
        lpTokens.push(lpToken);

        emit FarmCreated(lpTokens.length - 1, allocPoint, lpToken);
    }

    function setRewardPerSecond(uint256 _rewardPerSecond) public onlyRole(DEFAULT_ADMIN_ROLE) {
        rewardPerSecond = _rewardPerSecond;
        emit RewardPerSecondUpdated(_rewardPerSecond);
    }

    function refreshFarm(uint fid) public returns(FarmInfo memory farm) {
        farm = farmInfo[fid];
        if(farm.lastRewardTime < block.timestamp) {
            uint lpSupply = lpTokens[fid].balanceOf(address(this));
            if(lpSupply > 0) {
                uint time = block.timestamp - farm.lastRewardTime;
                uint rewardAmount = time * rewardPerSecond * farm.allocPoint / totalAllocPoint;
                farm.accRewardPerShare += rewardAmount * ACC_REWARD_PRECISION / lpSupply;
            }
            farm.lastRewardTime = block.timestamp;
            farmInfo[fid] = farm;
            emit FarmUpdated(fid, farm.lastRewardTime, lpSupply, farm.accRewardPerShare);
        }
    }
    /// @notice Deposit LP tokens to farms for LFI token rewards
    /// @dev See FarmInfo struct `farmCount()` & `listFarms()` for farm details
    /// @param fid farm ID; see FarmInfo struct for more details
    /// @param lpAmount Amount of LP tokens to deposit; User must have LP tokens corresponding to the farm
    /// @param benefitor Receiver of farm rewards
    function depositLP(uint fid, uint lpAmount, address benefitor) external {
        FarmInfo memory farm = refreshFarm(fid);
        UserInfo storage user = userInfo[fid][benefitor];

        user.amount += lpAmount;
        user.rewardDebt += int(lpAmount * farm.accRewardPerShare / ACC_REWARD_PRECISION);

        lpTokens[fid].safeTransferFrom(msg.sender, address(this), lpAmount);
        emit FarmDeposit(msg.sender, fid, lpAmount, benefitor);

    }

    function withdrawLP(uint fid, uint lpAmount, address receiver) public {
        FarmInfo memory farm = refreshFarm(fid);
        UserInfo storage user = userInfo[fid][msg.sender];

        // Effects
        user.rewardDebt -= int(lpAmount * farm.accRewardPerShare / ACC_REWARD_PRECISION);
        user.amount -= lpAmount;

        lpTokens[fid].safeTransfer(receiver, lpAmount);
        emit FarmWithdraw(msg.sender, fid, lpAmount, receiver);
    }

   function harvestAll(address receiver) external {
        for (uint256 index = 0; index < farmInfo.length; index++) {
            if (userInfo[index][msg.sender].amount > 0) {
                harvest(index, receiver);
            }
        }
    }

    function harvest(uint fid, address receiver) public {
        FarmInfo memory farm = refreshFarm(fid);
        UserInfo storage user = userInfo[fid][msg.sender];
        int accumulatedReward = int(user.amount * farm.accRewardPerShare / ACC_REWARD_PRECISION);
        uint _pendingReward = uint(accumulatedReward - user.rewardDebt);
        user.rewardDebt = accumulatedReward;

        _distributeReward(receiver, _pendingReward);

        emit FarmHarvest(msg.sender, fid, _pendingReward, receiver);
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

    function checkFarmDoesntExist(IERC20 _token) public view {
        for (uint256 index = 0; index < farmInfo.length; index++) {
            require(lpTokens[index] != _token, "Farm exists already");
        }
    }

    function getFarmCount() external view returns(uint farmCount) {
        return farmInfo.length;
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

    function _distributeReward(address _receiver, uint _rewardAmount) internal {
        require(_receiver != address(0), "Invalid address");
        if (_rewardAmount > 0 ) {
            reward.mint(_receiver, _rewardAmount);
        }
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
