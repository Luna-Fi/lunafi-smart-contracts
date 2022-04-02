const { expect } = require("chai");
const { BigNumber} = require("ethers");
const { ethers, upgrades } = require("hardhat");
const { signERC2612Permit } = require("eth-permit");

const returnBigNumber = (number) => {
    number = number.toString(16)
    return BigNumber.from("0x" + number);
}

const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
  }
describe("VLFI TOKEN", () => {

        let LFI;
        let VLFI;
        let lfi;
        let vlfi;

    before(async () => {
        const[owner,user1] = await ethers.getSigners()
        const supply = ethers.utils.formatUnits(returnBigNumber(10000000000 * 10**18),0);
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
        vlfi = await upgrades.deployProxy(VLFI,[name,symbol,lfi.address,120,60,rewardsPerSecond],{initializer: 'initialize'});
        await vlfi.deployed()
        console.log("VLFI Address:",vlfi.address)
        const approvalAmount = ethers.utils.formatUnits(returnBigNumber(10000000 * 10 **18),0);
        //await lfi.approve(vlfi.address,approvalAmount)
        await lfi.connect(user1).approve(vlfi.address,approvalAmount)

        console.log("*********************************************************************")
    })

    it("Should allow the owner to deposit 10000 LFI and get a proportionate amount on VLFI", async () => {
        const [owner] = await ethers.getSigners();
        const amount = ethers.utils.formatUnits(returnBigNumber(10000 * 10 **18),0);
        const value  = ethers.utils.formatUnits(returnBigNumber(10000 * 10 **18),0);
        const result = await signERC2612Permit(
            owner,
            lfi.address,
            owner.address,
            vlfi.address,
            value
        ) 

        await vlfi.permitAndStake(
            owner.address,
            vlfi.address,
            value,
            result.deadline,
            result.v,
            result.r,
            result.s,
            owner.address,
        );
 
    })

    it("Should allow the manager to set Rewards PerSecond", async() => {
        const rps = ethers.utils.formatUnits(returnBigNumber(1 * 10 **16),0);
        await vlfi.setRewardPerSecond(rps)
    })
    it("Should allow the manager to get rewards per second", async () => {
        const rps = await vlfi.getRewardPerSecond()
        expect(rps).to.equal(ethers.utils.formatUnits(returnBigNumber(1 * 10 **16),0))
    })  

    it("Should return the coolDown period of the staker", async() => {
        const [owner] = await ethers.getSigners();
        const cool = await vlfi.getCooldown(owner.address);
        expect(cool).to.equal(ethers.utils.formatUnits(returnBigNumber(0),0));
    })

    it("Should allow the user to get their LFI Deposit value", async() => {
        const [owner] = await ethers.getSigners()
        const LFIDeposit = await vlfi.getUserLFIDeposits(owner.address);
        expect(LFIDeposit).to.equal(ethers.utils.formatUnits(returnBigNumber(10000 * 10 **18),0));
    })

    it("Should get the user VLFI Balance", async() => {
        const [owner] = await ethers.getSigners()
        const VLFIDeposit = await vlfi.getUserVLFIAmount(owner.address);
        expect(VLFIDeposit).to.equal(ethers.utils.formatUnits(returnBigNumber(10 * 10 **18),0));
    })
    it("Should get the liquidity of the pool", async() => {
        const liquidity = await vlfi.getLiquidityStatus();
        expect(liquidity).to.equal(ethers.utils.formatUnits(returnBigNumber(10000 * 10 **18),0));
    })

    it("Should allow the manager to set Cooldown Seconds", async() => {
        const cooldownSeconds = 500;
        await vlfi.setCooldownSeconds(cooldownSeconds);
        const cooldown = await vlfi.getCooldownSeconds();
        expect(cooldown).to.equal(cooldownSeconds)
    })

    it("Should get the cooldown Seconds", async() => {
        const cooldownSeconds = 500;
        const cooldown = await vlfi.getCooldownSeconds();
        expect(cooldown).to.equal(cooldownSeconds)
    })

    it("Should allow the admin to set unstake window time", async() => {
        const unstakeTime = 150;
        await vlfi.setUnstakeWindowTime(unstakeTime);
        const unstake = await vlfi.getUnstakeWindowTime();
        expect(unstake).to.equal(unstakeTime);
    })

    it("Should allow the user to  get the unstake window time", async() => {
        const unstakeTime = 150;
        const unstake = await vlfi.getUnstakeWindowTime();
        expect(unstake).to.equal(unstakeTime);
    })

    it("Should allow the user to get the rewards earned", async() => {
        const [owner] = await ethers.getSigners()
        await sleep(10000)
        const rewards = await vlfi.getRewards(owner.address)
        expect(rewards).to.equal(ethers.utils.formatUnits(returnBigNumber(102 * 10 **16),0));
    })

    it("Should allow the user to claimRewards", async() => {
        const [owner] = await ethers.getSigners()
        const rewards = await vlfi.getRewards(owner.address)
        const balancebefore = await lfi.balanceOf(owner.address);
        await vlfi.claimRewards(owner.address)
        const balanceAfter = await lfi.balanceOf(owner.address);
        expect(balanceAfter.toString()).to.equal("9999999999999999583119726833120000000000000000");
    })
    
    

    // it("Should allow another user to deposit LFI and get VLFI", async () => {
    //     const [owner,user1] = await ethers.getSigners();
    //     const transferLFIAmount = ethers.utils.formatUnits(returnBigNumber(10000 * 10 **18),0);
    //     const amount = ethers.utils.formatUnits(returnBigNumber(10000 * 10 **18),0);
    //     await lfi.connect(user1).approve(vlfi.address,transferLFIAmount)
    //     await lfi.transfer(user1.address,transferLFIAmount)
    //     await vlfi.connect(user1).stake(user1.address,amount);
    //     await vlfi.stake(owner.address,amount);

    //     // Farm  details :
    //     const farmAccRewardsperShare = ethers.utils.formatUnits(await vlfi.getAccRewardPerShare(), 0)
    //     const farmLastRewardTime = ethers.utils.formatUnits(await vlfi.getLastRewardTime(), 0)

    //      // User1 details :
    //      const user1VLFIBalance = ethers.utils.formatUnits(await vlfi.balanceOf(user1.address), 0)
    //      const user1Amount = ethers.utils.formatUnits(await vlfi.getUserVLFIAmount(user1.address), 0)
    //      const user1RewardDebt = ethers.utils.formatUnits(await vlfi.getUserRewardDebt(user1.address), 0)

         
    //      // Owner details :
    //     const ownerVLFIBalance = ethers.utils.formatUnits(await vlfi.balanceOf(owner.address), 0)
    //     const ownerAmount = ethers.utils.formatUnits(await vlfi.getUserVLFIAmount(owner.address), 0)
    //     const ownerRewardDebt = ethers.utils.formatUnits(await vlfi.getUserRewardDebt(owner.address), 0) 

    //      // Log Farm Details after second deposit 
    //     console.log("Acc Reward per Share in the Farm = ", farmAccRewardsperShare.toString())
    //     console.log("Last Reward Time = ", farmLastRewardTime.toString())

    //     // Log user Details for second deposit
    //     console.log("User1 VLFI Balance = ", user1VLFIBalance.toString())
    //     console.log("User1 Amount = ", user1Amount.toString())
    //     console.log("User1 Reward Debt = ", user1RewardDebt.toString())
    //     console.log("*********************************************************")

    //     // Log user Details for first deposit
    //     console.log("owner VLFI Balance = ", ownerVLFIBalance.toString())
    //     console.log("Owner Amount = ", ownerAmount.toString())
    //     console.log("Owner Reward Debt = ", ownerRewardDebt.toString())

    // })

    // it("Should allow the users to get their pending rewards", async() => {
    //     const [owner,user1] = await ethers.getSigners()
    //     const ownerPendingRewards = ethers.utils.formatUnits(await vlfi.getRewards(owner.address), 0)
    //     const user1PendingRewards = ethers.utils.formatUnits(await vlfi.getRewards(user1.address), 0)

    //     console.log("Owner Pending Rewards = ", ownerPendingRewards)
    //     console.log("User1 Pending Rewards = ", user1PendingRewards)

    // })

    // it("Should allow the users to get their pending rewards", async() => {
    //     const [owner,user1] = await ethers.getSigners()
    //     const ownerPendingRewards = ethers.utils.formatUnits(await vlfi.getRewards(owner.address), 0)
    //     const user1PendingRewards = ethers.utils.formatUnits(await vlfi.getRewards(user1.address), 0)

    //     console.log("Owner Pending Rewards = ", ownerPendingRewards)
    //     console.log("User1 Pending Rewards = ", user1PendingRewards)
    // })

    


     
})