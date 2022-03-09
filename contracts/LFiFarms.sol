// SPDX-License-Identifier:  MIT
pragma solidity 0.8.10;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "contracts/interfaces/IFundDistributor.sol";

///@title LunaFi Farm Contract
///@author LunaFi DevTeam
///@notice Farm Contract to yield Rewards in LFI
contract LFiFarms is AccessControl {
    using SafeERC20 for IERC20;

    //Info for each LFi Farms user
    //`amount` LP Token amount the user has provided
    //`rewardDebt` The amount of LFI Tokens entitled to the user.
    struct UserInfo {
        uint256 amount;
        int256 rewardDebt;
    }
    //Info of each LFi Farm
    //`allocPoint` The amount of allocation points assigned to the Pool
    //`accRewardPerShare` Accumulated Reward Per Share
    //`lastRewardTime` Timestamp when the late rewards were issues.
    struct FarmInfo {
        uint256 accRewardPerShare;
        uint256 lastRewardTime;
        uint256 allocPoint;
    }
    //
    IERC20 public reward; 
    IFundDistributor public fund; 
    FarmInfo[] public farmInfo;
    IERC20[] public lpToken; 
    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");

    // Info of each user that stakes LP tokens.
    mapping(uint256 => mapping(address => UserInfo)) public userInfo;

    /// @dev Total allocation points. Must be the sum of all allocation points in all pools.
    uint256 public totalAllocPoint = 0;

    uint256 public rewardPerSecond;
    uint256 private constant ACC_REWARD_PRECISION = 1e18;

    event RewardPerSecondUpdated(uint256 newRewardPerSecond);
    event FarmCreated(
        uint256 indexed fid,
        uint256 allocatedPoints,
        IERC20 indexed lpToken
    );
    event FarmDeposit(
        address indexed depositor,
        uint256 indexed fid,
        uint256 amount,
        address indexed benefitor
    );
    event FarmWithdraw(
        address indexed requestor,
        uint256 indexed fid,
        uint256 amount,
        address indexed receiver
    );
    event FarmHarvest(
        address indexed requestor,
        uint256 indexed fid,
        uint256 amount,
        address indexed receiver
    );
    event FarmUpdated(
        uint256 indexed fid,
        uint256 lastRewardTime,
        uint256 lpSupply,
        uint256 accRewardPerShare
    );
    event EmergencyWithdraw(
        address indexed user,
        uint256 indexed fid,
        uint256 amount,
        address indexed receiver
    );
    event LogSetPool(uint256 indexed fid, uint256 allocPoint, bool overwrite);
    event FarmFundChanged(address indexed fund);

    constructor(
        address _admin,
        IERC20 _rewardToken,
        IFundDistributor _fund
    ) {
        reward = _rewardToken;
        fund = _fund;
        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(MANAGER_ROLE, _admin);
    }

    /// @notice Returns the number LFIFarms
    /// @return farms - the total number of farms created
    function farmLength() external view returns (uint256 farms) {
        return farmInfo.length;
    }

    /// @notice Function to set the Fund Distributor Contract
    /// @dev Set the Fund distributor contract , to distribute rewards, and Only Manager can call the contract
    /// @param _fund Fund Distributor Contract address
    function setFund(IFundDistributor _fund)
        external
        onlyRole(MANAGER_ROLE)
    {
        fund = _fund;
        emit FarmFundChanged(address(_fund));
    }

    /// @notice
    function createFarm(uint256 _allocPoint, IERC20 _lpToken)
        external
        onlyRole(MANAGER_ROLE)
    {
        checkFarmDoesntExist(_lpToken);

        totalAllocPoint += _allocPoint;
        farmInfo.push(
            FarmInfo({
                accRewardPerShare: 0,
                lastRewardTime: block.timestamp,
                allocPoint: _allocPoint
            })
        );
        lpToken.push(_lpToken);
        emit FarmCreated(lpToken.length - 1, _allocPoint, _lpToken);
    }


    function setRewardPerSecond(
        uint256 _rewardPerSecond,
        uint256[] calldata fids
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        massUpdateFarms(fids);
        rewardPerSecond = _rewardPerSecond;
        emit RewardPerSecondUpdated(_rewardPerSecond);
    }

     //Set Farm
    function setFarm(
        uint256 fid,
        uint256 allocPoint,
        bool overwrite
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        totalAllocPoint =
            totalAllocPoint -
            farmInfo[fid].allocPoint +
            allocPoint;
        farmInfo[fid].allocPoint = allocPoint;
        emit LogSetPool(fid, allocPoint, overwrite);
    }


    /// @notice Deposit LP tokens to farms for LFI token rewards
    /// @dev See FarmInfo struct `farmCount()` & `listFarms()` for farm details
    /// @param fid farm ID; see FarmInfo struct for more details
    /// @param lpAmount Amount of LP tokens to deposit; User must have LP tokens corresponding to the farm
    /// @param benefitor Receiver of farm rewards
    function deposit(
        uint256 fid,
        uint256 lpAmount,
        address benefitor
    ) external {
        FarmInfo memory farm = updateFarm(fid);
        UserInfo storage user = userInfo[fid][benefitor];

        //Effects
        user.amount += lpAmount;
        user.rewardDebt += int256(
            (lpAmount * farm.accRewardPerShare) / ACC_REWARD_PRECISION
        );
        emit FarmDeposit(msg.sender, fid, lpAmount, benefitor);
        lpToken[fid].safeTransferFrom(msg.sender, address(this), lpAmount);
        
    }


     function withdraw(
        uint256 fid,
        uint256 LPTokenAmount,
        address receiver
    ) external {
        FarmInfo memory farm = updateFarm(fid);
        UserInfo storage user = userInfo[fid][msg.sender];
        // Effects
        user.rewardDebt -= int256(
            (LPTokenAmount * farm.accRewardPerShare) / ACC_REWARD_PRECISION
        );
        user.amount -= LPTokenAmount;
        emit FarmWithdraw(msg.sender, fid, LPTokenAmount, receiver);
        lpToken[fid].safeTransfer(receiver, LPTokenAmount);
        
    }


    function harvestAll(address receiver) external {
        uint256 farmCount = farmInfo.length;
        for (uint256 fid = 0; fid < farmCount; ++fid) {
            if (userInfo[fid][msg.sender].amount > 0) {
                harvest(fid, receiver);
            }
        }
    }


    /// @notice Withdraw LP Tokens from LFi Farms and harvest proceeds for transaction sender to "Receiver"
    /// @param fid The index of the farm. See `farmInfo`
    /// @param LPTokenamount LPToken amount to withdraw
    /// @param receiver Receiver of the Lptokens and rewards.
    function withdrawAndHarvest(
        uint256 fid,
        uint256 LPTokenamount,
        address receiver
    ) external {
        FarmInfo memory farm = updateFarm(fid);
        UserInfo storage user = userInfo[fid][msg.sender];
        int256 accumulatedReward = int256(
            (user.amount * farm.accRewardPerShare) / ACC_REWARD_PRECISION
        );
        uint256 _pendingReward = uint256(accumulatedReward - user.rewardDebt);

        // Effects
        user.rewardDebt =
            accumulatedReward -
            int256(
                (LPTokenamount * farm.accRewardPerShare) / ACC_REWARD_PRECISION
            );
        user.amount -= LPTokenamount;
        //Interactions
        emit FarmWithdraw(msg.sender, fid, LPTokenamount, receiver);
        emit FarmHarvest(msg.sender, fid, _pendingReward, receiver);
        fund.distributeReward(receiver, _pendingReward);
        lpToken[fid].safeTransfer(receiver, LPTokenamount);
    }

    /// @notice Withdraw without caring about rewards. EMERGENCY ONLY.
    /// @param fid The index of the farm. see `farmInfo`
    /// @param receiver Receiver of the LP Tokens.
    function emergencyWithdraw(uint256 fid, address receiver) external {
        UserInfo storage user = userInfo[fid][msg.sender];
        uint256 amount = user.amount;
        user.amount = 0;
        user.rewardDebt = 0;

        // Note: transfer can fail or succeed if `amount` is zero.
        emit EmergencyWithdraw(msg.sender, fid, amount, receiver);
        lpToken[fid].safeTransfer(receiver, amount);
        
    }

    /// @notice View function to see pending reward on frontend.
    /// @param _fid The index of the Farm. See `farmInfo`.
    /// @param _user Address of user.
    /// @return pendingRewards for a given user.
    function pendingReward(uint256 _fid, address _user)
        external
        view
        returns (uint256 pendingRewards)
    {
        FarmInfo memory farm = farmInfo[_fid];
        UserInfo storage user = userInfo[_fid][_user];
        uint256 accRewardPerShare = farm.accRewardPerShare;
        uint256 lpBalanceOfFarm = lpToken[_fid].balanceOf(address(this));
        if (block.timestamp > farm.lastRewardTime && lpBalanceOfFarm != 0) {
            uint256 time = block.timestamp - farm.lastRewardTime;
            uint256 rewardAmount = ((time * rewardPerSecond) * farm.allocPoint) / totalAllocPoint;
            accRewardPerShare +=
                (rewardAmount * ACC_REWARD_PRECISION) / lpBalanceOfFarm;
        }
        pendingRewards = uint256(
            int256(((user.amount * accRewardPerShare) / ACC_REWARD_PRECISION)) - user.rewardDebt
        );
    }

    

    function updateFarm(uint256 fid) public returns (FarmInfo memory farm) {
        farm = farmInfo[fid];
        if (farm.lastRewardTime < block.timestamp) {
            uint256 lpSupply = lpToken[fid].balanceOf(address(this));
            if (lpSupply > 0) {
                uint256 time = block.timestamp - farm.lastRewardTime;
                uint256 rewardAmount = ((time * rewardPerSecond ) * farm.allocPoint) / totalAllocPoint;
                farm.accRewardPerShare += (rewardAmount * ACC_REWARD_PRECISION) / lpSupply;
            }
            farm.lastRewardTime = block.timestamp;
            farmInfo[fid] = farm;
            emit FarmUpdated(
                fid,
                farm.lastRewardTime,
                lpSupply,
                farm.accRewardPerShare
            );
        }
    }



    function massUpdateFarms(uint256[] calldata fids) public {
        uint256 len = fids.length;
        for (uint256 i = 0; i < len; i++) {
            updateFarm(fids[i]);
        }
    }


    /// @notice Harvest proceeds for transaction sender to `receiver`.
    /// @param fid The index of the pool. See `farmInfo`.
    /// @param receiver Receiver of rewards.
    function harvest(uint256 fid, address receiver) public {
        FarmInfo memory farm = updateFarm(fid);
        UserInfo storage user = userInfo[fid][msg.sender];
        // Effects
        int256 accumulatedReward = int256(
            (user.amount * farm.accRewardPerShare) / ACC_REWARD_PRECISION
        );
        uint256 _pendingReward = uint256(accumulatedReward - user.rewardDebt);
        user.rewardDebt = accumulatedReward;
        emit FarmHarvest(msg.sender, fid, _pendingReward, receiver);
        fund.distributeReward(receiver, _pendingReward);
    }


    function checkFarmDoesntExist(IERC20 _token) public view {
        for (uint256 index = 0; index < farmInfo.length; index++) {
            require(lpToken[index] != _token, "Farm exists already");
        }
    }

    
}
