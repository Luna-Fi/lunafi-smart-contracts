// SPDX-License-Identifier:  MIT
pragma solidity 0.8.10;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import 'hardhat/console.sol';

interface IFundDistributor {
    function distributeReward(address _receiver, uint256 _amount) external;
}

interface IRewarder {
    function onReward(uint256 pid, address user, address recipient, uint256 rewardAmount, uint256 newLpAmount) external;
    function pendingTokens(uint256 pid, address user, uint256 rewardAmount) external view returns (IERC20[] memory, uint256[] memory);
}

contract LFiFarms is AccessControl {
    using SafeERC20 for IERC20;

    /// @notice Info for each LFi Farms user
    /// `amount` LP Token amount the user has provided
    /// `rewardDebt` The amount of LFI Tokens entitled to the user. 
    struct UserInfo {
        uint256 amount;  
        int256 rewardDebt;
    }

    /// @notice Info of each LFi Farm 
    /// `allocPoint` The amount of allocation points assigned to the Pool
    /// `accRewardPerShare` Accumulated Reward Per Share
    /// `lastRewardTime` Timestamp when the late rewards were issues.
    struct FarmInfo {
        uint256 accRewardPerShare;
        uint256 lastRewardTime;
        uint256 allocPoint; 
    }

    IERC20 public reward; // Reward Token --LFI
    IFundDistributor public fund; // Fund Distributor contract address
    FarmInfo[] public farmInfo; // List of Farms
    IERC20[] public lpToken; // List of LP Tokens 
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
    event EmergencyWithdraw(address indexed user, uint256 indexed fid, uint256 amount, address indexed receiver);
    event LogSetPool(uint256 indexed fid, uint256 allocPoint, IRewarder indexed rewarder, bool overwrite);
    event FarmFundChanged(address indexed fund);

    constructor(address _admin, IERC20 _rewardToken, IFundDistributor _fund) {
        reward = _rewardToken;
        fund = _fund;
        _setupRole(DEFAULT_ADMIN_ROLE, _admin);
    }

    /// @notice Returns the number of LFi Farms
    function farmLength() public view returns(uint256 farms) {
        return  farmInfo.length;
    }

    /// @notice View function to see pending reward on frontend.
    /// @param _fid The index of the Farm. See `farmInfo`.
    /// @param _user Address of user.
    /// @return pendingRewards for a given user.
    function pendingReward(uint256 _fid,address _user) external view returns (uint256 pendingRewards) {
        FarmInfo memory farm = farmInfo[_fid];
        UserInfo storage user = userInfo[_fid][_user];
        uint256 accRewardPerShare = farm.accRewardPerShare;
        uint256 lpBalanceOfFarm = lpToken[_fid].balanceOf(address(this));
        if (block.timestamp > farm.lastRewardTime && lpBalanceOfFarm != 0) {
            uint256 time = block.timestamp - farm.lastRewardTime;
            uint256 rewardAmount = time * rewardPerSecond * farm.allocPoint / totalAllocPoint;
            accRewardPerShare += (rewardAmount * ACC_REWARD_PRECISION) / lpBalanceOfFarm;
        }
        pendingRewards = uint256(int256(user.amount * accRewardPerShare / ACC_REWARD_PRECISION) - user.rewardDebt);
    }

   
    // Create Farm function create a farm.
    function createFarm(uint _allocPoint, IERC20 _lpToken, IRewarder _rewarder) external onlyRole(DEFAULT_ADMIN_ROLE) {
        checkFarmDoesntExist(_lpToken);

        totalAllocPoint += _allocPoint;
        farmInfo.push(FarmInfo({
            accRewardPerShare: 0,
            lastRewardTime: block.timestamp,
            allocPoint: _allocPoint
        }));
        lpToken.push(_lpToken);
        rewarder.push(_rewarder);

        emit FarmCreated(lpToken.length - 1, _allocPoint, _lpToken);
    }

    //Set Farm
    function setFarm(uint256 fid, uint256 allocPoint, IRewarder _rewarder,  bool overwrite) public onlyRole(DEFAULT_ADMIN_ROLE) {
        totalAllocPoint = totalAllocPoint - farmInfo[fid].allocPoint + allocPoint;
        farmInfo[fid].allocPoint = allocPoint;
        if (overwrite) { rewarder[fid] = _rewarder; }
        emit LogSetPool(fid, allocPoint, overwrite ? _rewarder : rewarder[fid], overwrite);

    }

    function setRewardPerSecond(uint256 _rewardPerSecond) public onlyRole(DEFAULT_ADMIN_ROLE) {
        rewardPerSecond = _rewardPerSecond;
        emit RewardPerSecondUpdated(_rewardPerSecond);
    }

    function updateFarm(uint fid) public returns(FarmInfo memory farm) {
        farm = farmInfo[fid];
        if(farm.lastRewardTime < block.timestamp) {
            uint lpSupply = lpToken[fid].balanceOf(address(this));
            console.log("LPSupply",lpSupply);
            if(lpSupply > 0) {
                uint time = block.timestamp - farm.lastRewardTime;
                console.log("Time:", time);
                uint rewardAmount = time * rewardPerSecond * farm.allocPoint / totalAllocPoint;
                console.log("rewardAmount",rewardAmount);
                farm.accRewardPerShare += rewardAmount * ACC_REWARD_PRECISION / lpSupply;
                console.log("Farm Acc",farm.accRewardPerShare);
            }
            farm.lastRewardTime = block.timestamp;
            farmInfo[fid] = farm;
            emit FarmUpdated(fid, farm.lastRewardTime, lpSupply, farm.accRewardPerShare);
        }
    }

    function massUpdateFarms(uint256[] calldata fids) external {
        uint256 len = fids.length;
        for(uint256 i = 0; i < len; i++) {
            updateFarm(fids[i]);
        }
    }

    /// @notice Deposit LP tokens to farms for LFI token rewards
    /// @dev See FarmInfo struct `farmCount()` & `listFarms()` for farm details
    /// @param fid farm ID; see FarmInfo struct for more details
    /// @param lpAmount Amount of LP tokens to deposit; User must have LP tokens corresponding to the farm
    /// @param benefitor Receiver of farm rewards
    function deposit(uint fid, uint lpAmount, address benefitor) external {
        
        FarmInfo memory farm = updateFarm(fid);
        UserInfo storage user = userInfo[fid][benefitor];

        //Effects
        user.amount += lpAmount;
        user.rewardDebt += int(lpAmount * farm.accRewardPerShare / ACC_REWARD_PRECISION);

        //Interactions
        // IRewarder _rewarder = rewarder[fid];
        // if (address(_rewarder) != address(0)) {
        //     _rewarder.onReward(fid, benefitor, benefitor, 0, user.amount);
        // }
        lpToken[fid].safeTransferFrom(msg.sender, address(this), lpAmount);
        emit FarmDeposit(msg.sender, fid, lpAmount, benefitor);
    }

    function withdraw(uint fid, uint LPTokenAmount, address receiver) public {
        FarmInfo memory farm = updateFarm(fid);
        UserInfo storage user = userInfo[fid][msg.sender];
        // Effects
        user.rewardDebt -= int(LPTokenAmount * farm.accRewardPerShare / ACC_REWARD_PRECISION);
        user.amount -= LPTokenAmount;
        //Interactions
        // IRewarder _rewarder = rewarder[fid];
        // if (address(_rewarder) != address(0)) {
        //     _rewarder.onReward(fid, msg.sender, receiver, 0, user.amount);
        // }
        lpToken[fid].safeTransfer(receiver, LPTokenAmount);
        emit FarmWithdraw(msg.sender, fid, LPTokenAmount, receiver);
    }

    
    function harvestAll(address receiver) external {
       uint farmCount = farmInfo.length;
        for (uint256 fid = 0; fid < farmCount; ++fid) {
            if (userInfo[fid][msg.sender].amount > 0) {
                harvest(fid, receiver);
            }
        }
    }

    /// @notice Harvest proceeds for transaction sender to `receiver`.
    /// @param fid The index of the pool. See `farmInfo`.
    /// @param receiver Receiver of rewards.
    function harvest(uint fid, address receiver) public {
        FarmInfo memory farm = updateFarm(fid);
        UserInfo storage user = userInfo[fid][msg.sender];
        int accumulatedReward = int(user.amount * farm.accRewardPerShare / ACC_REWARD_PRECISION);
        console.logInt(accumulatedReward);
        uint _pendingReward = uint(accumulatedReward - user.rewardDebt);
        console.log(_pendingReward);
        user.rewardDebt = accumulatedReward;
        fund.distributeReward(receiver, _pendingReward);
        // IRewarder _rewarder = rewarder[fid];
        // if (address(_rewarder) != address(0)) {
        //     _rewarder.onReward( fid, msg.sender, to, _pendingReward, user.amount);
        // }
        emit FarmHarvest(msg.sender, fid, _pendingReward, receiver);
    }

    /// @notice Withdraw LP Tokens from LFi Farms and harvest proceeds for transaction sender to "Receiver"
    /// @param fid The index of the farm. See `farmInfo`
    /// @param LPTokenamount LPToken amount to withdraw
    /// @param receiver Receiver of the Lptokens and rewards.
    function withdrawAndHarvest(uint256 fid, uint256 LPTokenamount, address receiver) public {
        FarmInfo memory farm = updateFarm(fid);
        UserInfo storage user = userInfo[fid][msg.sender];
        int256 accumulatedReward = int256(user.amount * farm.accRewardPerShare / ACC_REWARD_PRECISION);
        uint256 _pendingReward = uint256(accumulatedReward - user.rewardDebt);

        // Effects
        user.rewardDebt = accumulatedReward - int256(LPTokenamount * farm.accRewardPerShare / ACC_REWARD_PRECISION);
        user.amount -= LPTokenamount;

        //Interactions
        fund.distributeReward(receiver,LPTokenamount);

        // IRewarder _rewarder = rewarder[fid];
        // if (address(_rewarder) != address(0)) {
        //     _rewarder.onReward(fid, msg.sender, receiver, _pendingReward, user.amount);
        // }

        lpToken[fid].safeTransfer(receiver, LPTokenamount);

        emit FarmWithdraw(msg.sender, fid, LPTokenamount, receiver);
        emit FarmHarvest(msg.sender, fid, _pendingReward,receiver);

    }

    /// @notice Withdraw without caring about rewards. EMERGENCY ONLY.
    /// @param fid The index of the farm. see `farmInfo`
    /// @param receiver Receiver of the LP Tokens.
    function emergencyWithdraw(uint256 fid, address receiver) public {
        UserInfo storage user = userInfo[fid][msg.sender];
        uint256 amount = user.amount;
        user.amount = 0;
        user.rewardDebt = 0;

        // IRewarder _rewarder = rewarder[fid];
        // if (address(_rewarder) != address(0)) {
        //     _rewarder.onReward(fid, msg.sender, receiver, 0, 0);
        // }

        // Note: transfer can fail or succeed if `amount` is zero.
        lpToken[fid].safeTransfer(receiver, amount);
        emit EmergencyWithdraw(msg.sender, fid, amount, receiver);

    }

    function checkFarmDoesntExist(IERC20 _token) public view {
        for (uint256 index = 0; index < farmInfo.length; index++) {
            require(lpToken[index] != _token, "Farm exists already");
        }
    }

    function setFund(IFundDistributor _fund) public onlyRole(DEFAULT_ADMIN_ROLE) {
        fund = _fund;
        emit FarmFundChanged(address(_fund));
    }

}
