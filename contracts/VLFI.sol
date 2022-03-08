// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";

contract VLFI is ERC20, ERC20Permit, AccessControl {
    using SafeERC20 for IERC20;

    struct FarmInfo {
        uint256 accRewardsPerShare;
        uint256 lastRewardTime;
    }

    struct UserInfo {
        uint256 amount;
        int256 rewardDebt;
    }

    FarmInfo farmInfo;
    uint256 private rewardPerSecond;
    uint256 constant MAX_PRECISION = 18;
    uint256 liquidity;
    uint256 lpTokenPrice = 1000 * 10**MAX_PRECISION;
    IERC20 public immutable STAKED_TOKEN;
    uint256 COOLDOWN_SECONDS;
    uint256 UNSTAKE_WINDOW;
    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");
    uint256 public maxTreasuryWithdrawalPercentage;
    mapping(address => uint256) private stakerRewardsToClaim;
    mapping(address => uint256) private cooldownStartTimes;
    mapping(address => uint256) private userDeposits;
    mapping(address => UserInfo) private userInfo;

    // Arrange the variables
    uint256 private constant ACC_REWARD_PRECISION = 1e18;

    event Staked(
        address indexed from,
        address indexed onBehalfOf,
        uint256 amount
    );
    event UnStaked(address indexed from, address indexed to, uint256 amount);
    event CooldownActivated(address indexed user);
    event RewardsClaimed(
        address indexed from,
        address indexed to,
        uint256 amount
    );

    // RewardsAccumulated

    // Natspec comments.

    // Governance should be added.

    // votes and upgradeable hardhat.

    constructor(
        string memory name,
        string memory symbol,
        IERC20 stakedToken,
        uint256 cooldownSeconds,
        uint256 unstakeWindow,
        uint256 rewardsPerSecond,
        uint256 treasuryWithdrawlPercentage
    ) ERC20(name, symbol) ERC20Permit(name) {
        STAKED_TOKEN = stakedToken;
        COOLDOWN_SECONDS = cooldownSeconds;
        UNSTAKE_WINDOW = unstakeWindow;
        maxTreasuryWithdrawalPercentage = treasuryWithdrawlPercentage;
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MANAGER_ROLE, msg.sender);
        setRewardPerSecond(rewardsPerSecond);
        createFarm();
    }

    function getCooldown(address staker) external view returns (uint256) {
        return cooldownStartTimes[staker];
    }

    function getUserLFIDeposits(address user) external view returns (uint256) {
        return userDeposits[user];
    }

    function getUserVLFIAmount(address benefitor)
        external
        view
        returns (uint256)
    {
        return userInfo[benefitor].amount;
    }

    function getUserRewardDebt(address benefitor)
        external
        view
        returns (int256)
    {
        return userInfo[benefitor].rewardDebt;
    }

    function getAccRewardPerShare() external view returns (uint256) {
        return farmInfo.accRewardsPerShare;
    }

    function getLastRewardTime() external view returns (uint256) {
        return farmInfo.lastRewardTime;
    }

    function getRewardPerSecond() external view returns(uint256) {
        return rewardPerSecond;
    }

    function getCooldownSeconds() external view returns (uint256) {
        return COOLDOWN_SECONDS;
    }

    function getLiquidityStatus() external view returns (uint256) {
        return liquidity;
    }

    function setCooldownSeconds(uint256 coolDownSeconds)
        external
        onlyRole(MANAGER_ROLE)
    {
        COOLDOWN_SECONDS = coolDownSeconds;
    }

    function setUnstakeWindowTime(uint256 unstakeWindow)
        external
        onlyRole(MANAGER_ROLE)
    {
        UNSTAKE_WINDOW = unstakeWindow;
    }

    function getUnstakeWindowTime() external view returns (uint256) {
        return UNSTAKE_WINDOW;
    }

    function transferToTreasury(address to, uint256 treasuryWithdrawl)
        external
        onlyRole(MANAGER_ROLE)
    {
        uint256 maxWithdrawalLiquidity = (liquidity *
            maxTreasuryWithdrawalPercentage) / 100;
        require(treasuryWithdrawl <= maxWithdrawalLiquidity);
        IERC20(STAKED_TOKEN).safeTransfer(to, treasuryWithdrawl);
    }

    function setMaxTreasuryWithdrawalPercentage(uint256 percentage)
        external
        onlyRole(MANAGER_ROLE)
    {
        maxTreasuryWithdrawalPercentage = percentage;
    }

    function updateFarm() public returns (FarmInfo memory farm) {
        farm = farmInfo;
        if (farm.lastRewardTime < block.timestamp) {
            uint256 totalSupply = totalSupply();
            if (totalSupply > 0) {
                uint256 time = block.timestamp - farm.lastRewardTime;
                uint256 rewardAmount = time * rewardPerSecond;
                farm.accRewardsPerShare +=
                    (rewardAmount * ACC_REWARD_PRECISION) /
                    totalSupply;
            }
            farm.lastRewardTime = block.timestamp;
            farmInfo = farm;
        }
    }

    function getRewards(address benefitor)
        public
        view
        returns (uint256 pendingRewards)
    {
        FarmInfo memory farm = farmInfo;
        UserInfo storage user = userInfo[benefitor];
        uint256 accRewardPerShare = farm.accRewardsPerShare;
        uint256 totalSupply = totalSupply();
        if (block.timestamp > farm.lastRewardTime && totalSupply != 0) {
            uint256 time = block.timestamp - farm.lastRewardTime;
            uint256 rewardAmount = time * rewardPerSecond;
            accRewardPerShare +=
                (rewardAmount * ACC_REWARD_PRECISION) /
                totalSupply;
        }
        pendingRewards = uint256(
            int256((user.amount * accRewardPerShare) / ACC_REWARD_PRECISION) -
                user.rewardDebt
        );
    }

    function setRewardPerSecond(uint256 _rewardPerSecond)
        public
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        rewardPerSecond = _rewardPerSecond;
    }

    function createFarm() public onlyRole(MANAGER_ROLE) {
        farmInfo = FarmInfo({
            accRewardsPerShare: 0,
            lastRewardTime: block.timestamp
        });
    }

    function permitAndStake(
        address owner,
        address spender,
        uint256 value,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s,
        address onBehalfOf,
        uint256 LFIamount
    ) external {
        permit(owner, spender, value, deadline, v, r, s);
        this.stake(onBehalfOf, LFIamount);
    }

    function stake(address onBehalfOf, uint256 amount) external {
        require(amount != 0, "VLFI:INVALID_AMOUNT");
        uint256 balanceOfUser = balanceOf(onBehalfOf);
        FarmInfo memory farm = updateFarm();
        UserInfo storage user = userInfo[msg.sender];
        user.amount += ((amount * 10**18) / lpTokenPrice);
        user.rewardDebt += int256(
            (((amount * 10**18) / lpTokenPrice) * farm.accRewardsPerShare) /
                ACC_REWARD_PRECISION
        );
        userDeposits[msg.sender] += amount;
        liquidity += amount;
        cooldownStartTimes[onBehalfOf] = getNextCooldownTimestamp(
            0,
            amount,
            onBehalfOf,
            balanceOfUser
        );
        _mint(onBehalfOf, (amount * 10**18) / lpTokenPrice);
        IERC20(STAKED_TOKEN).safeTransferFrom(
            msg.sender,
            address(this),
            amount
        );
        emit Staked(msg.sender, onBehalfOf, amount);
    }

    function updateRewardsToClaim() external {
        uint256 rewards;
        stakerRewardsToClaim[msg.sender] = rewards;
    }

    function unStake(address to, uint256 amount) external {
        require(
            amount != 0 && amount <= STAKED_TOKEN.balanceOf(msg.sender),
            "VLFI:INVALID_AMOUNT"
        );
        uint256 cooldownStartTimestamp = cooldownStartTimes[msg.sender];
        require(
            (block.timestamp) > (cooldownStartTimestamp + (COOLDOWN_SECONDS)),
            "VLFI:COOLDOWN_NOT_COMPLETE"
        );
        require(
            block.timestamp - (cooldownStartTimestamp + (COOLDOWN_SECONDS)) <=
                UNSTAKE_WINDOW,
            "VLFI:UNSTAKE_WINDOW_FINISHED"
        );
        uint256 balanceOfMessageSender = balanceOf(msg.sender);
        FarmInfo memory farm = updateFarm();
        UserInfo storage user = userInfo[msg.sender];
        user.rewardDebt -= int256(
            (((amount * 10**18) / lpTokenPrice) * farm.accRewardsPerShare) /
                ACC_REWARD_PRECISION
        );
        user.amount -= (amount * 10**18) / lpTokenPrice;
        userDeposits[msg.sender] -= amount;
        liquidity -= amount;
        _burn(msg.sender, (amount * 10**18) / lpTokenPrice); // VLFI
        if (balanceOfMessageSender - ((amount * 10**18) / lpTokenPrice) == 0) {
            cooldownStartTimes[msg.sender] = 0;
        }
        IERC20(STAKED_TOKEN).safeTransfer(to, amount); // LFI transfer to user

        emit UnStaked(msg.sender, msg.sender, amount);
    }

    function activateCooldown() external {
        require(balanceOf(msg.sender) != 0, "VLFI:INVALID_BALANCE_ON_COOLDOWN");
        //solium-disable-next-line
        cooldownStartTimes[msg.sender] = block.timestamp;
        emit CooldownActivated(msg.sender);
    }

    /**
     * @dev Internal ERC20 _transfer of the tokenized staked tokens
     * @param from Address to transfer from
     * @param to Address to transfer to
     * @param amount Amount to transfer
     **/
    function _transfer(
        address from,
        address to,
        uint256 amount
    ) internal override {
        uint256 balanceOfFrom = balanceOf(from);
        FarmInfo memory farm = updateFarm();
        // Sender
        UserInfo storage sender = userInfo[from];
        sender.rewardDebt -= int256(
            (amount * farm.accRewardsPerShare) / ACC_REWARD_PRECISION
        );
        sender.amount -= amount;

        // Recipient
        if (from != to) {
            uint256 balanceOfTo = balanceOf(to);
            UserInfo storage receiver = userInfo[to];
            receiver.rewardDebt += int256(
                (amount * farm.accRewardsPerShare) / ACC_REWARD_PRECISION
            );
            receiver.amount += amount;

            uint256 previousSenderCooldown = cooldownStartTimes[from];
            cooldownStartTimes[to] = getNextCooldownTimestamp(
                previousSenderCooldown,
                amount,
                to,
                balanceOfTo
            );
            // if cooldown was set and whole balance of sender was transferred - clear cooldown
            if (balanceOfFrom == amount && previousSenderCooldown != 0) {
                cooldownStartTimes[from] = 0;
            }
        }
        super._transfer(from, to, amount);
    }

    function claimRewards(address to) external {
        FarmInfo memory farm = updateFarm();
        UserInfo storage user = userInfo[msg.sender];
        int256 accumulatedReward = int256(
            (user.amount * farm.accRewardsPerShare) / ACC_REWARD_PRECISION
        );
        uint256 _pendingReward = uint256(accumulatedReward - user.rewardDebt);
        user.rewardDebt = accumulatedReward;
        IERC20(STAKED_TOKEN).safeTransfer(to, _pendingReward);
        emit RewardsClaimed(msg.sender, to, _pendingReward);
    }

    function getNextCooldownTimestamp(
        uint256 userCooldownTimestamp,
        uint256 amountToReceive,
        address toAddress,
        uint256 toBalance
    ) public view returns (uint256) {
        uint256 toCooldownTimestamp = cooldownStartTimes[toAddress];
        if (toCooldownTimestamp == 0) {
            return 0;
        }

        uint256 minimalValidCooldownTimestamp = ((block.timestamp -
            COOLDOWN_SECONDS) - (UNSTAKE_WINDOW));

        if (minimalValidCooldownTimestamp > toCooldownTimestamp) {
            toCooldownTimestamp = 0;
        } else {
            uint256 fromCooldownTimestamp = (minimalValidCooldownTimestamp >
                userCooldownTimestamp)
                ? block.timestamp
                : userCooldownTimestamp;

            if (fromCooldownTimestamp < toCooldownTimestamp) {
                return toCooldownTimestamp;
            } else {
                toCooldownTimestamp =
                    (amountToReceive *
                        (fromCooldownTimestamp) +
                        (toBalance * (toCooldownTimestamp))) /
                    (amountToReceive + (toBalance));
            }
        }
        return toCooldownTimestamp;
    }
}
