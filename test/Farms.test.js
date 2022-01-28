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
        //Deploy USDC Mock token
        MOCKUSDC = await ethers.getContractFactory("mockUSDCToken")
        mockUSDC = await MOCKUSDC.deploy()
        await mockUSDC.deployed()
        console.log(" Mock USDC Token Address = ", mockUSDC.address)
        //Deploy WBTC Mock token
        MOCKWBTC = await ethers.getContractFactory("mockWBTCToken")
        mockWBTC = await MOCKWBTC.deploy()
        await mockWBTC.deployed()
        console.log(" Mock WBTC Token Address = ", mockWBTC.address)
        //Deploy WETH Mock token
        MOCKWETH = await ethers.getContractFactory("mockWETHToken")
        mockWETH = await MOCKWETH.deploy()
        await mockWETH.deployed()
        console.log(" Mock WETH Token Address = ", mockWETH.address)
        // Deploy USDCClaimToken 
        USDCCLAIMTOKEN = await ethers.getContractFactory("USDCclaimToken")
        usdcClaimToken = await USDCCLAIMTOKEN.deploy()
        await usdcClaimToken.deployed()
        console.log(" USDC Claim Token Address = ", usdcClaimToken.address)
        // Deploy WBTCClaimToken
        WBTCCLAIMTOKEN = await ethers.getContractFactory("WBTCclaimToken")
        wbtcClaimToken = await WBTCCLAIMTOKEN.deploy()
        await wbtcClaimToken.deployed()
        console.log(" WBTC Claim Token Address = ", wbtcClaimToken.address)
        // Deploy WETHClaimToken
        WETHCLAIMTOKEN = await ethers.getContractFactory("WETHclaimToken")
        wethClaimToken = await WETHCLAIMTOKEN.deploy()
        await wethClaimToken.deployed()
        console.log(" WETH Claim Token Address = ", wethClaimToken.address)
        // Deploy USDCHousePool
        USDCHOUSEPOOL = await ethers.getContractFactory("HousePoolUSDC")
        usdcHousePool = await USDCHOUSEPOOL.deploy(owner.address,mockUSDC.address,usdcClaimToken.address, "USDCHP","1.0")
        await usdcHousePool.deployed()
        console.log(" USDC House Pool  Address = ", usdcHousePool.address)
        // Deploy WBTCHousePool
        WBTCHOUSEPOOL = await ethers.getContractFactory("HousePoolWBTC")
        wbtcHousePool = await WBTCHOUSEPOOL.deploy(owner.address,mockWBTC.address,wbtcClaimToken.address, "WBTCHP","1.0")
        await wbtcHousePool.deployed()
        console.log(" WBTC House Pool  Address = ", wbtcHousePool.address)
        // Deploy WETHHousePool
        WETHHOUSEPOOL = await ethers.getContractFactory("HousePoolWETH")
        wethHousePool = await WETHHOUSEPOOL.deploy(owner.address,mockWETH.address,wethClaimToken.address, "WETHHP","1.0")
        await wethHousePool.deployed()
        console.log(" WETH House Pool  Address = ", wethHousePool.address)
        // Deploy LFI Token
        LFITOKEN = await ethers.getContractFactory("LFIToken")
        lfiToken = await LFITOKEN.deploy()
        await lfiToken.deployed()
        console.log(" LFI Token Address = ", lfiToken.address)
        // Deploy LFI Fund Distributor
        FUND = await ethers.getContractFactory("FundDistributor")
        fund = await FUND.deploy(lfiToken.address)
        await fund.deployed()
        console.log(" FUND Contract Address = ", fund.address)
        // Deploy LFI Farms
        FARM = await ethers.getContractFactory("LFiFarms")
        farm = await FARM.deploy(owner.address,lfiToken.address,fund.address)
        await farm.deployed()
        console.log(" FARM Contract Address = ", farm.address)
        // Deploy LFI Rewarder
        REWARDER = await ethers.getContractFactory("Rewarder")
        rewarder = await REWARDER.deploy(lfiToken.address,rewardTokensPerSecond,farm.address)
        await rewarder.deployed()
        console.log(" REWARDER Contract address = ", rewarder.address)
        // Approval steps 
        mockUSDC.approve(usdcHousePool.address,approvalAmount)
        mockUSDC.connect(user1).approve(usdcHousePool.address,approvalAmount)
        mockUSDC.approve(fund.address,approvalAmount)
        mockUSDC.connect(user1).approve(fund.address,approvalAmount)
        mockUSDC.approve(farm.address,approvalAmount)
        mockUSDC.connect(user1).approve(farm.address,approvalAmount)
        mockUSDC.approve(rewarder.address,approvalAmount)
        mockUSDC.connect(user1).approve(rewarder.address,approvalAmount)

        mockWBTC.approve(wbtcHousePool.address,approvalAmount)
        mockWBTC.approve(fund.address,approvalAmount)
        mockWBTC.approve(farm.address,approvalAmount)
        mockWBTC.approve(rewarder.address,approvalAmount)

        mockWETH.approve(wethHousePool.address,approvalAmount)
        mockWETH.approve(fund.address,approvalAmount)
        mockWETH.approve(farm.address,approvalAmount)
        mockWETH.approve(rewarder.address,approvalAmount)

       
        lfiToken.approve(usdcHousePool.address,approvalAmount)
        lfiToken.connect(user1).approve(usdcHousePool.address,approvalAmount)
        lfiToken.approve(wbtcHousePool.address,approvalAmount)
        lfiToken.connect(user1).approve(wbtcHousePool.address,approvalAmount)
        lfiToken.approve(wethHousePool.address,approvalAmount)
        lfiToken.connect(user1).approve(wethHousePool.address,approvalAmount)
        lfiToken.approve(fund.address,approvalAmount)
        lfiToken.connect(user1).approve(fund.address,approvalAmount)
        lfiToken.approve(farm.address,approvalAmount)
        lfiToken.connect(user1).approve(farm.address,approvalAmount)
        lfiToken.approve(rewarder.address,approvalAmount)
        lfiToken.connect(user1).approve(rewarder.address,approvalAmount)

        usdcClaimToken.approve(usdcHousePool.address,approvalAmount)
        usdcClaimToken.connect(user1).approve(usdcHousePool.address,approvalAmount)
        usdcClaimToken.approve(fund.address,approvalAmount)
        usdcClaimToken.connect(user1).approve(fund.address,approvalAmount)
        usdcClaimToken.approve(farm.address,approvalAmount)
        usdcClaimToken.connect(user1).approve(farm.address,approvalAmount)
        usdcClaimToken.approve(rewarder.address,approvalAmount)
        usdcClaimToken.connect(user1).approve(rewarder.address,approvalAmount)

        wbtcClaimToken.approve(wbtcHousePool.address,approvalAmount)
        wbtcClaimToken.connect(user1).approve(wbtcHousePool.address,approvalAmount)
        wbtcClaimToken.approve(fund.address,approvalAmount)
        wbtcClaimToken.approve(farm.address,approvalAmount)
        wbtcClaimToken.approve(rewarder.address,approvalAmount)

        wethClaimToken.approve(wethHousePool.address,approvalAmount)
        wethClaimToken.connect(user1).approve(wethHousePool.address,approvalAmount)
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

        mockUSDC.transfer(user1.address,100000000000)
    })

    
    it(`Should be able to allow the owner to create a farm and set RewardTokens`, async () => {
        // Get Signers
        const [owner,user1] = await ethers.getSigners()
        // Alloc points for each Farm
        const allocPoint1 = 10
        const allocPoint2 = 40
        const allocPoint3 = 50
        const rewardTokensPerSecond = ethers.utils.formatUnits(returnBigNumber(11.5740740741 * 10 **18),0)
        // Creat Farm
        await farm.createFarm(allocPoint1,usdcClaimToken.address,rewarder.address)
        console.log("Rewards per second", rewardTokensPerSecond.toString())
        // Set rewardsPerSecond
        await farm.setRewardPerSecond(rewardTokensPerSecond)

    })

   it(`Should allow the user to deposit to the created farm`, async() => {
       // Get signers
       const [owner,user1] = await ethers.getSigners()
       
       // details to call the deposit on LFi Farms
       const fid = 0
       const lpAmountToDeposit = ethers.utils.formatUnits(returnBigNumber(10 * 10**18),0)
       
       // Amount to deposit in HousePool to get LPTokens.
       const HPDeposit = 10000000000
        
       //Deposit in HousePool.
       await usdcHousePool.connect(user1).deposit_(HPDeposit)
       
       // Get User details in LFi Farms before the deposit
       const userDetailsBeforeDeposit = await farm.userInfo(fid,user1.address)

       // Get Farms info in LFi Farms before deposit
       const farmInfoBeforeDeposit = await farm.farmInfo(fid)
       
       // LPToken balances and TotalSupply before depositing in LFiFarms.
       const totalLPTokenSupply = await usdcClaimToken.totalSupply()
       const userLPTokenBalance = await usdcClaimToken.balanceOf(user1.address);
       const lpTokenbalanceOfFarms = await usdcClaimToken.balanceOf(farm.address)
       
       // Deposit in LFi Farm 
       await farm.connect(user1).deposit(fid,lpAmountToDeposit,user1.address)
        
       // Get User details in LFi Farms after the deposit
       const userDetailsAfterDeposit = await farm.userInfo(fid,user1.address)
       
       // Get Farms info in LFi Farms before deposit
       const farmInfoAfterDeposit = await farm.farmInfo(fid)
       
       // LPToken balances after the deposit in LFi Farms
       const userLPTokenBalanceAfter = await usdcClaimToken.balanceOf(user1.address);
       const farmBalance = await usdcClaimToken.balanceOf(farm.address)
       
       // Log all the details
       console.log("========================================================================")
       console.log("LP Amount deposited = ",lpAmountToDeposit)
       console.log("LPToken Supply = ",ethers.BigNumber.from(totalLPTokenSupply).toString())
       console.log("User Balance = ",ethers.BigNumber.from(userLPTokenBalance).toString())
       console.log("Farm Balance = ",ethers.BigNumber.from(lpTokenbalanceOfFarms).toString())
       console.log("User amount in LFi farms before Deposit = ",userDetailsBeforeDeposit.amount.toString())
       console.log("User Rewards in LFi farms before Deposit = " ,userDetailsBeforeDeposit.rewardDebt.toString())
       console.log("Farms AccRewardPerShare before Deposit = ", farmInfoBeforeDeposit.accRewardPerShare.toString())
       console.log("Farms lastRewardTime before Deposit = ", farmInfoBeforeDeposit.lastRewardTime.toString())
       console.log("Farms allocPoint before Deposit = ", farmInfoBeforeDeposit.allocPoint.toString())
       console.log("User amount in LFi farms after Deposit = ",userDetailsAfterDeposit.amount.toString())
       console.log("User Rewards in LFi farms after Deposit = " ,userDetailsAfterDeposit.rewardDebt.toString())
       console.log("Farms AccRewardPerShare after Deposit = ", farmInfoAfterDeposit.accRewardPerShare.toString())
       console.log("Farms lastRewardTime after Deposit = ", farmInfoAfterDeposit.lastRewardTime.toString())
       console.log("Farms allocPoint after Deposit = ", farmInfoAfterDeposit.allocPoint.toString())
       console.log("User Balance After Deposit in Farms = ",ethers.BigNumber.from(userLPTokenBalanceAfter).toString())
       console.log("LPToken Balance of Farm = ",ethers.BigNumber.from(farmBalance).toString())
  
   })

   it("Should allow the user to harvest the rewards", async () => {
    //Get Signers
    const [owner,user1] = await ethers.getSigners()
  
    // Info for harvesting 
     const fid = 0
  
    // LFIToken totalSupply before harvesting
    const LFITokenTotalSupply = await lfiToken.totalSupply()
  
    //infomation of User before harvest.
    const userDetailsBeforeHarvest = await farm.userInfo(fid,user1.address)
  
    //Pending Rewards before Harvesting.
    const pendingRewardsBeforeHarvesting = await farm.pendingReward(fid,user1.address)
  
    //user LFIBalance before harvesting
    const userLFIBalancebeforeHarvesting = await lfiToken.balanceOf(user1.address)

    // TimeDelay 
    await network.provider.send("evm_increaseTime", [36000])
    await network.provider.send("evm_mine")

    // Transfer Tokens to FundDistributor 
    await lfiToken.transfer(fund.address,LFITokenTotalSupply.toString())
    //LFI Token balance of Fund Contract
    const balaceOfFundContract = await lfiToken.balanceOf(fund.address)
  
    // Harvest
    await fund.addRequester(farm.address)
    await farm.harvest(fid,user1.address)
  
    //Information of user after harvest.
    const userDetailsAfterHarvest = await farm.userInfo(fid,user1.address)
  
    //Pending Rewards after Harvesting 
    const pendingRewardsAfterHarvest = await farm.pendingReward(fid,user1.address)
  
    //LFIToken totalSupply after harvest
    const LFITokenTotalSupplyAfterHarvest = await lfiToken.totalSupply()
  
    //User LFI Balance after harveting 
    const userLFIBalanceAfterHarvesting = await lfiToken.balanceOf(user1.address)
  
    // Log all the details
    console.log("========================================================================")
    console.log("User amount before harvesting = ", userDetailsBeforeHarvest.amount.toString())
    console.log("User rewards before harvesting = ", userDetailsBeforeHarvest.rewardDebt.toString())
    console.log("Pending rewards before harvesting = ", pendingRewardsBeforeHarvesting.toString())
    console.log("LFIToken total Supply before harvesting = ", LFITokenTotalSupply.toString())
    console.log("LFI Token balance of Fund contract = " ,balaceOfFundContract.toString())
    console.log("User LFI Balance before harvesting = ", userLFIBalancebeforeHarvesting.toString())
    console.log("User amount after harvesting = ", userDetailsAfterHarvest.amount.toString())
    console.log("User reward after harvesting = ", userDetailsAfterHarvest.rewardDebt.toString())
    console.log("Pending Rewards after harvesting = ", pendingRewardsAfterHarvest.toString())
    console.log("LFIToken total supply after harvest = ",LFITokenTotalSupplyAfterHarvest.toString())
    console.log("User LFI Token balance after harvesting = ", userLFIBalanceAfterHarvesting.toString())

  })
   
   
//    it( `Should allow the user to withdraw the deposits`, async () => {
//     // Get Signers   
//     const [owner,user1] = await ethers.getSigners()
    
//     // User LPToken Balance before withdrawl
//     const userLPTokenBalanceBeforeWithdrawal = await usdcClaimToken.balanceOf(user1.address);
    
//     // Details to withdraw from LFi Farms
//     const fid = 0
//     const lpAmountToWithdraw = ethers.utils.formatUnits(returnBigNumber(10 * 10**18),0)

//     // User Details in LFI Farms before withdrawl
//     const userDetailsBeforeWithdrawl = await farm.userInfo(fid,user1.address)

//     // Farm Details in LFI Farms before withdrawl
//     const farmDetailsBeforeWithdrawl = await farm.farmInfo(fid)

//     // Pending rewards before Withdrawl
//     const pendingRewardsBeforeWithdrawl = await farm.pendingReward(fid,user1.address);

//     // TimeDelay 
//     await network.provider.send("evm_increaseTime", [100])
//     await network.provider.send("evm_mine")

//     // call withdraw function in LFi Farms
//     await farm.connect(user1).withdraw(fid,lpAmountToWithdraw,user1.address)
    
//     // User Details in LFI Farms after withdrawl
//     const userDetailsAfterWithdrawl = await farm.userInfo(fid,user1.address)
    
//     // Farm Details in LFI Farms after withdrawl
//     const farmDetailsAfterWithdrawl = await farm.farmInfo(fid)

//     //User LPToken Balance after withdrawl
//     const userLPTokenBalanceAfterWithdrawl = await usdcClaimToken.balanceOf(user1.address);

//     // Pending rewards after Withdrawl
//     const pendingRewardsAfterWithdrawl = await farm.pendingReward(fid,user1.address);
    
    
//     // Log all the details
//     console.log("========================================================================")
//     console.log("LPToken Amount to Withdraw = ", lpAmountToWithdraw)
//     console.log("User amount in LFi Farms before withdrawl = ", userDetailsBeforeWithdrawl.amount.toString())
//     console.log("User rewards in LFi Farms before withdrawl = ",userDetailsBeforeWithdrawl.rewardDebt.toString())
//     console.log("Farms AccRewardPerShare before withdrawl = ", farmDetailsBeforeWithdrawl.accRewardPerShare.toString())
//     console.log("Farms lastRewardTime before withdrawl = ", farmDetailsBeforeWithdrawl.lastRewardTime.toString())
//     console.log("Farms allocPoint before withdrawl = ", farmDetailsBeforeWithdrawl.allocPoint.toString())
//     console.log("User amount in LFi Farms after withdrawl = ",userDetailsAfterWithdrawl.amount.toString())
//     console.log("User rewards in LFi Farms after withdrawl = ",userDetailsAfterWithdrawl.rewardDebt.toString())
//     console.log("Farms AccRewardPerShare after withdrawl = ", farmDetailsAfterWithdrawl.accRewardPerShare.toString())
//     console.log("Farms lastRewardTime after withdrawl = ", farmDetailsAfterWithdrawl.lastRewardTime.toString())
//     console.log("Farms allocPoint after withdrawl = ", farmDetailsAfterWithdrawl.allocPoint.toString())
//     console.log("User LPToken balance before withdrawl = ",ethers.BigNumber.from(userLPTokenBalanceBeforeWithdrawal).toString())
//     console.log("User LPToken balance after withdrawl = ",ethers.BigNumber.from(userLPTokenBalanceAfterWithdrawl).toString())
//     console.log("Pending Rewards before withdrawl = ", pendingRewardsBeforeWithdrawl.toString())
//     console.log("Pending Rewards after withdrawl = ", pendingRewardsAfterWithdrawl.toString())
    
//     console.log(1157407407410*(farmDetailsAfterWithdrawl.lastRewardTime.toNumber() - farmDetailsBeforeWithdrawl.lastRewardTime.toNumber())) 
//     console.log(1157407407410*101)   
// })


})
