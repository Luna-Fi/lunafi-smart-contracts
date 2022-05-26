// SPDX-License-Identifier:  MIT
pragma solidity 0.8.10;

import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "contracts/interfaces/IFundDistributor.sol";

///@title LunaFi Farm Contract
///@author LunaFi DevTeam
///@notice Farm Contract to yield Rewards in LFI
contract LFiFarms is AccessControlUpgradeable {
    using SafeERC20Upgradeable for IERC20Upgradeable;

    // DO NOT CHANGE THE NAME, TYPE OR ORDER OF EXISITING VARIABLES BELOW

    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");
    uint256 private constant ACC_REWARD_PRECISION = 1e18;
    IERC20Upgradeable public reward;
    IFundDistributor public fund;
    uint256 public rewardPerSecond;
    /// @dev Total allocation points. Must be the sum of all allocation points in all pools.
    uint256 public totalAllocPoint;

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

    FarmInfo[] farmInfo;
    IERC20Upgradeable[] public lpToken;
    // Info of each user that stakes LP tokens.
    mapping(uint256 => mapping(address => UserInfo)) userInfo;

    // DO NOT CHANGE THE NAME, TYPE OR ORDER OF EXISITING VARIABLES ABOVE

    event RewardPerSecondUpdated(uint256 newRewardPerSecond);
    event FarmCreated(
        uint256 indexed fid,
        uint256 allocatedPoints,
        IERC20Upgradeable indexed lpToken
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

    /// @dev Intialize function to consturct the LFI Farm contract
    /// @param admin Address of the manager who can do admin activities on the contract
    /// @param rewardToken Address of the LFI Token contract address
    /// @param fundContract Fund contract address to set at the deployment
    function initialize(
        address admin,
        IERC20Upgradeable rewardToken,
        IFundDistributor fundContract
    ) external initializer {
        reward = rewardToken;
        fund = fundContract;
        totalAllocPoint = 0;
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MANAGER_ROLE, admin);
    }

    /// @notice Returns the amount of the user
    /// @return amount of the user
    function getUserAmount(address user, uint256 farmID)
        external
        view
        returns (uint256)
    {
        return userInfo[farmID][user].amount;
    }

    /// @notice Returns the rewardDebt of the user
    /// @return amount of the user
    function getUserRewardDebt(address user, uint256 farmID)
        external
        view
        returns (int256)
    {
        return userInfo[farmID][user].rewardDebt;
    }

    /// @notice Returns the number LFIFarms
    /// @return farms - the total number of farms created
    function farmLength() external view returns (uint256 farms) {
        return farmInfo.length;
    }

    /// @notice Function to set the Fund Distributor Contract
    /// @dev Set the Fund distributor contract , to distribute rewards, and Only Manager can call the contract
    /// @param fundContract Fund Distributor Contract address
    function setFund(IFundDistributor fundContract)
        external
        onlyRole(MANAGER_ROLE)
    {
        fund = fundContract;
        emit FarmFundChanged(address(fundContract));
    }

    /// @notice Function to create a Farm. Only can be called by the Manager of the contract
    /// @param allocPoint The number of allocation points assiged to the farm. Total allocatio points of all farms should be 100.
    /// @param poolToken The address of the pool token contract.
    function createFarm(uint256 allocPoint, IERC20Upgradeable poolToken)
        external
        onlyRole(MANAGER_ROLE)
    {
        checkFarmDoesntExist(poolToken);

        totalAllocPoint += allocPoint;
        farmInfo.push(
            FarmInfo({
                accRewardPerShare: 0,
                lastRewardTime: block.timestamp,
                allocPoint: allocPoint
            })
        );
        lpToken.push(poolToken);
        emit FarmCreated(lpToken.length - 1, allocPoint, poolToken);
    }

    /// @notice Function to set the number of rewards to issue per second. Only can be called by Manager of the contract
    /// @param rewardPerEverySecond The amount of rewards to be issued per second
    /// @param fids An array of farmIDs. Eg. if we have two farms provide [0,1]
    function setRewardPerSecond(
        uint256 rewardPerEverySecond,
        uint256[] calldata fids
    ) external onlyRole(MANAGER_ROLE) {
        massUpdateFarms(fids);
        rewardPerSecond = rewardPerEverySecond;
        emit RewardPerSecondUpdated(rewardPerEverySecond);
    }

    /// @notice Function to set reset Farm attributes
    /// @param fid - The Farm ID, to which we are trying to set the attributes
    /// @param allocPoint - Allocpoints to set for the farm
    function setFarm(
        uint256 fid,
        uint256 allocPoint,
        bool overwrite
    ) external onlyRole(MANAGER_ROLE) {
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

    /// @notice Function to withdraw the pool Tokens
    /// @param fid - The Farm ID from which to withdraw the pool tokens
    /// @param LPTokenAmount - Amount to withdraw
    /// @param receiver - Receiver address to transfer the LpTokens
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

    /// @notice Function to harvest rewards from all the farms
    /// @param receiver Address of the receiver
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
            uint256 rewardAmount = ((time * rewardPerSecond) *
                farm.allocPoint) / totalAllocPoint;
            accRewardPerShare +=
                (rewardAmount * ACC_REWARD_PRECISION) /
                lpBalanceOfFarm;
        }
        pendingRewards = uint256(
            int256(((user.amount * accRewardPerShare) / ACC_REWARD_PRECISION)) -
                user.rewardDebt
        );
    }

    /// @notice Function to update the Farm information with latest state
    /// @param fid - The farm ID on which the update should happen
    function updateFarm(uint256 fid) public returns (FarmInfo memory farm) {
        farm = farmInfo[fid];
        if (farm.lastRewardTime < block.timestamp) {
            uint256 lpSupply = lpToken[fid].balanceOf(address(this));
            if (lpSupply > 0) {
                uint256 time = block.timestamp - farm.lastRewardTime;
                uint256 rewardAmount = ((time * rewardPerSecond) *
                    farm.allocPoint) / totalAllocPoint;
                farm.accRewardPerShare +=
                    (rewardAmount * ACC_REWARD_PRECISION) /
                    lpSupply;
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

    /// @notice Function to update all the farms at once
    /// @param fids An array of farmsIDs
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

    /// @notice Function to check if a farm exists for a particular LPToken
    /// @param _token The address of the Pool token contract.
    function checkFarmDoesntExist(IERC20Upgradeable _token) public view {
        for (uint256 index = 0; index < farmInfo.length; index++) {
            require(lpToken[index] != _token, "Farm exists already");
        }
    }

    /// @notice Function to return farmInfo for a Farm ID
    /// @param farmId The farm ID of the returned farm
    function getFarmInfo(uint256 farmId) public view returns (FarmInfo memory farm) {
        return farmInfo[farmId];
    }
}
