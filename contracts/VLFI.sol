// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "hardhat/console.sol";

contract VLFI is ERC20 {

    using SafeERC20 for IERC20;

    struct FarmInfo {
       uint256 accRewardsPerShare;
       uint256 lastRewardTime ;
    }

    struct UserInfo{
        uint256 amount;
        int256 rewardDebt;
    }

    FarmInfo public farmInfo;
    uint256 public rewardPerSecond;
    mapping (address => UserInfo) public userInfo;
    

    uint256 constant MAX_PRECISION = 18;
    uint256 conversionPrice = 1000*10**MAX_PRECISION; 
    IERC20 public immutable STAKED_TOKEN;
    uint256 public immutable COOLDOWN_SECONDS;
    uint256 public immutable UNSTAKE_WINDOW;
    mapping(address => uint256) public stakerRewardsToClaim;
    mapping(address => uint256) public stakersCooldowns;
    mapping(address => uint256) public userLFIDeposits;
    uint256 private constant ACC_REWARD_PRECISION = 1e18;

    event Deposited(address indexed from, address indexed onBehalfOf, uint256 amount);
    event Redeemed(address indexed from, address indexed to, uint256 amount);

    constructor(
        string memory name,
        string memory symbol,
        IERC20 stakedToken,
        uint256 cooldownSeconds,
        uint256 unstakeWindow
    ) ERC20(name,symbol){
        STAKED_TOKEN = stakedToken;
        COOLDOWN_SECONDS = cooldownSeconds;
        UNSTAKE_WINDOW = unstakeWindow;
    }

    function updateFarm() public returns(FarmInfo memory farm) {
        farm = farmInfo;
        if(farm.lastRewardTime < block.timestamp) {
            uint256 totalSupply = totalSupply();
            if(totalSupply > 0) {
                uint256 time = block.timestamp - farm.lastRewardTime;
                uint256 rewardAmount = time * rewardPerSecond;
                farm.accRewardsPerShare += rewardAmount * ACC_REWARD_PRECISION/totalSupply;
            }
            farm.lastRewardTime = block.timestamp;
            farmInfo = farm;
        }
    }

    function pendingReward() public view returns(uint256 pendingRewards) {
      FarmInfo memory farm = farmInfo;
      UserInfo storage user = userInfo[msg.sender];
      uint256 accRewardPerShare = farm.accRewardsPerShare;
      uint256 totalSupply = totalSupply();
      if(block.timestamp > farm.lastRewardTime && totalSupply != 0) {
        uint256 time = block.timestamp - farm.lastRewardTime;
        uint256 rewardAmount = time * rewardPerSecond;
        accRewardPerShare += (rewardAmount * ACC_REWARD_PRECISION) / totalSupply;
      }
      pendingRewards = uint256(int256(user.amount * accRewardPerShare / ACC_REWARD_PRECISION) - user.rewardDebt);
    }

    function setRewardPerSecond(uint256 _rewardPerSecond) public  {
        rewardPerSecond = _rewardPerSecond;
    }

    function createFarm() external {
        farmInfo = FarmInfo({
            accRewardsPerShare: 0,
            lastRewardTime: block.timestamp
        });
    }

    function depositLFI(uint256 amount) external { //LFI
        require(amount != 0,"VLFI:INVALID_AMOUNT");
        uint256 balanceOfUser = balanceOf(msg.sender); 
        FarmInfo memory farm = updateFarm();
        UserInfo storage user = userInfo[msg.sender];
        user.amount += (amount/conversionPrice) * 10**18;
        user.rewardDebt += int( (amount/conversionPrice)* 10**18 * farm.accRewardsPerShare / ACC_REWARD_PRECISION);
        stakersCooldowns[msg.sender] = getNextCooldownTimestamp(0, amount, msg.sender, balanceOfUser);
        _mint(msg.sender,(amount/conversionPrice)* 10**18); // When it's minting in the stakedVLI check whether before transfer happens
        IERC20(STAKED_TOKEN).safeTransferFrom(msg.sender, address(this), amount);
        emit Deposited(msg.sender, msg.sender, amount);
    }

    function updateRewardsToClaim() external {
      uint256 rewards;
      stakerRewardsToClaim[msg.sender] = rewards;
      
    }

    function redeemLFI(uint256 amount) external {
        require(amount != 0,"VLFI:INVALID_AMOUNT");
        uint256 cooldownStartTimestamp = stakersCooldowns[msg.sender];
        require(
            (block.timestamp) > (cooldownStartTimestamp + (COOLDOWN_SECONDS)),
            "VLFI:INSUFFICIENT_COOLDOWN"
        );
        require(
            block.timestamp - (cooldownStartTimestamp + (COOLDOWN_SECONDS)) <= UNSTAKE_WINDOW,
            "VLFI:UNSTAKE_WINDOW_FINISHED"
    );
        uint256 balanceOfMessageSender = balanceOf(msg.sender);
        uint256 amountToRedeem = (amount > balanceOfMessageSender) ? balanceOfMessageSender : amount;
        FarmInfo memory farm = updateFarm();
        UserInfo storage user = userInfo[msg.sender];
        user.rewardDebt -= int((amountToRedeem/conversionPrice)*10**18 * farm.accRewardsPerShare / ACC_REWARD_PRECISION);
        user.amount -= amountToRedeem/conversionPrice *10 **18;
        _burn(msg.sender, (amountToRedeem/conversionPrice)*10**18);
        if (balanceOfMessageSender - (amountToRedeem) == 0) {
             stakersCooldowns[msg.sender] = 0;
        }
        IERC20(STAKED_TOKEN).safeTransfer(msg.sender, amountToRedeem);
        emit Redeemed(msg.sender,msg.sender,amountToRedeem);
    }

    function cooldown() external {
        require(balanceOf(msg.sender) != 0, "VLFI:INVALID_BALANCE_ON_COOLDOWN");
        //solium-disable-next-line
        stakersCooldowns[msg.sender] = block.timestamp;

    }

    function transfer(address to, uint256 amount) public override returns(bool) {
        uint256 senderBalance = balanceOf(msg.sender);
        uint256 senderPendingRewards = pendingReward();
        stakerRewardsToClaim[msg.sender]= stakerRewardsToClaim[msg.sender] + (senderPendingRewards);

        if(msg.sender != to) {
          uint256 receiverBalance = balanceOf(to);
          uint256 receiverPendingRewards = pendingReward();
          stakerRewardsToClaim[to] = stakerRewardsToClaim[to] + (receiverPendingRewards);
          uint256 previousSenderCooldown = stakersCooldowns[msg.sender];
          stakersCooldowns[to] = getNextCooldownTimestamp(
            previousSenderCooldown,
            amount,
            to,
            receiverBalance
          );

          // If cooldown was set and whole balance of sender was trnasferred - clear cooldown

          if(senderBalance == amount && previousSenderCooldown != 0) {
            stakersCooldowns[msg.sender] = 0;
          }
        }
        
       _transfer(msg.sender,to,amount);
       return true;
    }

    function claimRewards() external {
        FarmInfo memory farm = updateFarm();
        UserInfo storage user = userInfo[msg.sender];
        int accumulatedReward = int(user.amount * farm.accRewardsPerShare / ACC_REWARD_PRECISION);
        uint _pendingReward = uint(accumulatedReward - user.rewardDebt);
        user.rewardDebt = accumulatedReward; //check for the reward debt again.
        IERC20(STAKED_TOKEN).transfer(msg.sender, _pendingReward);
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
      ((block.timestamp - COOLDOWN_SECONDS) - (UNSTAKE_WINDOW));

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
          amountToReceive * (fromCooldownTimestamp) + (toBalance * (toCooldownTimestamp))
        ) / (amountToReceive + (toBalance));
      }
    }
    return toCooldownTimestamp;
  }

}