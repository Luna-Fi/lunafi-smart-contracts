const { expect } = require("chai");
const { BigNumber} = require("ethers");

const returnBigNumber = (number) => {
    number = number.toString(16)
    return BigNumber.from("0x" + number);
}


describe("WBTC HousePool", () => {
   
    let MOCKWBTC
    let WBTCCLAIMTOKEN
    let WBTCHOUSEPOOL 
    let wbtcHousePool
    let wbtcClaimToken
    let mockWBTC

    before(async () => {
        
        const approvalAmount = 1000000 * 10**8
        const [owner,user1] = await ethers.getSigners()

        MOCKWBTC = await ethers.getContractFactory("mockWBTCToken")
        mockWBTC = await MOCKWBTC.deploy()
        await mockWBTC.deployed()
        console.log(" Mock WBTC Token Address  : ", mockWBTC.address)
        WBTCCLAIMTOKEN = await ethers.getContractFactory("WBTCclaimToken")
        wbtcClaimToken = await WBTCCLAIMTOKEN.deploy()
        await wbtcClaimToken.deployed()
        console.log(" WBTC Claim Token Address : ", wbtcClaimToken.address)

        WBTCHOUSEPOOL = await ethers.getContractFactory("HousePoolWBTC")
        wbtcHousePool = await WBTCHOUSEPOOL.deploy(owner.address,mockWBTC.address,wbtcClaimToken.address, "","")
        await wbtcHousePool.deployed()
        console.log(" WBTC House Pool  Address  : ", wbtcHousePool.address)

        await mockWBTC.approve(wbtcHousePool.address, approvalAmount)
        await wbtcClaimToken.approve(wbtcHousePool.address,approvalAmount)
        await wbtcClaimToken.addAdmin(wbtcHousePool.address)

        await mockWBTC.connect(user1).approve(wbtcHousePool.address, approvalAmount)
        await wbtcClaimToken.connect(user1).approve(wbtcHousePool.address,approvalAmount)
        await mockWBTC.transfer(user1.address,100000*10**6)
    })

    it(` Should get the initial lpTokenPrice ald LPTokenWIthdrawlPrice on WBTCHousePool`, async () => {

        const [owner,user1] = await ethers.getSigners()
        const LPTokenPrice = await wbtcHousePool.getTokenPrice()
        const LPTokenWithdrawlPrice = await wbtcHousePool.getTokenWithdrawlPrice()
        console.log("Initial LPToken Price = ", LPTokenPrice.toString())
        console.log("Initial LPTokenWithdrawl Price = ",LPTokenWithdrawlPrice.toString())
    })

    it(`Should get the LPTOKEN price and LPTokenWithdrawalPrice on first Deposit`, async () => {
        const [owner,user1] = await ethers.getSigners()
        await wbtcHousePool.deposit_(1*10**8)
        const LPTokenPrice = await wbtcHousePool.getTokenPrice()
        const LPTokenWithdrawlPrice = await wbtcHousePool.getTokenWithdrawlPrice()
        const LPTokenBalance = await wbtcClaimToken.balanceOf(owner.address)
        console.log("Initial LPToken Price = ", LPTokenPrice.toString())
        console.log("Initial LPTokenWithdrawl Price = ",LPTokenWithdrawlPrice.toString())
        console.log("LP Token balance = ", LPTokenBalance.toString())  
    })
    
    it(`Should get the LPTOKEN price and LPTokenWithdrawalPrice on second Deposit`, async () => {
        const [owner,user1] = await ethers.getSigners()
        await wbtcHousePool.deposit_(2000*10**8)
        const LPTokenPrice = await wbtcHousePool.getTokenPrice()
        const LPTokenWithdrawlPrice = await wbtcHousePool.getTokenWithdrawlPrice()
        const LPTokenBalance = await wbtcClaimToken.balanceOf(owner.address)
        console.log("Initial LPToken Price = ", LPTokenPrice.toString())
        console.log("Initial LPTokenWithdrawl Price = ",LPTokenWithdrawlPrice.toString())
        console.log("LP Token balance = ", LPTokenBalance.toString())
        
    })

    it(`Should get the LPTOKEN price and LPTokenWithdrawalPrice on second Deposit`, async () => {
        const [owner,user1] = await ethers.getSigners()
        await wbtcHousePool.deposit_(3000*10**8)
        const LPTokenPrice = await wbtcHousePool.getTokenPrice()
        const LPTokenWithdrawlPrice = await wbtcHousePool.getTokenWithdrawlPrice()
        const LPTokenBalance = await wbtcClaimToken.balanceOf(owner.address)
        console.log("Initial LPToken Price = ", LPTokenPrice.toString())
        console.log("Initial LPTokenWithdrawl Price = ",LPTokenWithdrawlPrice.toString())
        console.log("LP Token balance = ", LPTokenBalance.toString())
        
    }) 

})

 