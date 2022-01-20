// SPDX-License-Identifier:  MIT
pragma solidity 0.8.10;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import 'hardhat/console.sol';

interface IRewarder {
    function onReward(uint256 pid, address user, address recipient, uint256 rewardAmount, uint256 newLpAmount) external;
    function pendingTokens(uint256 pid, address user, uint256 rewardAmount) external view returns (IERC20[] memory, uint256[] memory);
}

interface IFundDistributor {
    function distributeReward(address _receiver, uint256 _amount) external;
}

contract LFiFarms is AccessControl {
    using SafeERC20 for IERC20;

    struct FarmInfo {
        uint accRewardPerShare;
        uint lastRewardTime;
        uint allocPoint;
    }
    struct UserInfo {
        uint amount;
        int rewardDebt;
    }

    IERC20 public reward;
    IFundDistributor public fund;
    FarmInfo[] public farmInfo;
    IERC20[] public lpTokens;
    IRewarder[] public rewarder;

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

    constructor(address _admin, IERC20 _rewardToken, IFundDistributor _fund) {
        reward = _rewardToken;
        fund = _fund;
        _setupRole(DEFAULT_ADMIN_ROLE, _admin);
    }

    function createFarm(uint _allocPoint, IERC20 _lpToken, IRewarder _rewarder) external onlyRole(DEFAULT_ADMIN_ROLE) {
        checkFarmDoesntExist(_lpToken);

        totalAllocPoint += _allocPoint;
        farmInfo.push(FarmInfo({
            accRewardPerShare: 0,
            lastRewardTime: block.timestamp,
            allocPoint: _allocPoint
        }));
        lpTokens.push(_lpToken);
        rewarder.push(_rewarder);

        emit FarmCreated(lpTokens.length - 1, _allocPoint, _lpToken);
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
    function deposit(uint fid, uint lpAmount, address benefitor) external {
        FarmInfo memory farm = refreshFarm(fid);
        UserInfo storage user = userInfo[fid][benefitor];

        user.amount += lpAmount;
        user.rewardDebt += int(lpAmount * farm.accRewardPerShare / ACC_REWARD_PRECISION);

        IRewarder _rewarder = rewarder[fid];
        if (address(_rewarder) != address(0)) {
            _rewarder.onReward(fid, benefitor, benefitor, 0, user.amount);
        }

        lpTokens[fid].safeTransferFrom(msg.sender, address(this), lpAmount);
        emit FarmDeposit(msg.sender, fid, lpAmount, benefitor);

    }

    function withdraw(uint fid, uint lpAmount, address receiver) public {
        FarmInfo memory farm = refreshFarm(fid);
        UserInfo storage user = userInfo[fid][msg.sender];

        // Effects
        user.rewardDebt -= int(lpAmount * farm.accRewardPerShare / ACC_REWARD_PRECISION);
        user.amount -= lpAmount;

        IRewarder _rewarder = rewarder[fid];
        if (address(_rewarder) != address(0)) {
            _rewarder.onReward(fid, msg.sender, receiver, 0, user.amount);
        }

        lpTokens[fid].safeTransfer(receiver, lpAmount);
        emit FarmWithdraw(msg.sender, fid, lpAmount, receiver);
    }

   function harvestAll(address receiver) external {
       uint farmCount = farmInfo.length;
        for (uint256 fid = 0; fid < farmCount; ++fid) {
            if (userInfo[fid][msg.sender].amount > 0) {
                harvest(fid, receiver);
            }
        }
    }

    function harvest(uint fid, address receiver) public {
        FarmInfo memory farm = refreshFarm(fid);
        UserInfo storage user = userInfo[fid][msg.sender];
        int accumulatedReward = int(user.amount * farm.accRewardPerShare / ACC_REWARD_PRECISION);
        uint _pendingReward = uint(accumulatedReward - user.rewardDebt);

        user.rewardDebt = accumulatedReward;

        fund.distributeReward(receiver, _pendingReward);

        IRewarder _rewarder = rewarder[fid];
        if (address(_rewarder) != address(0)) {
            _rewarder.onReward(fid, msg.sender, receiver, _pendingReward, user.amount);
        }

        emit FarmHarvest(msg.sender, fid, _pendingReward, receiver);
    }


    function checkFarmDoesntExist(IERC20 _token) public view {
        for (uint256 index = 0; index < farmInfo.length; index++) {
            require(lpTokens[index] != _token, "Farm exists already");
        }
    }

    function getFarmCount() external view returns(uint farmCount) {
        return farmInfo.length;
    }
}
