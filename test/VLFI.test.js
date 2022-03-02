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

        LFI = await ethers.getContractFactory("LFIToken")
        lfi = await LFI.deploy()
        await lfi.deployed()
        console.log("LFI Address :",lfi.address)

        const name = "VLFI"
        const symbol = "VLFI"
        const decimals = 18
        const lfiAddress = lfi.address
        const cooldown = 300
        const unstakeWindow = 60
       
        VLFI = await ethers.getContractFactory("VLFI")
        vlfi = await VLFI.deploy(name,symbol,decimals,lfiAddress,cooldown,unstakeWindow)
        await vlfi.deployed()
        console.log("VLFI Address:",vlfi.address)
        const approvalAmount = ethers.utils.formatUnits(returnBigNumber(10000000 * 10 **18),0);
        await lfi.approve(vlfi.address,approvalAmount)
    })

    it("Should allow the user to deposit 10000 LFI and get a proportionate amount on VLFI", async () => {
        const [owner] = await ethers.getSigners();
        const amount = ethers.utils.formatUnits(returnBigNumber(1000 * 10 **18),0);
        await vlfi.createFarm();
        await vlfi.depositLFI(amount);
        const userDetails = await vlfi.userInfo(owner.address);
        const userVLFIBalance = await vlfi.balanceOf(owner.address)
        const farmDetails = await vlfi.farmInfo()
        console.log("VLFI Balance = ", userVLFIBalance.toString())
        console.log("User Deposit = ", (userDetails.amount).toString())
        console.log("User Reward Debt = ",(userDetails.rewardDebt).toString())  
        console.log("Farm Acc Rewards Share = ", (farmDetails.accRewardsPerShare).toString()) 
        console.log("Farm lastRewardTime = ",(farmDetails.lastRewardTime).toString())
    })

    it("Should allow the user to deposit another 10000 LFI to check the farm details on VLFI", async () => {
        const [owner] = await ethers.getSigners();
        const amount = ethers.utils.formatUnits(returnBigNumber(1000 * 10 **18),0);
        await vlfi.depositLFI(amount);
        const userDetails = await vlfi.userInfo(owner.address);
        const userVLFIBalance = await vlfi.balanceOf(owner.address)
        const farmDetails = await vlfi.farmInfo()
        console.log("VLFI Balance = ", userVLFIBalance.toString())
        console.log("User Deposit = ", (userDetails.amount).toString())
        console.log("User Reward Debt = ",(userDetails.rewardDebt).toString())  
        console.log("Farm Acc Rewards Share = ", (farmDetails.accRewardsPerShare).toString()) 
        console.log("Farm lastRewardTime = ",(farmDetails.lastRewardTime).toString() )
    })


})