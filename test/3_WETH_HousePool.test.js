const { expect } = require("chai");
const { BigNumber} = require("ethers");

const returnBigNumber = (number) => {
    number = number.toString(16)
    return BigNumber.from("0x" + number);
}


describe("WBTC HousePool", () => {
   
    let MOCKWETH
    let WETHCLAIMTOKEN
    let WETHHOUSEPOOL 
    let wethHousePool
    let wethClaimToken
    let mockWETH

    before(async () => {
        
        const approvalAmount = returnBigNumber(1000000 * 10**18)
        const [owner,user1] = await ethers.getSigners()

        MOCKWETH = await ethers.getContractFactory("mockWETHToken")
        mockWETH = await MOCKWETH.deploy()
        await mockWETH.deployed()
        console.log(" Mock WETH Token Address  : ", mockWETH.address)
        WETHCLAIMTOKEN = await ethers.getContractFactory("WETHclaimToken")
        wethClaimToken = await WETHCLAIMTOKEN.deploy()
        await wethClaimToken.deployed()
        console.log(" WETH Claim Token Address : ", wethClaimToken.address)

        WETHHOUSEPOOL = await ethers.getContractFactory("HousePoolWETH")
        wethHousePool = await WETHHOUSEPOOL.deploy(owner.address,mockWETH.address,wethClaimToken.address, "","")
        await wethHousePool.deployed()
        console.log(" WETH House Pool  Address  : ", wethHousePool.address)

        await mockWETH.approve(wethHousePool.address, approvalAmount)
        await wethClaimToken.approve(wethHousePool.address,approvalAmount)
        await wethClaimToken.addAdmin(wethHousePool.address)

        await mockWETH.connect(user1).approve(wethHousePool.address, approvalAmount)
        await wethClaimToken.connect(user1).approve(wethHousePool.address,approvalAmount)
        await mockWETH.transfer(user1.address,100000*10**8)
    })

    it(` Should get the initial lpTokenPrice ald LPTokenWIthdrawlPrice on WBTCHousePool`, async () => {

        const [owner,user1] = await ethers.getSigners()
        const LPTokenPrice = await wethHousePool.getTokenPrice()
        const LPTokenWithdrawlPrice = await wethHousePool.getTokenWithdrawlPrice()
        console.log("Initial LPToken Price = ", LPTokenPrice.toString())
        console.log("Initial LPTokenWithdrawl Price = ",LPTokenWithdrawlPrice.toString())
    })

    it(`Should get the LPTOKEN price and LPTokenWithdrawalPrice on first Deposit`, async () => {
        const [owner,user1] = await ethers.getSigners()
        const deposit = returnBigNumber(1 * 10**18)
        await wethHousePool.deposit_(deposit)
        const LPTokenPrice = await wethHousePool.getTokenPrice()
        const LPTokenWithdrawlPrice = await wethHousePool.getTokenWithdrawlPrice()
        const LPTokenBalance = await wethClaimToken.balanceOf(owner.address)
        console.log("Initial LPToken Price = ", LPTokenPrice.toString())
        console.log("Initial LPTokenWithdrawl Price = ",LPTokenWithdrawlPrice.toString())
        console.log("LP Token balance = ", LPTokenBalance.toString())  
    })
    
    // it(`Should get the LPTOKEN price and LPTokenWithdrawalPrice on second Deposit`, async () => {
    //     const [owner,user1] = await ethers.getSigners()
    //     await wethHousePool.deposit_(2000*10**8)
    //     const LPTokenPrice = await wethHousePool.getTokenPrice()
    //     const LPTokenWithdrawlPrice = await wethHousePool.getTokenWithdrawlPrice()
    //     const LPTokenBalance = await wethClaimToken.balanceOf(owner.address)
    //     console.log("Initial LPToken Price = ", LPTokenPrice.toString())
    //     console.log("Initial LPTokenWithdrawl Price = ",LPTokenWithdrawlPrice.toString())
    //     console.log("LP Token balance = ", LPTokenBalance.toString()) 
        
    // })

    // it(`Should get the LPTOKEN price and LPTokenWithdrawalPrice on second Deposit`, async () => {
    //     const [owner,user1] = await ethers.getSigners()
    //     await wethHousePool.deposit_(3000*10**8)
    //     const LPTokenPrice = await wethHousePool.getTokenPrice()
    //     const LPTokenWithdrawlPrice = await wethHousePool.getTokenWithdrawlPrice()
    //     const LPTokenBalance = await wethClaimToken.balanceOf(owner.address)
    //     console.log("Initial LPToken Price = ", LPTokenPrice.toString())
    //     console.log("Initial LPTokenWithdrawl Price = ",LPTokenWithdrawlPrice.toString())
    //     console.log("LP Token balance = ", LPTokenBalance.toString())
        
    // }) 

    

})