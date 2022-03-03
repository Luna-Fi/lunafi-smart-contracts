const { expect } = require("chai");
const { BigNumber} = require("ethers");

const returnBigNumber = (number) => {
    number = number.toString(16)
    return BigNumber.from("0x" + number);
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
        const rewardsPerSecond = ethers.utils.formatUnits(returnBigNumber(3* 10 **18),0);
        await vlfi.createFarm();
        await vlfi.setRewardPerSecond(rewardsPerSecond)
        await vlfi.depositLFI(amount);
        const ownerDetails = await vlfi.userInfo(owner.address);
        const ownerVLFIBalance = await vlfi.balanceOf(owner.address)
        const farmDetails = await vlfi.farmInfo()
        console.log("VLFI Balance = ", ownerVLFIBalance.toString())
        console.log("Owner Deposit = ", (ownerDetails.amount).toString())
        console.log("Owner Reward Debt = ",(ownerDetails.rewardDebt).toString())  
        console.log("Farm Acc Rewards Share = ", (farmDetails.accRewardsPerShare).toString()) 
        console.log("Farm lastRewardTime = ",(farmDetails.lastRewardTime).toString())
    })

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