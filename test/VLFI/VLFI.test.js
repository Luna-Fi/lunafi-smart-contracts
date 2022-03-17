const { expect } = require("chai");
const { BigNumber} = require("ethers");
const { ethers, upgrades } = require("hardhat");
const { signERC2612Permit } = require("eth-permit");

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
        const supply = ethers.utils.formatUnits(returnBigNumber(1000000000 * 10 **18),0);
        LFI = await ethers.getContractFactory("LFIToken")
        lfi = await LFI.deploy(supply)
        await lfi.deployed()
        console.log("LFI Address :",lfi.address)

        const name = "VLFI"
        const symbol = "VLFI"
        const lfiAddress = lfi.address
        const cooldown = 300
        const unstakeWindow = 60
        const rewardsPerSecond = ethers.utils.formatUnits(returnBigNumber(1 * 10 **18),0);
       
        VLFI = await ethers.getContractFactory("VLFI")
        vlfi = await upgrades.deployProxy(VLFI,[name,symbol,lfi.address,120,60,rewardsPerSecond,3000],{initializer: 'initialize'});
        await vlfi.deployed()
        console.log("VLFI Address:",vlfi.address)
        const approvalAmount = ethers.utils.formatUnits(returnBigNumber(10000000 * 10 **18),0);
        //await lfi.approve(vlfi.address,approvalAmount)
        await lfi.connect(user1).approve(vlfi.address,approvalAmount)

        console.log("*********************************************************************")
    })

    it("Should allow the owner to deposit 10000 LFI and get a proportionate amount on VLFI", async () => {
        const [owner] = await ethers.getSigners();
        const amount = ethers.utils.formatUnits(returnBigNumber(1000 * 10 **18),0);
        const value = ethers.utils.formatUnits(returnBigNumber(10000000 * 10 **18),0);
        const result = await signERC2612Permit(
            owner,
            lfi.address,
            owner.address,
            vlfi.address,
            value
        ) 

        const OldAllowance = await lfi.allowance(owner.address,vlfi.address);
        console.log("Old Value is",OldAllowance.toString())

        await vlfi.permitAndStake(
            owner.address,
            vlfi.address,
            value,
            result.deadline,
            result.v,
            result.r,
            result.s,
            owner.address,
            amount
        );
        //await vlfi.stake(owner.address, amount)
        const newAllowance = await lfi.allowance(owner.address,vlfi.address);
        console.log("New Value is ", newAllowance.toString())
        const vlfiBalanceOfOwner = await vlfi.balanceOf(owner.address)
        console.log("Owner VLFI", vlfiBalanceOfOwner.toString())
    })

    it("Should allow another user to deposit LFI and get VLFI", async () => {
        const [owner,user1] = await ethers.getSigners();
        const transferLFIAmount = ethers.utils.formatUnits(returnBigNumber(10000 * 10 **18),0);
        const amount = ethers.utils.formatUnits(returnBigNumber(10000 * 10 **18),0);
        await lfi.connect(user1).approve(vlfi.address,transferLFIAmount)
        await lfi.transfer(user1.address,transferLFIAmount)
        await vlfi.connect(user1).stake(user1.address,amount);
        await vlfi.stake(owner.address,amount);

        // Farm  details :
        const farmAccRewardsperShare = ethers.utils.formatUnits(await vlfi.getAccRewardPerShare(), 0)
        const farmLastRewardTime = ethers.utils.formatUnits(await vlfi.getLastRewardTime(), 0)

         // User1 details :
         const user1VLFIBalance = ethers.utils.formatUnits(await vlfi.balanceOf(user1.address), 0)
         const user1Amount = ethers.utils.formatUnits(await vlfi.getUserVLFIAmount(user1.address), 0)
         const user1RewardDebt = ethers.utils.formatUnits(await vlfi.getUserRewardDebt(user1.address), 0)

         
         // Owner details :
        const ownerVLFIBalance = ethers.utils.formatUnits(await vlfi.balanceOf(owner.address), 0)
        const ownerAmount = ethers.utils.formatUnits(await vlfi.getUserVLFIAmount(owner.address), 0)
        const ownerRewardDebt = ethers.utils.formatUnits(await vlfi.getUserRewardDebt(owner.address), 0) 

         // Log Farm Details after second deposit 
        console.log("Acc Reward per Share in the Farm = ", farmAccRewardsperShare.toString())
        console.log("Last Reward Time = ", farmLastRewardTime.toString())

        // Log user Details for second deposit
        console.log("User1 VLFI Balance = ", user1VLFIBalance.toString())
        console.log("User1 Amount = ", user1Amount.toString())
        console.log("User1 Reward Debt = ", user1RewardDebt.toString())
        console.log("*********************************************************")

        // Log user Details for first deposit
        console.log("owner VLFI Balance = ", ownerVLFIBalance.toString())
        console.log("Owner Amount = ", ownerAmount.toString())
        console.log("Owner Reward Debt = ", ownerRewardDebt.toString())

    })

    it("Should allow the users to get their pending rewards", async() => {
        const [owner,user1] = await ethers.getSigners()
        const ownerPendingRewards = ethers.utils.formatUnits(await vlfi.getRewards(owner.address), 0)
        const user1PendingRewards = ethers.utils.formatUnits(await vlfi.getRewards(user1.address), 0)

        console.log("Owner Pending Rewards = ", ownerPendingRewards)
        console.log("User1 Pending Rewards = ", user1PendingRewards)

    })

    it("Should allow the users to get their pending rewards", async() => {
        const [owner,user1] = await ethers.getSigners()
        const ownerPendingRewards = ethers.utils.formatUnits(await vlfi.getRewards(owner.address), 0)
        const user1PendingRewards = ethers.utils.formatUnits(await vlfi.getRewards(user1.address), 0)

        console.log("Owner Pending Rewards = ", ownerPendingRewards)
        console.log("User1 Pending Rewards = ", user1PendingRewards)
    })


     
})