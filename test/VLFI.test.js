const { expect } = require("chai");
const { BigNumber} = require("ethers");
const { ethers } = require("hardhat");

const returnBigNumber = (number) => {
    number = number.toString(16)
    return BigNumber.from("0x" + number);
}

const sleep = (milliseconds) => {
    const date =  Date.now();
    let currentDate = null;
    do {
        currentDate = Date.now()
    } while (currentDate - date < milliseconds)
}

describe("VLFI TOKEN", () => {

        let LFI;
        let VLFI;
        let lfi;
        let vlfi;

    before(async () => {
        const[owner,user1] = await ethers.getSigners()
        LFI = await ethers.getContractFactory("LFIToken")
        lfi = await LFI.deploy()
        await lfi.deployed()
        console.log("LFI Address :",lfi.address)

        const name = "VLFI"
        const symbol = "VLFI"
        const lfiAddress = lfi.address
        const cooldown = 300
        const unstakeWindow = 60
       
        VLFI = await ethers.getContractFactory("VLFI")
        vlfi = await VLFI.deploy(name,symbol,lfiAddress,cooldown,unstakeWindow)
        await vlfi.deployed()
        console.log("VLFI Address:",vlfi.address)
        const approvalAmount = ethers.utils.formatUnits(returnBigNumber(10000000 * 10 **18),0);
        await lfi.approve(vlfi.address,approvalAmount)
        await lfi.connect(user1).approve(vlfi.address,approvalAmount)
    })

    it("Should allow the owner to deposit 10000 LFI and get a proportionate amount on VLFI", async () => {
        const [owner] = await ethers.getSigners();
        const amount = ethers.utils.formatUnits(returnBigNumber(10000 * 10 **18),0);
        const rewardsPerSecond = ethers.utils.formatUnits(returnBigNumber(7 * 10 **18),0);
        await vlfi.createFarm();
        await vlfi.setRewardPerSecond(rewardsPerSecond)
        await vlfi.stake(owner.address,amount);

        // Farm  details :

        const farmAccRewardsperShare = await vlfi.getFarmAccRewardPerShare();
        const farmLastRewardTime = await vlfi.getFarmLastRewardTime();

        // Owner details :
        const ownerVLFIBalance = await vlfi.balanceOf(owner.address)
        
        const ownerAmount = await vlfi.getUserAmount(owner.address);
        const ownerRewardDebt = await vlfi.getUserRewardDebt(owner.address);
       
        
        // Log Farm Details for first deposit 
        console.log("Acc Reward per Share in the Farm = ", farmAccRewardsperShare.toString())
        console.log("Last Reward Time = ", farmLastRewardTime.toString())

        // Log user Details for first deposit
        console.log("owner VLFI Balance = ", ownerVLFIBalance.toString())
        console.log("Owner Amount = ", ownerAmount.toString())
        console.log("Owner Reward Debt = ", ownerRewardDebt.toString())
    })


    it("Should get the pending rewards  for the user", async () => {
        const [owner] = await ethers.getSigners()

        

        sleep(10000)

        const pendingRewards = await vlfi.pendingReward(owner.address)

        console.log(pendingRewards.toString())

    })

    // it("Should not allow the user to withdraw the VLFI without activating the cooldown period", async () => {
    //     const [owner] = await ethers.getSigners()
    //     const amount = ethers.utils.formatUnits(returnBigNumber(1000 * 10 **18),0);

    //     // Farm Details before withdrawl 
    //     const BfarmDetails= await vlfi.farmInfo()
    //     const BfarmAccRewardsperShare = BfarmDetails.accRewardsPerShare;
    //     const BfarmLastRewardTime = BfarmDetails.lastRewardTime;

    //     console.log("Acc Reward per Share in the Farm = ", BfarmAccRewardsperShare.toString())
    //     console.log("Last Reward Time = ", BfarmLastRewardTime.toString())

    //     //Owner Details before withdrawl
    //     const BownerVLFIBalance = await vlfi.balanceOf(owner.address)
    //     const BownerDetails = await vlfi.userInfo(owner.address);
    //     const BownerAmount = BownerDetails.amount;
    //     const BownerRewardDebt = BownerDetails.rewardDebt;

    //     console.log("owner VLFI Balance = ", BownerVLFIBalance.toString())
    //     console.log("Owner Amount = ", BownerAmount.toString())
    //     console.log("Owner Reward Debt = ", BownerRewardDebt.toString())

        

    //     await vlfi.cooldown()
    //     const Bcooldown = await vlfi.stakersCooldowns(owner.address);
    //     console.log("Before Cooldown",Bcooldown.toString())
    //     sleep(310000)
    //     await vlfi.redeemLFI(amount)

    //     // Farm Details after the withdrawl

    //     const AfarmDetails= await vlfi.farmInfo()
    //     const AfarmAccRewardsperShare = AfarmDetails.accRewardsPerShare;
    //     const AfarmLastRewardTime = AfarmDetails.lastRewardTime;

    //     console.log("Acc Reward per Share in the Farm = ", AfarmAccRewardsperShare.toString())
    //     console.log("Last Reward Time = ", AfarmLastRewardTime.toString())

    //     // Owner details :

    //     const AownerVLFIBalance = await vlfi.balanceOf(owner.address)
    //     const AownerDetails = await vlfi.userInfo(owner.address);
    //     const AownerAmount = AownerDetails.amount;
    //     const AownerRewardDebt = AownerDetails.rewardDebt;

    //     const ACoolDown = await vlfi.stakersCooldowns(owner.address);
    //     console.log(" A Cooldown = ", ACoolDown.toString())

    //     console.log("owner VLFI Balance = ", AownerVLFIBalance.toString())
    //     console.log("Owner Amount = ", AownerAmount.toString())
    //     console.log("Owner Reward Debt = ", AownerRewardDebt.toString())

    // })

    // it("should allow the owner of the tokens to transfer with a cooldown activated", async () => {
    //     const [owner,user1] = await ethers.getSigners();
    //     const amount = ethers.utils.formatUnits(returnBigNumber(1 * 10 **18),0);
    //     const ownerBalance = await vlfi.balanceOf(owner.address)
    //     console.log("My Balance", ownerBalance.toString())
    //     await vlfi.cooldown()
    //     sleep(310000)
    //     await vlfi.transfer(user1.address,amount);
    //     const userBalance = await vlfi.balanceOf(user1.address)
    //     console.log("user balance is ", userBalance.toString())
    // })

    // it("Should allow the user to deposit another 10000 LFI to check the farm details on VLFI", async () => {
    //     const [owner] = await ethers.getSigners();
    //     const amount = ethers.utils.formatUnits(returnBigNumber(10000 * 10 **18),0);
    //     const rewardsPerSecond = ethers.utils.formatUnits(returnBigNumber(3* 10 **18),0);
    //     await vlfi.createFarm();
    //     await vlfi.setRewardPerSecond(rewardsPerSecond)
    //     await vlfi.depositLFI(amount);
    //     const ownerDetails = await vlfi.userInfo(owner.address);
    //     const ownerVLFIBalance = await vlfi.balanceOf(owner.address)
    //     const farmDetails = await vlfi.farmInfo()
    //     console.log("VLFI Balance = ", ownerVLFIBalance.toString())
    //     console.log("Owner Deposit = ", (ownerDetails.amount).toString())
    //     console.log("Owner Reward Debt = ",(ownerDetails.rewardDebt).toString())  
    //     console.log("Farm Acc Rewards Share = ", (farmDetails.accRewardsPerShare).toString()) 
    //     console.log("Farm lastRewardTime = ",(farmDetails.lastRewardTime).toString())
    // })

    // it('Should allow the user to claim the rewards in LFI Token', async () => {
    //     const [owner,user1] = await ethers.getSigners();
    //     const LFIBalanceBeforeClaim = await lfi.balanceOf(user1.address);
    //     const LFIOwnerBalanceBeforeClaim = await lfi.balanceOf(owner.address);
    //     await vlfi.connect(user1).claimRewards()
    //     await vlfi.claimRewards()
    //     const LFIBalanceAfterClaim = await lfi.balanceOf(user1.address);
    //     console.log(" User1 LFI Balance Before claim = ", LFIBalanceBeforeClaim.toString())
    //     console.log("User 1 LFI Balance after claim  = ", LFIBalanceAfterClaim.toString())
    //     const LFIOwnerBalanceAfterClaim = await lfi.balanceOf(owner.address);
    //     console.log(" Owner LFI Balance Before claim = ", LFIOwnerBalanceBeforeClaim.toString())
    //     console.log(" Owner LFI Balance after claim  = ", LFIOwnerBalanceAfterClaim.toString())

    // })

})