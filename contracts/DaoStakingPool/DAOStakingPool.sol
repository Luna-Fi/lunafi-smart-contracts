
// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

import "./LFIDistributionManager.sol";
import {IERC20} from '../interfaces/IERC20.sol';
import {SafeERC20} from '../lib/SafeERC20.sol';
import "../lib/ERC20.sol";

contract DaoStakingPool is ERC20,LFIDistributionManager {
  using SafeMath for uint256;
  using SafeERC20 for IERC20;

  IERC20 public immutable STAKED_TOKEN;
  IERC20 public immutable REWARD_TOKEN;
  uint256 public immutable COOLDOWN_SECONDS;
  uint256 public immutable UNSTAKE_WINDOW;
  address public immutable REWARDS_VAULT;
  uint256 rewardPersecond;

  mapping(address => uint256) public stakerRewardsToClaim;
  mapping(address => uint256) public stakersCooldowns;


  event RewardsAccrued(address user, uint256 amount);
  event Staked(address indexed from, address indexed onBehalfOf, uint256 amount);
  event Redeem(address indexed from, address indexed to, uint256 amount);
  event RewardsClaimed(address indexed from, address indexed to, uint256 amount);
  event Cooldown(address indexed user);

  struct AssetInfo {
    uint256 accRewardsPerShare;
    uint256 lastRewardTime;
  }
  struct UserInfo {
    uint256 amount;
    int256 rewardRebt;
  }

  AssetInfo public assetInfo;

  mapping (uint256 => mapping (address => UserInfo)) public userInfo;

  constructor(
    IERC20 stakedToken,
    IERC20 rewardToken,
    uint256 cooldownSeconds,
    uint256 unstakeWindow,
    address rewardsVault,
    address emissionManager,
    uint128 distributionDuration,
    string memory name,
    string memory symbol,
    uint8 decimals,
    address governance
  ) ERC20(name, symbol,decimals) LFIDistributionManager(emissionManager, distributionDuration) {
    STAKED_TOKEN = stakedToken;
    REWARD_TOKEN = rewardToken;
    COOLDOWN_SECONDS = cooldownSeconds;
    UNSTAKE_WINDOW = unstakeWindow;
    REWARDS_VAULT = rewardsVault;
    
  }

  function setRewardsPerSecond(uint256 _rewardPerSecond) external {
    rewardPersecond = _rewardPerSecond;
  }

  function createAssetFarm() external {
    assetInfo = (AssetInfo({
      accRewardsPerShare :0,
      lastRewardTime: block.timestamp
    }));
  }


 

  function stakeLFI(address to, uint256 amount) external {
    require(amount!= 0, "DAOSTAKINGPOOL: INVALID_AMOUNT");
    uint256 balanceOfUser = balanceOf(to);

    uint256 accruedRewards = 
      LFIDistributionManager._updateUserAssetInternal(to,address(this),balanceOfUser,totalSupply());
      if(accruedRewards != 0) {
        emit RewardsAccrued(to, accruedRewards);
      }
      stakerRewardsToClaim[to] = stakerRewardsToClaim[to].add(accruedRewards);
      stakersCooldowns[to] = getNextCooldownTimestamp(0,amount,to,balanceOfUser);

      _mint(to,amount/10**3); // Mints VLFI
      IERC20(STAKED_TOKEN).safeTransferFrom(msg.sender, address(this), amount);
      
      emit Staked(msg.sender,to,amount);
  }

  

  function redeemLFI(address to, uint256 amount) external {
    require(amount != 0, "DAOSTAKINGPOOL: INVALID_AMOUNT");
    uint256 cooldownStartTimestamp = stakersCooldowns[msg.sender];
    // Now must be greater than the cooldown time 
    require(
      block.timestamp > cooldownStartTimestamp.add(COOLDOWN_SECONDS),"DAOSTAKINGPOOL: INSUFFICIENT_COOLDOWN"
    ); 
    // Now - previous now <= UNSTAKEWINDOW
    require(
      block.timestamp.sub(cooldownStartTimestamp.add(COOLDOWN_SECONDS)) <= UNSTAKE_WINDOW,
      "DAOSTAKINGPOOL: UNSTAKE_WINDOW_FINISHED"
    );

    uint256 balanceOfMessageSender = balanceOf(msg.sender);
    uint256 amountToRedeem = (amount > balanceOfMessageSender) ? balanceOfMessageSender : amount;
    _updateCurrentUnclaimedRewards(msg.sender, balanceOfMessageSender, true);
    _burn(msg.sender, amountToRedeem/10**3);
    if (balanceOfMessageSender.sub(amountToRedeem) == 0) {
      stakersCooldowns[msg.sender] = 0;
    }
    IERC20(STAKED_TOKEN).safeTransfer(to, amountToRedeem);
    emit Redeem(msg.sender, to, amountToRedeem);

  }

  function cooldown() external {
    require(balanceOf(msg.sender) != 0, "DAOSTAKINGPOOL: INVALID_BALANCE_ON_COOLDOWN");
    //solium-disable-next-line
    stakersCooldowns[msg.sender] = block.timestamp;
    emit Cooldown(msg.sender);
  }

  function getNextCooldownTimestamp(
    uint256 userCooldownTimestamp,
    uint256 amountToReceive,
    address toAddress,
    uint256 toBalance
  ) public view returns (uint256) {
    uint256 toCooldownTimestamp = stakersCooldowns[toAddress];
    if (toCooldownTimestamp == 0) {
      return 0;
    }

    uint256 minimalValidCooldownTimestamp =
      block.timestamp.sub(COOLDOWN_SECONDS).sub(UNSTAKE_WINDOW);

    if (minimalValidCooldownTimestamp > toCooldownTimestamp) {
      toCooldownTimestamp = 0;
    } else {
      uint256 fromCooldownTimestamp =
        (minimalValidCooldownTimestamp > userCooldownTimestamp)
          ? block.timestamp
          : userCooldownTimestamp;

      if (fromCooldownTimestamp < toCooldownTimestamp) {
        return toCooldownTimestamp;
      } else {
        toCooldownTimestamp = (
          amountToReceive.mul(fromCooldownTimestamp).add(toBalance.mul(toCooldownTimestamp))
        )
          .div(amountToReceive.add(toBalance));
      }
    }
    return toCooldownTimestamp;
  }

function getTotalRewardsBalance(address staker) external view returns (uint256) {
    DistributionTypes.UserStakeInput[] memory userStakeInputs =
      new DistributionTypes.UserStakeInput[](1);
    userStakeInputs[0] = DistributionTypes.UserStakeInput({
      underlyingAsset: address(this),
      stakedByUser: balanceOf(staker),
      totalStaked: totalSupply()
    });
    return stakerRewardsToClaim[staker].add(_getUnclaimedRewards(staker, userStakeInputs));
  }

  function _updateCurrentUnclaimedRewards(
    address user,
    uint256 userBalance,
    bool updateStorage
  ) internal returns (uint256) {
    uint256 accruedRewards =
      _updateUserAssetInternal(user, address(this), userBalance, totalSupply());
    uint256 unclaimedRewards = stakerRewardsToClaim[user].add(accruedRewards);

    if (accruedRewards != 0) {
      if (updateStorage) {
        stakerRewardsToClaim[user] = unclaimedRewards;
      }
      emit RewardsAccrued(user, accruedRewards);
    }

    return unclaimedRewards;
  }

  function claimRewards(address to, uint256 amount) external {
    uint256 newTotalRewards =
      _updateCurrentUnclaimedRewards(msg.sender, balanceOf(msg.sender), false);
    uint256 amountToClaim = (amount == type(uint256).max) ? newTotalRewards : amount;

    stakerRewardsToClaim[msg.sender] = newTotalRewards.sub(amountToClaim, 'INVALID_AMOUNT');

    REWARD_TOKEN.safeTransferFrom(REWARDS_VAULT, to, amountToClaim);

    emit RewardsClaimed(msg.sender, to, amountToClaim);
  }

}
  