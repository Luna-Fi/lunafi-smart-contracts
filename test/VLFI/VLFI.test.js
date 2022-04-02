const { expect } = require("chai");
const { BigNumber} = require("ethers");
const { ethers, upgrades } = require("hardhat");
const { signERC2612Permit } = require("eth-permit");

const returnBigNumber = (number) => {
    number = number.toString(16)
    return BigNumber.from("0x" + number);
}

const formatFromBaseUnit = (amount, decimals) => Number(ethers.utils.formatUnits(ethers.BigNumber.from(amount), decimals))
const formatToNumber = (n) => ethers.BigNumber.from(n).toNumber()

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

    it("Should allow the users to start cooldown window and unstake variable amounr", async() => {
        const [owner,user1] = await ethers.getSigners()

        const transferLFIAmount = ethers.utils.formatUnits(returnBigNumber(10000 * 10 **18),0);
        const amount = ethers.utils.formatUnits(returnBigNumber(10000 * 10 **18),0);
        
        const originalBalance = await lfi.balanceOf(owner.address)
        await vlfi.connect(owner).activateCooldown();
        const cooldownInSeconds = formatToNumber(await vlfi.getCooldownSeconds())

        const timeout = cooldownInSeconds * 1000 + 1500
        await sleep(timeout);

        await vlfi.connect(owner).unStake(owner.address, 1);

        const amountDeposited = await vlfi.getUserLFIDeposits(owner.address);

        const newBalance = await lfi.balanceOf(owner.address)
        expect(newBalance).to.not.equal(originalBalance)

    })
    
     
})