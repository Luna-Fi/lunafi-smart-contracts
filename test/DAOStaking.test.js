const { expect } = require("chai");
const { BigNumber} = require("ethers");
const { signERC2612Permit } = require("eth-permit");

const returnBigNumber = (number) => {
    number = number.toString(16)
    return BigNumber.from("0x" + number);
}

describe("USDC HousePool", () => {

    let LFI; let VLFI; let DAOPOOL; let FARM; let FUND;
    let lfi; let vlfi; let daopool; let farm; let fund;
    
    before(async () => {

        const approvalAmount = ethers.utils.formatUnits(returnBigNumber(10000000 * 10 **18),0);
        const transferFund = ethers.utils.formatUnits(returnBigNumber(100000 * 10 **18),0);
        const [owner] = await ethers.getSigners()

        LFI = await ethers.getContractFactory("LFIToken")
        lfi = await LFI.deploy()
        await lfi.deployed()
        console.log(`LFI Token Address = `,lfi.address)

        VLFI = await ethers.getContractFactory("VLFIclaimToken")
        vlfi = await VLFI.deploy()
        await vlfi.deployed()
        console.log(`VLFI Token Address = `, vlfi.address)

        // FUND = await ethers.getContractFactory("FundDistributor")
        // fund = await FUND.deploy(lfi.address)
        // await fund.deployed()
        // console.log("FUND = ", fund.address)

        // FARM = await ethers.getContractFactory("LFiFarms")
        // farm = await FARM.deploy(owner.address,lfi.address,fund.address)
        // await farm.deployed()
        // console.log("FARM = ", farm.address)

        DAOPOOL = await ethers.getContractFactory("DAOStakingPool")
        daopool = await upgrades.deployProxy(DAOPOOL,[owner.address,lfi.address,vlfi.address,"DAOSTAKINGPOOL","1"],{initializer: 'initialize'});
        await daopool.deployed()
        console.log(` DAO Pool Address = `, daopool.address)

        //await lfi.approve(daopool.address, approvalAmount)
        
        
        // await vlfi.approve(daopool.address, approvalAmount)
        // await vlfi.approve(farm.address,approvalAmount)
         await vlfi.addAdmin(daopool.address)

        // // Alloc Points for each Farm
        // const ALLOCATIONPOINTS = 100
        // const rewardsPerSecond = ethers.utils.formatUnits(returnBigNumber(10 * 10 **18),0)
        // const fids = [0]
        // // Create Farms
        // await farm.createFarm(ALLOCATIONPOINTS,vlfi.address)
        // // set rewardsPer Second 
        // await farm.setRewardPerSecond(rewardsPerSecond,fids)

        // await lfi.transfer(fund.address,transferFund)
  
    })

    it(`Should allow the user to deposit LFI on DaoPool. 
         In return user should get mint VLFI tokens for the user and also deposit the tokens in LFI Farms`, async () => {

         const [owner] = await ethers.getSigners(); 
         const value = ethers.utils.formatUnits(returnBigNumber(10000 * 10 **18),0);
         const amount = ethers.utils.formatUnits(returnBigNumber(1 * 10 **18),0);
         //const value = "1"
         
         const result = await signERC2612Permit(
             owner,
             lfi.address,
             owner.address,
             daopool.address,
             value
         )

         console.log("Result is :", result)
         const Oldallowance = await lfi.allowance(owner.address,daopool.address);
         console.log("Old Value is ",Oldallowance.toString())
    //      await lfi.permit(
    //         owner.address,
    //         daopool.address,
    //         value,
    //         result.deadline,
    //         result.v,
    //         result.r,
    //         result.s
    // );
         
         await daopool.newDeposit(
                        owner.address,
                        daopool.address,
                        value,
                        result.deadline,
                        amount,
                        result.v,
                        result.r,
                        result.s
                );
        
         const liqudityOfPool = await daopool.getLiquidityStatus();
         const vlfiBalance = await vlfi.balanceOf(owner.address);
         
         console.log("Liqidity status is ", ethers.utils.formatUnits(liqudityOfPool, 0));
         console.log("VLFI Balance is ",ethers.utils.formatUnits(vlfiBalance, 0));
         

    })

}) 