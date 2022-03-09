// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/draft-ERC20PermitUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20VotesUpgradeable.sol";
import "contracts/interfaces/ILFIToken.sol";

contract VLFI is ERC20Upgradeable, ERC20PermitUpgradeable, AccessControlUpgradeable, ERC20VotesUpgradeable {
    
    uint256 constant MAX_PRECISION = 18;
    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");
    uint256 private constant ACC_REWARD_PRECISION = 1e18;
    ILFIToken public  STAKED_TOKEN;
    uint256 liquidity;
    uint256 lpTokenPrice;
    uint256 COOLDOWN_SECONDS;
    uint256 UNSTAKE_WINDOW;
    uint256 private rewardPerSecond;
    uint256 public maxTreasuryWithdrawalPercentage;

    struct FarmInfo {
        uint256 accRewardsPerShare;
        uint256 lastRewardTime;
    }

    struct UserInfo {
        uint256 amount;
        int256 rewardDebt;
    }

    FarmInfo farmInfo;
    
    mapping(address => uint256) private cooldownStartTimes;
    mapping(address => uint256) private userDeposits;
    mapping(address => UserInfo) private userInfo;
    
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

    /// @notice initialize function called by Openzeppelin Hardhat upgradeable plugin
    function initialize (
        string memory name,
        string memory symbol,
        ILFIToken stakedToken,
        uint256 cooldownSeconds,
        uint256 unstakeWindow,
        uint256 rewardsPerSecond,
        uint256 treasuryWithdrawlPercentage,
        uint256 pooltokenPrice
    ) external  initializer {
        __ERC20_init(name,symbol);
        __ERC20Permit_init(name);
        STAKED_TOKEN = stakedToken;
        COOLDOWN_SECONDS = cooldownSeconds;
        UNSTAKE_WINDOW = unstakeWindow;
        lpTokenPrice = pooltokenPrice;
        maxTreasuryWithdrawalPercentage = treasuryWithdrawlPercentage;
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MANAGER_ROLE, msg.sender);
        setRewardPerSecond(rewardsPerSecond);
        createFarm();
    }

    /// @notice Function to the cooldown seconds for the staker at any given time
    /// @param staker -Address of the staker
    /// @return returns the cooldown timestamp
    function getCooldown(address staker) external view returns (uint256) {
        return cooldownStartTimes[staker];
    }

    /// @notice Function to get user LFI deposits
    /// @param user address of the desired user
    /// @return returns the total LFI deposits of the user
    function getUserLFIDeposits(address user) external view returns (uint256) {
        return userDeposits[user];
    }

    /// @notice Function to get USer's VLFI Balance
    /// @param benefitor address of the desired user
    /// @return returns the VLFI amount depsoited 
    function getUserVLFIAmount(address benefitor)
        external
        view
        returns (uint256)
    {
        return userInfo[benefitor].amount;
    }

    /// @notice Function to return user's rewardDebt
    /// @param benefitor address of the desired user
    function getUserRewardDebt(address benefitor)
        external
        view
        returns (int256)
    {
        return userInfo[benefitor].rewardDebt;
    }

    /// @notice Function to return Accumulated RewardPerShare
    /// @return returns farm's accRewardsPer Share
    function getAccRewardPerShare() external view returns (uint256) {
        return farmInfo.accRewardsPerShare;
    }
    
    /// @notice Function to return Last RewardTime
    /// @return returns farm's lastRewardTime 
    function getLastRewardTime() external view returns (uint256) {
        return farmInfo.lastRewardTime;
    }

    /// @notice Function to get rewards per second
    /// @return returns the amount of rewardsPerSecond
    function getRewardPerSecond() external view returns(uint256) {
        return rewardPerSecond;
    }

    /// @notice Function to get Cool down Seconds
    /// @return Returns the cooldown seconds value
    function getCooldownSeconds() external view returns (uint256) {
        return COOLDOWN_SECONDS;
    }

    /// @notice Function to get current Liquidity status
    /// @return Returns current liquidity status 
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
            maxTreasuryWithdrawalPercentage) / 10000;
        require(treasuryWithdrawl <= maxWithdrawalLiquidity);
        ILFIToken(STAKED_TOKEN).transfer(to, treasuryWithdrawl);
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
            uint256 supply = totalSupply();
            if (supply > 0) {
                uint256 time = block.timestamp - farm.lastRewardTime;
                uint256 rewardAmount = time * rewardPerSecond;
                farm.accRewardsPerShare +=
                    (rewardAmount * ACC_REWARD_PRECISION) /
                    supply;
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
        uint256 supply = totalSupply();
        if (block.timestamp > farm.lastRewardTime && supply != 0) {
            uint256 time = block.timestamp - farm.lastRewardTime;
            uint256 rewardAmount = time * rewardPerSecond;
            accRewardPerShare +=
                (rewardAmount * ACC_REWARD_PRECISION) /
                supply;
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
        ILFIToken(STAKED_TOKEN).permit(owner, spender, value, deadline, v, r, s); // Change required here
        this.stake(onBehalfOf, LFIamount);
    }

    function stake(address onBehalfOf, uint256 amount) external {
        require(amount != 0, "VLFI:INVALID_AMOUNT");
        uint256 balanceOfUser = balanceOf(onBehalfOf);
        FarmInfo memory farm = updateFarm();
        UserInfo storage user = userInfo[msg.sender];
        user.amount += ((amount * 10**18) / lpTokenPrice);
        user.rewardDebt += int256(
            ( (((amount * 10**18) * farm.accRewardsPerShare) / lpTokenPrice)) /
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
        emit Staked(msg.sender, onBehalfOf, amount);
        ILFIToken(STAKED_TOKEN).transferFrom(
            msg.sender,
            address(this),
            amount
        );
        
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
            ( (((amount * 10**18) * farm.accRewardsPerShare) / lpTokenPrice)) /
                ACC_REWARD_PRECISION
        );
        user.amount -= (amount * 10**18) / lpTokenPrice;
        userDeposits[msg.sender] -= amount;
        liquidity -= amount;
        _burn(msg.sender, (amount * 10**18) / lpTokenPrice);
        if (balanceOfMessageSender - ((amount * 10**18) / lpTokenPrice) == 0) {
            cooldownStartTimes[msg.sender] = 0;
        }
        emit UnStaked(msg.sender, msg.sender, amount);
        ILFIToken(STAKED_TOKEN).transfer(to, amount); 
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
        emit RewardsClaimed(msg.sender, to, _pendingReward);
        ILFIToken(STAKED_TOKEN).transfer(to, _pendingReward);
        
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

    function _afterTokenTransfer(address from, address to, uint256 amount)
        internal
        override(ERC20Upgradeable, ERC20VotesUpgradeable)
    {
        super._afterTokenTransfer(from, to, amount);
    }

    function _mint(address to, uint256 amount)
        internal
        override(ERC20Upgradeable, ERC20VotesUpgradeable)
    {
        super._mint(to, amount);
    }

    function _burn(address account, uint256 amount)
        internal
        override(ERC20Upgradeable, ERC20VotesUpgradeable)
    {
        super._burn(account, amount);
    }

}
