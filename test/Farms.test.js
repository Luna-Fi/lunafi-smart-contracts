const { expect } = require("chai");
const { BigNumber} = require("ethers");

const returnBigNumber = (number) => {
    number = number.toString(16)
    return BigNumber.from("0x" + number);
}

describe("LFI Farms", () => {
   
    let MOCKUSDC
    let USDCCLAIMTOKEN
    let USDCHOUSEPOOL 
    let LFITOKEN
    let FARM
    let FUND
    let REWARDER
    let mockUSDC
    let usdcClaimToken
    let usdcHousePool
    let lfiToken
    let fund
    let farm
    let rewarder

    before( async () => {

        const [owner,user1] = await ethers.getSigners()
        const rewardPerSecond = 5
        const approvalAmount = ethers.utils.formatUnits(returnBigNumber(10000000 * 10**18),0)

        MOCKUSDC = await ethers.getContractFactory("mockUSDCToken")
        mockUSDC = await MOCKUSDC.deploy()
        await mockUSDC.deployed()
        console.log(" Mock USDC Token Address  : ", mockUSDC.address)
        
        USDCCLAIMTOKEN = await ethers.getContractFactory("USDCclaimToken")
        usdcClaimToken = await USDCCLAIMTOKEN.deploy()
        await usdcClaimToken.deployed()
        console.log(" USDC Claim Token Address : ", usdcClaimToken.address)

        USDCHOUSEPOOL = await ethers.getContractFactory("HousePoolUSDC")
        usdcHousePool = await USDCHOUSEPOOL.deploy(owner.address,mockUSDC.address,usdcClaimToken.address, "USDCHP","1.0")
        await usdcHousePool.deployed()
        console.log(" USDC House Pool  Address  : ", usdcHousePool.address)

        LFITOKEN = await ethers.getContractFactory("LFIToken")
        lfiToken = await LFITOKEN.deploy()
        await lfiToken.deployed()
        console.log(" LFI Token Address : ", lfiToken.address)

        FUND = await ethers.getContractFactory("FundDistributor")
        fund = await FUND.deploy(lfiToken.address)
        await fund.deployed()
        console.log(" FUND Contract Address : ", fund.address)

        FARM = await ethers.getContractFactory("LFiFarms")
        farm = await FARM.deploy(owner.address,lfiToken.address,fund.address)
        await farm.deployed()
        console.log(" FARM Contract Address : ", farm.address)

        REWARDER = await ethers.getContractFactory("Rewarder")
        rewarder = await REWARDER.deploy(lfiToken.address,rewardPerSecond,farm.address)
        await rewarder.deployed()
        console.log(" REWARDER Contract address : ", rewarder.address)

        mockUSDC.approve(usdcHousePool.address,approvalAmount)
        mockUSDC.approve(fund.address,approvalAmount)
        mockUSDC.approve(farm.address,approvalAmount)
        mockUSDC.approve(rewarder.address,approvalAmount)

        lfiToken.approve(usdcHousePool.address,approvalAmount)
        lfiToken.approve(fund.address,approvalAmount)
        lfiToken.approve(farm.address,approvalAmount)
        lfiToken.approve(rewarder.address,approvalAmount)

        usdcClaimToken.approve(usdcHousePool.address,approvalAmount)
        usdcClaimToken.approve(fund.address,approvalAmount)
        usdcClaimToken.approve(farm.address,approvalAmount)
        usdcClaimToken.approve(rewarder.address,approvalAmount)

        usdcClaimToken.addAdmin(usdcHousePool.address)
        usdcClaimToken.addAdmin(fund.address)
        usdcClaimToken.addAdmin(farm.address)
        usdcClaimToken.addAdmin(rewarder.address)
    })

    it(`Should be able to allow the user to create a farm`, async () => {
        
        const [owner,user1] = await ethers.getSigners()
        const allocPoint = 5

        await farm.createFarm(allocPoint,lfiToken.address,rewarder.address)
    })

   it(`Should allow the user to deposit to the created farm`, async() => {
       const [owner,user1] = await ethers.getSigners()
       const fid = 0
       const lpAmount = ethers.utils.formatUnits(returnBigNumber(1 * 10**18),0)
       const HPDeposit = 10000000000
       console.log("LP Amount deposited:",lpAmount)

       await usdcHousePool.deposit_(HPDeposit)
       //totalSupply of claimToken.
       //Balance OF the user
       const totalLPTokenSupply = await usdcClaimToken.totalSupply()
       const userLPTokenBalance = await usdcClaimToken.balanceOf(owner.address);
       const lpTokenContractbalance = await usdcClaimToken.balanceOf(farm.address)
       console.log("LP Token Supply",ethers.BigNumber.from(totalLPTokenSupply).toString())
       console.log("USer Balance",ethers.BigNumber.from(userLPTokenBalance).toString())
       console.log("Contract Balance",ethers.BigNumber.from(lpTokenContractbalance).toString())
       
      
       await farm.deposit(fid,lpAmount,owner.address)
      
   })

})
