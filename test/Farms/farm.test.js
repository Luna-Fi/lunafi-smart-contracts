const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { ethers } = require("hardhat");

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

        usdcHousePool = await upgrades.deployProxy(UsdcHousePool,["USDCPOOL",mockUSDCToken.address,usdcClaimToken.address,usdcLpTokenPrice,usdcLpWithDrawTokenPrice,usdcPrecision],{initializer: 'initialize'})
        wbtcHousePool = await upgrades.deployProxy(WbtcHousePool,["WBTCPOOL",mockWBTCToken.address,wbtcClaimToken.address,wbtcLpTokenPrice,wbtcLpWithdrawTokenPrice,wbtcPrecision],{initializer: 'initialize'})
        wethHousePool = await upgrades.deployProxy(WethHousePool,["WETHPOOL",mockWETHToken.address,wethClaimToken.address,wethLpTokenPrice,wethLpWithdrawTokenPrice,wethPrecision],{initializer: 'initialize'})

        LFIToken = await ethers.getContractFactory("LFIToken")
        lfiToken = await LFIToken.deploy(supply)

        Fund = await ethers.getContractFactory("FundDistributor")
        fund = await Fund.deploy(lfiToken.address)

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

        mockUSDCToken.transfer(user1.address,10000000000)
        mockWBTCToken.transfer(user2.address,1000000000000)
        mockWETHToken.transfer(user3.address,ethers.utils.formatUnits(returnBigNumber(10000* 10 **18),0))
        
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

    it(`Should allow the users to deposit LP Tokens into the Farms`, async () => {
        const [owner,user1,user2,user3] = await ethers.getSigners()
        const user1Farm = 0
        const user2Farm = 1
        const user3Farm = 2
        const user1FarmDeposit = ethers.utils.formatUnits(returnBigNumber(70 * 10**18),0)
        const user2FarmDeposit = ethers.utils.formatUnits(returnBigNumber(70 * 10**18),0)
        const user3FarmDeposit = ethers.utils.formatUnits(returnBigNumber(70 * 10**18),0)
        
        const user1HPDeposit = 10000000000
        const user2HPDeposit = 1000000000000
        const user3HPDeposit = ethers.utils.formatUnits(returnBigNumber(10000* 10 **18),0)

        // Deposit MockTokens in HousePools to get back some LP Tokens
        await usdcHousePool.connect(user1).deposit_(user1HPDeposit)
        await wbtcHousePool.connect(user2).deposit_(user2HPDeposit)
        await wethHousePool.connect(user3).deposit_(user3HPDeposit)
      
       // Deposit LP Tokens in Farms
        await farm.connect(user1).deposit(user1Farm,user1FarmDeposit,user1.address)
        await farm.connect(user2).deposit(user2Farm,user2FarmDeposit,user2.address)
        await farm.connect(user3).deposit(user3Farm,user3FarmDeposit,user3.address)
        // LP Token Balance of Farm
        const FarmUSDCLPTokenBalance = await usdcClaimToken.balanceOf(farm.address)
        const FarmWBTCLPTokenBalance = await wbtcClaimToken.balanceOf(farm.address)
        const FarmWETHLPTokenBalance = await wethClaimToken.balanceOf(farm.address)

        expect(ethers.utils.formatUnits(FarmUSDCLPTokenBalance,0)).to.equal(user1FarmDeposit)
        expect(ethers.utils.formatUnits(FarmWBTCLPTokenBalance,0)).to.equal(user2FarmDeposit)
        expect(ethers.utils.formatUnits(FarmWETHLPTokenBalance,0)).to.equal(user3FarmDeposit)
    })

    it(`Should allow the users to withdraw LP Tokens`, async () => {
        const [owner,user1,user2,user3] = await ethers.getSigners()

        const user1Farm = 0
        const user2Farm = 1
        const user3Farm = 2

        const user1FarmWithdraw = ethers.utils.formatUnits(returnBigNumber(10 * 10**18),0)
        const user2FarmWithdraw = ethers.utils.formatUnits(returnBigNumber(10 * 10**18),0)
        const user3FarmWithdraw = ethers.utils.formatUnits(returnBigNumber(10 * 10**18),0)

        await farm.connect(user1).withdraw(user1Farm,user1FarmWithdraw,user1.address)
        await farm.connect(user2).withdraw(user2Farm,user2FarmWithdraw,user2.address)
        await farm.connect(user3).withdraw(user3Farm,user3FarmWithdraw,user3.address)

        const USDCLPFarmBalance = ethers.utils.formatUnits(await usdcClaimToken.balanceOf(farm.address),0)
        const WBTCLPFarmBalance = ethers.utils.formatUnits(await wbtcClaimToken.balanceOf(farm.address),0)
        const WETHLPFarmBalance = ethers.utils.formatUnits(await wethClaimToken.balanceOf(farm.address),0)

        expect(USDCLPFarmBalance).to.equal(ethers.utils.formatUnits(returnBigNumber(60 * 10**18),0))
        expect(WBTCLPFarmBalance).to.equal(ethers.utils.formatUnits(returnBigNumber(60 * 10**18),0))
        expect(WETHLPFarmBalance).to.equal(ethers.utils.formatUnits(returnBigNumber(60 * 10**18),0))
      
    })

    it(`Should allow the user to withdraw LPTokens and Harvest Rewards`, async () => {
        const [owner,user1,user2,user3] = await ethers.getSigners()
        await fund.addRequester(farm.address)
        const user1Farm = 0;
        const user2Farm = 1
        const user3Farm = 2

        const user1FarmWithdraw = ethers.utils.formatUnits(returnBigNumber(40 * 10**18),0)
        const user2FarmWithdraw = ethers.utils.formatUnits(returnBigNumber(40 * 10**18),0)
        const user3FarmWithdraw = ethers.utils.formatUnits(returnBigNumber(40 * 10**18),0)

        const LFITokenBeforeBalanceUser1 = await lfiToken.balanceOf(user1.address)
        const LFITokenBeforeBalanceUser2 = await lfiToken.balanceOf(user2.address)
        const LFITokenBeforeBalanceUser3 = await lfiToken.balanceOf(user3.address)

        const LPBeforeBalanceUser1 = await usdcClaimToken.balanceOf(user1.address)
        const LPBeforeBalanceUser2 = await wbtcClaimToken.balanceOf(user2.address)
        const LPBeforeBalanceUser3 = await wethClaimToken.balanceOf(user3.address)

        const totalSupply = await lfiToken.totalSupply()
        await lfiToken.transfer(fund.address,totalSupply)

        await network.provider.send("evm_increaseTime", [95])
        await network.provider.send("evm_mine")


        await farm.connect(user1).withdrawAndHarvest(user1Farm,user1FarmWithdraw,user1.address)
        await farm.connect(user2).withdrawAndHarvest(user2Farm,user2FarmWithdraw,user2.address)
        await farm.connect(user3).withdrawAndHarvest(user3Farm,user3FarmWithdraw,user3.address)

        const LFITokenAfterBalanceUser1 = await lfiToken.balanceOf(user1.address)
        const LFITokenAfterBalanceUser2 = await lfiToken.balanceOf(user2.address)
        const LFITokenAfterBalanceUser3 = await lfiToken.balanceOf(user3.address)
        
    
        const LPAfterBalanceUser1 = await usdcClaimToken.balanceOf(user1.address)
        const LPAfterBalanceUser2 = await wbtcClaimToken.balanceOf(user2.address)
        const LPAfterBalanceUser3 = await wethClaimToken.balanceOf(user3.address)

        console.log("LP User1 Balance before withdraw and harvest = ",ethers.utils.formatUnits(LPBeforeBalanceUser1,0))
        console.log("LP User1 Balance before withdraw and harvest = ",ethers.utils.formatUnits(LPBeforeBalanceUser2,0))
        console.log("LP User1 Balance before withdraw and harvest = ",ethers.utils.formatUnits(LPBeforeBalanceUser3,0))

        console.log("LP User1 Balance after withdraw and harvest = ",ethers.utils.formatUnits(LPAfterBalanceUser1,0))
        console.log("LP User1 Balance after withdraw and harvest = ",ethers.utils.formatUnits(LPAfterBalanceUser2,0))
        console.log("LP User1 Balance after withdraw and harvest = ",ethers.utils.formatUnits(LPAfterBalanceUser3,0))


        console.log("LFI User1 Balance before withdraw and harvest = ",ethers.utils.formatUnits(LFITokenBeforeBalanceUser1,0))
        console.log("LFI User1 Balance before withdraw and harvest = ",ethers.utils.formatUnits(LFITokenBeforeBalanceUser2,0))
        console.log("LFI User1 Balance before withdraw and harvest = ",ethers.utils.formatUnits(LFITokenBeforeBalanceUser3,0))

        console.log("LFI User1 Balance after withdraw and harvest = ",ethers.utils.formatUnits(LFITokenAfterBalanceUser1,0))
        console.log("LFI User1 Balance after withdraw and harvest = ",ethers.utils.formatUnits(LFITokenAfterBalanceUser2,0))
        console.log("LFI User1 Balance after withdraw and harvest = ",ethers.utils.formatUnits(LFITokenAfterBalanceUser3,0))

    })

    it(`Should allow the users to harvest the rewards from the Farms`, async () => {
        const [owner,user1,user2,user3] = await ethers.getSigners()
        const user1Farm = 0
        const user2Farm = 1
        const user3Farm = 2
        
        //Increase Time
        await network.provider.send("evm_increaseTime", [95])
        await network.provider.send("evm_mine")

        await farm.connect(user1).harvest(user1Farm,user1.address)
        await farm.connect(user2).harvest(user2Farm,user2.address)
        await farm.connect(user3).harvest(user3Farm,user3.address)

        const LFITokenBalanceUser1 = await lfiToken.balanceOf(user1.address)
        const LFITokenBalanceUser2 = await lfiToken.balanceOf(user2.address)
        const LFITokenBalanceUser3 = await lfiToken.balanceOf(user3.address)

        console.log("Rewards Transferred to user1 = ",ethers.utils.formatUnits(LFITokenBalanceUser1,0))
        console.log("Rewards Transferred to user2 = ",ethers.utils.formatUnits(LFITokenBalanceUser2,0))
        console.log("Rewards Transferred to user3 = ",ethers.utils.formatUnits(LFITokenBalanceUser3,0))

    })

    
})