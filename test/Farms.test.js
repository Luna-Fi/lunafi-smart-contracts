const { expect } = require("chai")
const { network } = require("hardhat")
const { BigNumber} = require("ethers")

const returnBigNumber = (number) => {
    number = number.toString(16)
    return BigNumber.from("0x" + number)
}

const sleep = (milliseconds) => {
    const date =  Date.now();
    let currentDate = null;
    do {
        currentDate = Date.now()
    } while (currentDate - date < milliseconds)
} 

describe("Testing LFI Farms", () => {
    
    let MOCKUSDC; let MOCKWBTC; let MOCKWETH;
    let USDCCLAIMTOKEN; let WBTCCLAIMTOKEN; let WETHCLAIMTOKEN;
    let USDCHOUSEPOOL; let WBTCHOUSEPOOL; let WETHHOUSEPOOL;
    let LFITOKEN; let FARM; let FUND; let REWARDER;

    let mockUSDC; let mockWBTC; let mockWETH;
    let usdcClaimToken; let wbtcClaimToken; let wethClaimToken;
    let usdcHousePool; let wbtcHousePool; let wethHousePool;
    let lfiToken; let farm; let fund; let rewarder;

    before(async () => {
        const [owner, user1, user2, user3] = await ethers.getSigners()
        const approvalAmount = ethers.utils.formatUnits(returnBigNumber(10000000 * 10**18),0)
        const rewardTokensPerSecond = ethers.utils.formatUnits(returnBigNumber(11.5740740741 * 10 **18),0)

        // Deploy mock tokens.
        MOCKUSDC = await ethers.getContractFactory("mockUSDCToken")
        mockUSDC = await MOCKUSDC.deploy()
        await mockUSDC.deployed()
        console.log("Mock USDC Token = ", mockUSDC.address)

        MOCKWBTC = await ethers.getContractFactory("mockWBTCToken")
        mockWBTC = await MOCKWBTC.deploy()
        await mockWBTC.deployed()
        console.log("Mock WBTC Token = ", mockWBTC.address)

        MOCKWETH = await ethers.getContractFactory("mockWETHToken")
        mockWETH = await MOCKWETH.deploy()
        await mockWETH.deployed()
        console.log("mock WETH Token = ", mockWETH.address)

        // Deploy LP Token
        USDCCLAIMTOKEN = await ethers.getContractFactory("USDCclaimToken")
        usdcClaimToken = await USDCCLAIMTOKEN.deploy()
        await usdcClaimToken.deployed()
        console.log("USDC LP Token  = ", usdcClaimToken.address)

        WBTCCLAIMTOKEN = await ethers.getContractFactory("WBTCclaimToken")
        wbtcClaimToken = await WBTCCLAIMTOKEN.deploy()
        await wbtcClaimToken.deployed()
        console.log("WBTC LP Token  = ", wbtcClaimToken.address)

        WETHCLAIMTOKEN = await ethers.getContractFactory("WETHclaimToken")
        wethClaimToken = await WETHCLAIMTOKEN.deploy()
        await wethClaimToken.deployed()
        console.log("WETH LP Token  = ", wethClaimToken.address)

        // Deploy HousePool
        USDCHOUSEPOOL = await ethers.getContractFactory("HousePoolUSDC")
        usdcHousePool = await upgrades.deployProxy(USDCHOUSEPOOL, [owner.address, mockUSDC.address, usdcClaimToken.address, "", ""], { initializer: 'initialize' });

        await usdcHousePool.deployed()
        console.log("USDC HousePool = ", usdcHousePool.address)

        WBTCHOUSEPOOL = await ethers.getContractFactory("HousePoolWBTC")
        wbtcHousePool = await upgrades.deployProxy(WBTCHOUSEPOOL, [owner.address, mockWBTC.address, wbtcClaimToken.address, "", ""], { initializer: 'initialize' });

        await wbtcHousePool.deployed()
        console.log("WBTC HousePool = ", wbtcHousePool.address)

        WETHHOUSEPOOL = await ethers.getContractFactory("HousePoolWETH")
        wethHousePool = await upgrades.deployProxy(WETHHOUSEPOOL, [owner.address, mockWETH.address, wethClaimToken.address, "", ""], { initializer: 'initialize' });

        await wethHousePool.deployed()
        console.log("WETH HousePool = ", wethHousePool.address)

        // Deploy Farms
        LFITOKEN = await ethers.getContractFactory("LFIToken")
        lfiToken = await LFITOKEN.deploy()
        await lfiToken.deployed()
        console.log("LFI Token = ", lfiToken.address)

        FUND = await ethers.getContractFactory("FundDistributor")
        fund = await FUND.deploy(lfiToken.address)
        await fund.deployed()
        console.log("FUND = ", fund.address)

        FARM = await ethers.getContractFactory("LFiFarms")
        farm = await FARM.deploy(owner.address,lfiToken.address,fund.address)
        await farm.deployed()
        console.log("FARM = ", farm.address)

        REWARDER = await ethers.getContractFactory("Rewarder")
        rewarder = await REWARDER.deploy(lfiToken.address,rewardTokensPerSecond,farm.address)
        await rewarder.deployed()
        console.log("REWARDER = ", rewarder.address)

        // Approval Steps
        mockUSDC.approve(usdcHousePool.address,approvalAmount)
        mockUSDC.connect(user1).approve(usdcHousePool.address,approvalAmount)
        mockUSDC.connect(user2).approve(usdcHousePool.address,approvalAmount)
        mockUSDC.connect(user3).approve(usdcHousePool.address,approvalAmount)

        mockWBTC.approve(wbtcHousePool.address,approvalAmount)
        mockWBTC.connect(user1).approve(wbtcHousePool.address,approvalAmount)
        mockWBTC.connect(user2).approve(wbtcHousePool.address,approvalAmount)
        mockWBTC.connect(user3).approve(wbtcHousePool.address,approvalAmount)

        mockWETH.approve(wethHousePool.address,approvalAmount)
        mockWETH.connect(user1).approve(wethHousePool.address,approvalAmount)
        mockWETH.connect(user2).approve(wethHousePool.address,approvalAmount)
        mockWETH.connect(user3).approve(wethHousePool.address,approvalAmount)

        lfiToken.approve(fund.address,approvalAmount)
        lfiToken.connect(user1).approve(fund.address,approvalAmount)
        lfiToken.connect(user2).approve(fund.address,approvalAmount)
        lfiToken.connect(user3).approve(fund.address,approvalAmount)

        usdcClaimToken.approve(farm.address,approvalAmount)
        usdcClaimToken.connect(user1).approve(farm.address,approvalAmount)
        usdcClaimToken.connect(user2).approve(farm.address,approvalAmount)
        usdcClaimToken.connect(user3).approve(farm.address,approvalAmount)

        wbtcClaimToken.approve(farm.address,approvalAmount)
        wbtcClaimToken.connect(user1).approve(farm.address,approvalAmount)
        wbtcClaimToken.connect(user2).approve(farm.address,approvalAmount)
        wbtcClaimToken.connect(user3).approve(farm.address,approvalAmount)

        wethClaimToken.approve(farm.address,approvalAmount)
        wethClaimToken.connect(user1).approve(farm.address,approvalAmount)
        wethClaimToken.connect(user2).approve(farm.address,approvalAmount)
        wethClaimToken.connect(user3).approve(farm.address,approvalAmount)

        usdcClaimToken.approve(usdcHousePool.address,approvalAmount)
        usdcClaimToken.connect(user1).approve(usdcHousePool.address,approvalAmount)
        usdcClaimToken.connect(user2).approve(usdcHousePool.address,approvalAmount)
        usdcClaimToken.connect(user3).approve(usdcHousePool.address,approvalAmount)

        wbtcClaimToken.approve(wbtcHousePool.address,approvalAmount)
        wbtcClaimToken.connect(user1).approve(wbtcHousePool.address,approvalAmount)
        wbtcClaimToken.connect(user2).approve(wbtcHousePool.address,approvalAmount)
        wbtcClaimToken.connect(user3).approve(wbtcHousePool.address,approvalAmount)

        wethClaimToken.approve(wethHousePool.address,approvalAmount)
        wethClaimToken.connect(user1).approve(wethHousePool.address,approvalAmount)
        wethClaimToken.connect(user2).approve(wethHousePool.address,approvalAmount)
        wethClaimToken.connect(user3).approve(wethHousePool.address,approvalAmount)

        usdcClaimToken.addAdmin(usdcHousePool.address)
        wbtcClaimToken.addAdmin(wbtcHousePool.address)
        wethClaimToken.addAdmin(wethHousePool.address)

        mockUSDC.transfer(user1.address,10000000000)
        mockWBTC.transfer(user2.address,1000000000000)
        mockWETH.transfer(user3.address,ethers.utils.formatUnits(returnBigNumber(10000* 10 **18),0))
        await fund.addRequester(farm.address)
    })
    it(`Should allow the owner to create Farms and set RewardsPerSecond`, async () => {
        const [owner] = await ethers.getSigners()
        // Alloc Points for each Farm
        const USDCFarmAllocPoints = 50
        const WBTCFarmAllocPoints = 10
        const WETHFarmAllocPoints = 40
        //const rewardsPerSecond = ethers.utils.formatUnits(returnBigNumber(11.5740740741 * 10 **18),0)
        const rewardsPerSecond = ethers.utils.formatUnits(returnBigNumber(10 * 10 **18),0)
        const fids = [0,1,2]
        // Create Farms
        await farm.createFarm(USDCFarmAllocPoints,usdcClaimToken.address)
        await farm.createFarm(WBTCFarmAllocPoints,wbtcClaimToken.address)
        await farm.createFarm(WETHFarmAllocPoints,wethClaimToken.address)

        // set rewardsPer Second 
        await farm.setRewardPerSecond(rewardsPerSecond,fids)
        const farmsCount = await farm.farmLength()
        const rewards = await farm.rewardPerSecond()

        expect(ethers.utils.formatUnits(farmsCount)).to.equal(ethers.utils.formatUnits(3))
        expect(ethers.utils.formatUnits(rewards)).to.equal(ethers.utils.formatUnits(rewardsPerSecond))    
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

        const USDCLPFarmBalance = await usdcClaimToken.balanceOf(farm.address)
        const WBTCLPFarmBalance = await usdcClaimToken.balanceOf(farm.address)
        const WETHLPFarmBalance = await usdcClaimToken.balanceOf(farm.address)

        console.log(USDCLPFarmBalance.toString())
        console.log(WBTCLPFarmBalance.toString())
        console.log(WETHLPFarmBalance.toString())
        
    })

    it(`Should allow the user to withdraw LPTokens and Harvest Rewards`, async () => {
        const [owner,user1,user2,user3] = await ethers.getSigners()
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