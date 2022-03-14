const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { ethers } = require("hardhat");
const { inTransaction } = require("openzeppelin-test-helpers/src/expectEvent");

const returnBigNumber = (number) => {
    number = number.toString(16)
    return BigNumber.from("0x" + number);
}

describe("LFI Farms", async() => {
    
    let MockUSDCToken; let MockWBTCToken ; let MockWETHToken;
    let UsdcClaimToken; let WbtcClaimToken; let WethClaimToken;
    let UsdcHousePool; let WbtcHousePool; let WethHousePool;
    let LFIToken; let Farm; let Fund; 

    let mockUSDCToken; let mockWBTCToken; let mockWETHToken;
    let usdcClaimToken; let wbtcClaimToken; let wethClaimToken;
    let usdcHousePool; let wbtcHousePool; let wethHousePool;
    let lfiToken; let farm; let fund; 

    before(async () => {
        const [owner, user1, user2, user3] = await ethers.getSigners()
        // LFIToken Args
        const supply = ethers.utils.formatUnits(returnBigNumber(1000000000 * 10**18),0)
        // USDC HousePool Args
        const usdcLpTokenPrice = ethers.utils.formatUnits(returnBigNumber(100 * 10**18),0)
        const usdcLpWithDrawTokenPrice = ethers.utils.formatUnits(returnBigNumber(100 * 10**18),0)
        const usdcPrecision = 12
        // WBTC HousePool Args
        const wbtcLpTokenPrice = ethers.utils.formatUnits(returnBigNumber(1 * 10**16),0)
        const wbtcLpWithdrawTokenPrice = ethers.utils.formatUnits(returnBigNumber(1 * 10**16),0)
        const wbtcPrecision = 10
        // WETH HousePool Args
        const wethLpTokenPrice = ethers.utils.formatUnits(returnBigNumber(1 * 10**17),0)
        const wethLpWithdrawTokenPrice = ethers.utils.formatUnits(returnBigNumber(1 * 10**17),0)
        const wethPrecision = 0
        // Approval Amount
        const approvalAmount = ethers.utils.formatUnits(returnBigNumber(10000000 * 10**18),0)
        // Rewards Per second
        const rewardTokensPerSecond = ethers.utils.formatUnits(returnBigNumber(10 * 10**18),0)

        MockUSDCToken = await ethers.getContractFactory("mockUSDCToken")
        MockWBTCToken = await ethers.getContractFactory("mockWBTCToken")
        MockWETHToken = await ethers.getContractFactory("mockWETHToken")

        mockUSDCToken = await MockUSDCToken.deploy()
        mockWBTCToken = await MockWBTCToken.deploy()
        mockWETHToken = await MockWETHToken.deploy()

        UsdcClaimToken = await ethers.getContractFactory("claimToken")
        WbtcClaimToken = await ethers.getContractFactory("claimToken")
        WethClaimToken = await ethers.getContractFactory("claimToken")

        usdcClaimToken = await UsdcClaimToken.deploy("LFUSDCLP","LFUSDCLP")
        wbtcClaimToken = await WbtcClaimToken.deploy("LFWBTCLP","LFWBTCLP")
        wethClaimToken = await WethClaimToken.deploy("LFWETHLP","LFWETHLP")

        UsdcHousePool = await ethers.getContractFactory("HousePool")
        WbtcHousePool = await ethers.getContractFactory("HousePool")
        WethHousePool = await ethers.getContractFactory("HousePool")

        usdcHousePool = await upgrades.deployProxy(UsdcHousePool,[mockUSDCToken.address,usdcClaimToken.address,usdcLpTokenPrice,usdcLpWithDrawTokenPrice,usdcPrecision],{initializer: 'initialize'})
        wbtcHousePool = await upgrades.deployProxy(WbtcHousePool,[mockWBTCToken.address,wbtcClaimToken.address,wbtcLpTokenPrice,wbtcLpWithdrawTokenPrice,wbtcPrecision],{initializer: 'initialize'})
        wethHousePool = await upgrades.deployProxy(WethHousePool,[mockWETHToken.address,wethClaimToken.address,wethLpTokenPrice,wethLpWithdrawTokenPrice,wethPrecision],{initializer: 'initialize'})

        LFIToken = await ethers.getContractFactory("LFIToken")
        lfiToken = await LFIToken.deploy(supply)

        Fund = await ethers.getContractFactory("FundDistributor")
        fund = await upgrades.deployProxy(Fund,[lfiToken.address],{initializer: 'initialize'})

        Farm = await ethers.getContractFactory("LFiFarms")
        farm = await upgrades.deployProxy(Farm,[owner.address,lfiToken.address,fund.address],{initializer: 'initialize'})

        // Approvals

        await mockUSDCToken.approve(usdcHousePool.address,approvalAmount)
        await mockWBTCToken.approve(wbtcHousePool.address,approvalAmount)
        await mockWETHToken.approve(wethHousePool.address,approvalAmount) 

        await mockUSDCToken.connect(user1).approve(usdcHousePool.address,approvalAmount)
        await mockUSDCToken.connect(user2).approve(usdcHousePool.address,approvalAmount)
        await mockUSDCToken.connect(user3).approve(usdcHousePool.address,approvalAmount)

        await mockWBTCToken.connect(user1).approve(wbtcHousePool.address,approvalAmount)
        await mockWBTCToken.connect(user2).approve(wbtcHousePool.address,approvalAmount)
        await mockWBTCToken.connect(user3).approve(wbtcHousePool.address,approvalAmount)

        await mockWETHToken.connect(user1).approve(wethHousePool.address,approvalAmount)
        await mockWETHToken.connect(user2).approve(wethHousePool.address,approvalAmount)
        await mockWETHToken.connect(user3).approve(wethHousePool.address,approvalAmount)

        await usdcClaimToken.approve(usdcHousePool.address,approvalAmount)
        await wbtcClaimToken.approve(wbtcHousePool.address,approvalAmount)
        await wethClaimToken.approve(wethHousePool.address,approvalAmount)

        await usdcClaimToken.connect(user1).approve(usdcHousePool.address,approvalAmount)
        await usdcClaimToken.connect(user2).approve(usdcHousePool.address,approvalAmount)
        await usdcClaimToken.connect(user3).approve(usdcHousePool.address,approvalAmount)

        await wbtcClaimToken.connect(user1).approve(wbtcHousePool.address,approvalAmount)
        await wbtcClaimToken.connect(user2).approve(wbtcHousePool.address,approvalAmount)
        await wbtcClaimToken.connect(user3).approve(wbtcHousePool.address,approvalAmount)

        await wethClaimToken.connect(user1).approve(wethHousePool.address,approvalAmount)
        await wethClaimToken.connect(user2).approve(wethHousePool.address,approvalAmount)
        await wethClaimToken.connect(user3).approve(wethHousePool.address,approvalAmount)

        
        await lfiToken.approve(fund.address,approvalAmount)
        await usdcClaimToken.approve(farm.address,approvalAmount)
        await wbtcClaimToken.approve(farm.address,approvalAmount)
        await wethClaimToken.approve(farm.address,approvalAmount)
        await usdcClaimToken.connect(user1).approve(farm.address,approvalAmount)
        await usdcClaimToken.connect(user2).approve(farm.address,approvalAmount)
        await usdcClaimToken.connect(user3).approve(farm.address,approvalAmount)

        await wbtcClaimToken.connect(user1).approve(farm.address,approvalAmount)
        await wbtcClaimToken.connect(user2).approve(farm.address,approvalAmount)
        await wbtcClaimToken.connect(user3).approve(farm.address,approvalAmount)

        await wethClaimToken.connect(user1).approve(farm.address,approvalAmount)
        await wethClaimToken.connect(user2).approve(farm.address,approvalAmount)
        await wethClaimToken.connect(user3).approve(farm.address,approvalAmount)
        

        await lfiToken.connect(user1).approve(fund.address,approvalAmount)
        await lfiToken.connect(user2).approve(fund.address,approvalAmount)
        await lfiToken.connect(user3).approve(fund.address,approvalAmount)

        await usdcClaimToken.addAdmin(usdcHousePool.address)
        await wbtcClaimToken.addAdmin(wbtcHousePool.address)
        await wethClaimToken.addAdmin(wethHousePool.address)
        
    })

    it( "Should allow the owenr to create Farms and SetRewardsPerSecond", async () => {
        const [owner]= await ethers.getSigners()
        // Alloc Points for each farm
        const USDCFarmAllocPoints = 50
        const WBTCFarmAllocPoints = 10
        const WETHFarmAllocPoints = 40
        
        const rewardTokensPerSecond = ethers.utils.formatUnits(returnBigNumber(10 * 10**18),0)
        const fids = [0,1,2]

        // create Farms 
        await farm.createFarm(USDCFarmAllocPoints,usdcClaimToken.address)
        await farm.createFarm(WBTCFarmAllocPoints,wbtcClaimToken.address)
        await farm.createFarm(WETHFarmAllocPoints,wethClaimToken.address)

        // Set RewardsPer second
        await farm.setRewardPerSecond(rewardTokensPerSecond,fids)
        const farmsCount = await farm.farmLength()
        const rewards = await farm.rewardPerSecond()

        expect(ethers.utils.formatUnits(farmsCount)).to.equal(ethers.utils.formatUnits(3))
        expect(ethers.utils.formatUnits(rewards)).to.equal(ethers.utils.formatUnits(rewards))

    })

    

    
})