const { expect } = require("chai");
const { BigNumber} = require("ethers");
const { network } = require("hardhat");

const returnBigNumber = (number) => {
    number = number.toString(16)
    return BigNumber.from("0x" + number);
}

describe("LFI Farms", () => {
   
    let MOCKUSDC
    let MOCKWBTC
    let MOCKWETH
    let USDCCLAIMTOKEN
    let WBTCCLAIMTOKEN
    let WETHCLAIMTOKEN
    let USDCHOUSEPOOL 
    let WBTCHOUSEPOOL 
    let WETHHOUSEPOOL 
    let LFITOKEN
    let FARM
    let FUND
    let REWARDER
    let mockUSDC
    let mockWBTC
    let mockWETH
    let usdcClaimToken
    let wbtcClaimToken
    let wethClaimToken
    let usdcHousePool
    let wbtcHousePool 
    let wethHousePool
    let lfiToken
    let fund
    let farm
    let rewarder

    before( async () => {

        const [owner,user1] = await ethers.getSigners()
        const rewardTokensPerSecond = ethers.utils.formatUnits(returnBigNumber(11.5740740741 * 10 **18),0)
        const approvalAmount = ethers.utils.formatUnits(returnBigNumber(10000000 * 10**18),0)

        MOCKUSDC = await ethers.getContractFactory("mockUSDCToken")
        mockUSDC = await MOCKUSDC.deploy()
        await mockUSDC.deployed()
        console.log(" Mock USDC Token Address  : ", mockUSDC.address)

        MOCKWBTC = await ethers.getContractFactory("mockWBTCToken")
        mockWBTC = await MOCKWBTC.deploy()
        await mockWBTC.deployed()
        console.log(" Mock WBTC Token Address  : ", mockWBTC.address)

        MOCKWETH = await ethers.getContractFactory("mockWETHToken")
        mockWETH = await MOCKWETH.deploy()
        await mockWETH.deployed()
        console.log(" Mock WETH Token Address  : ", mockWETH.address)
        
        USDCCLAIMTOKEN = await ethers.getContractFactory("USDCclaimToken")
        usdcClaimToken = await USDCCLAIMTOKEN.deploy()
        await usdcClaimToken.deployed()
        console.log(" USDC Claim Token Address : ", usdcClaimToken.address)

        WBTCCLAIMTOKEN = await ethers.getContractFactory("WBTCclaimToken")
        wbtcClaimToken = await WBTCCLAIMTOKEN.deploy()
        await wbtcClaimToken.deployed()
        console.log(" WBTC Claim Token Address : ", wbtcClaimToken.address)

        WETHCLAIMTOKEN = await ethers.getContractFactory("WETHclaimToken")
        wethClaimToken = await WETHCLAIMTOKEN.deploy()
        await wethClaimToken.deployed()
        console.log(" WETH Claim Token Address : ", wethClaimToken.address)

        USDCHOUSEPOOL = await ethers.getContractFactory("HousePoolUSDC")
        usdcHousePool = await USDCHOUSEPOOL.deploy(owner.address,mockUSDC.address,usdcClaimToken.address, "USDCHP","1.0")
        await usdcHousePool.deployed()
        console.log(" USDC House Pool  Address  : ", usdcHousePool.address)

        WBTCHOUSEPOOL = await ethers.getContractFactory("HousePoolWBTC")
        wbtcHousePool = await WBTCHOUSEPOOL.deploy(owner.address,mockWBTC.address,wbtcClaimToken.address, "WBTCHP","1.0")
        await wbtcHousePool.deployed()
        console.log(" WBTC House Pool  Address  : ", wbtcHousePool.address)


        WETHHOUSEPOOL = await ethers.getContractFactory("HousePoolWETH")
        wethHousePool = await WETHHOUSEPOOL.deploy(owner.address,mockWETH.address,wethClaimToken.address, "WETHHP","1.0")
        await wethHousePool.deployed()
        console.log(" WETH House Pool  Address  : ", wethHousePool.address)


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
        rewarder = await REWARDER.deploy(lfiToken.address,rewardTokensPerSecond,farm.address)
        await rewarder.deployed()
        console.log(" REWARDER Contract address : ", rewarder.address)

        mockUSDC.approve(usdcHousePool.address,approvalAmount)
        mockUSDC.approve(fund.address,approvalAmount)
        mockUSDC.approve(farm.address,approvalAmount)
        mockUSDC.approve(rewarder.address,approvalAmount)

        mockWBTC.approve(wbtcHousePool.address,approvalAmount)
        mockWBTC.approve(fund.address,approvalAmount)
        mockWBTC.approve(farm.address,approvalAmount)
        mockWBTC.approve(rewarder.address,approvalAmount)

        mockWETH.approve(wethHousePool.address,approvalAmount)
        mockWETH.approve(fund.address,approvalAmount)
        mockWETH.approve(farm.address,approvalAmount)
        mockWETH.approve(rewarder.address,approvalAmount)


        lfiToken.approve(usdcHousePool.address,approvalAmount)
        lfiToken.approve(wbtcHousePool.address,approvalAmount)
        lfiToken.approve(wethHousePool.address,approvalAmount)
        lfiToken.approve(fund.address,approvalAmount)
        lfiToken.approve(farm.address,approvalAmount)
        lfiToken.approve(rewarder.address,approvalAmount)

        usdcClaimToken.approve(usdcHousePool.address,approvalAmount)
        usdcClaimToken.approve(fund.address,approvalAmount)
        usdcClaimToken.approve(farm.address,approvalAmount)
        usdcClaimToken.approve(rewarder.address,approvalAmount)

        wbtcClaimToken.approve(wbtcHousePool.address,approvalAmount)
        wbtcClaimToken.approve(fund.address,approvalAmount)
        wbtcClaimToken.approve(farm.address,approvalAmount)
        wbtcClaimToken.approve(rewarder.address,approvalAmount)

        wethClaimToken.approve(wethHousePool.address,approvalAmount)
        wethClaimToken.approve(fund.address,approvalAmount)
        wethClaimToken.approve(farm.address,approvalAmount)
        wethClaimToken.approve(rewarder.address,approvalAmount)

        usdcClaimToken.addAdmin(usdcHousePool.address)
        usdcClaimToken.addAdmin(fund.address)
        usdcClaimToken.addAdmin(farm.address)
        usdcClaimToken.addAdmin(rewarder.address)

        wbtcClaimToken.addAdmin(wbtcHousePool.address)
        wbtcClaimToken.addAdmin(fund.address)
        wbtcClaimToken.addAdmin(farm.address)
        wbtcClaimToken.addAdmin(rewarder.address)

        wethClaimToken.addAdmin(wethHousePool.address)
        wethClaimToken.addAdmin(fund.address)
        wethClaimToken.addAdmin(farm.address)
        wethClaimToken.addAdmin(rewarder.address)
    })

    it(`Should be able to allow the user to create a farm and set RewardTokens`, async () => {
        
        const [owner,user1] = await ethers.getSigners()
        const allocPoint1 = 10
        const allocPoint2 = 40
        const allocPoint3 = 50
        const rewardTokensPerSecond = ethers.utils.formatUnits(returnBigNumber(11.5740740741 * 10 **18),0)
        
        await farm.createFarm(allocPoint1,usdcClaimToken.address,rewarder.address)
        await farm.createFarm(allocPoint2,wbtcClaimToken.address,rewarder.address)
        await farm.createFarm(allocPoint3,wethClaimToken.address,rewarder.address)

        await farm.setRewardPerSecond(rewardTokensPerSecond)

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

       const userLPTokenBalanceAfter = await usdcClaimToken.balanceOf(owner.address);
       console.log("USer Balance After",ethers.BigNumber.from(userLPTokenBalance).toString())
      
   })

   it( `Should allow the user to withdraw the deposits`, async () => {
       
        const [owner,user1] = await ethers.getSigners()
        const fid = 0
        const lpAmount = ethers.utils.formatUnits(returnBigNumber(1 * 10**18),0)
        console.log("LP Amount to Withdraw :", lpAmount)
        await farm.withdraw(fid,lpAmount,owner.address)
        const userLPTokenBalance = await usdcClaimToken.balanceOf(owner.address);
        console.log("User Balance",ethers.BigNumber.from(userLPTokenBalance).toString())


   })

   it(`Should allow the user to harvest the rewards`, async () => {
    const [owner,user1] = await ethers.getSigners()
    const fid = 0
    const lpAmount = ethers.utils.formatUnits(returnBigNumber(1 * 10**18),0)
    await usdcClaimToken.transfer(user1.address,lpAmount)
    await farm.connect(user1).deposit(fid,lpAmount,user1.address)
    await network.provider.send("evm_increaseTime", [36000])
    await network.provider.send("evm_mine")
    await fund.addRequester(user1.address)
    await farm.connect(user1).harvest(fid,user1.address)
    const tokenBalance = lfiToken.balanceOf(user1.address)
    console.log(tokenBalance.toString())

   })

})
