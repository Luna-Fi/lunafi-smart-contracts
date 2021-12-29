const { expect } = require("chai");

describe("USDC HousePool", () => {
   
    let MOCKUSDC
    let USDCCLAIMTOKEN
    let USDCHOUSEPOOL 
    let usdcHousePool
    let usdcClaimToken
    let mockUSDC

    before(async () => {
        
        const approvalAmount = 1000000 * 10**8
        const [owner,user1] = await ethers.getSigners()

        MOCKUSDC = await ethers.getContractFactory("mockUSDCToken")
        mockUSDC = await MOCKUSDC.deploy()
        await mockUSDC.deployed()
        console.log(" Mock USDC Token Address  : ", mockUSDC.address)
        
        USDCCLAIMTOKEN = await ethers.getContractFactory("USDCclaimToken")
        usdcClaimToken = await USDCCLAIMTOKEN.deploy()
        await usdcClaimToken.deployed()
        console.log(" USDC Claim Token Address : ", usdcClaimToken.address)

        USDCHOUSEPOOL = await ethers.getContractFactory("HousePoolUSDC")
        usdcHousePool = await USDCHOUSEPOOL.deploy(owner.address,mockUSDC.address,usdcClaimToken.address)
        await usdcHousePool.deployed()
        console.log(" USDC House Pool  Address  : ", usdcHousePool.address)

        await mockUSDC.approve(usdcHousePool.address, approvalAmount)
        await usdcClaimToken.approve(usdcHousePool.address,approvalAmount)
        await usdcClaimToken.addAdmin(usdcHousePool.address)

        await mockUSDC.connect(user1).approve(usdcHousePool.address, approvalAmount)
        await usdcClaimToken.connect(user1).approve(usdcHousePool.address,approvalAmount)
        await mockUSDC.transfer(user1.address,10000*10**6)
    })

    it(`Should allow the first user to deposit USDC Tokens into the house pool and get pool Tokens
         with the initial token price 100`, async () => {

        const [owner] = await ethers.getSigners()
        const amount = 5000 * 10**6
        let lpTokenPrice = 100 * 10**6
        
        await usdcHousePool.deposit(amount)
        const liquidity = await usdcHousePool.getLiquidityStatus()
        const TVLOfPool = await usdcHousePool.getTVLofPool()
        const LPTokenPrice = await usdcHousePool.getTokenPrice()
        const LpTokensIssued = await usdcClaimToken.balanceOf(owner.address)

        expect(liquidity.toNumber()).to.equal(amount)
        expect(TVLOfPool.toNumber()).to.equal(amount)
        expect(LPTokenPrice.toNumber()).to.equal(lpTokenPrice)   
        expect(LpTokensIssued.toNumber()).to.equal(amount/lpTokenPrice) 
    })

    it(`Should change the TVL value when EV value is added to the HousePool. 
        It should also change the token price`, async () => {

        const [owner] = await ethers.getSigners()
        const evValue = 15 * 10**6;
        const DataProviderValue = await usdcHousePool.HOUSE_POOL_DATA_PROVIDER()
        await usdcHousePool.grantRole(DataProviderValue,owner.address)

        await usdcHousePool.setEV(evValue)

        const TVLOfPool = await usdcHousePool.getTVLofPool()
        const liquidity = await usdcHousePool.getLiquidityStatus()
        const LPTokenPrice = await usdcHousePool.getTokenPrice()
        const LPTotalSupply = await usdcClaimToken.totalSupply()
        const LpTokenPrice = TVLOfPool.toNumber()/LPTotalSupply.toNumber()
        
        expect(TVLOfPool.toNumber()).to.equal(liquidity.toNumber() + evValue)
        expect(LPTokenPrice.toString()).to.equal(LpTokenPrice.toString())
        
    })

    it(`Should change allow any user to deposit into USDC Pool and get back LP tokens
        with the current LPToken Price`, async () => {
        
        const [owner,user1] = await ethers.getSigners();
        const amount = 10000 * 10**6
        const approvalAmount = 1000000 * 10**8

        const currentLPTokenPrice = await usdcHousePool.getTokenPrice()

        const currentTVLOfValue = await usdcHousePool.getTVLofPool()
        const currentLiquidity = await usdcHousePool.getLiquidityStatus()
        const currentClaimTokens = await usdcClaimToken.totalSupply()
        const currentBalanceOfUser = await usdcClaimToken.balanceOf(user1.address)
        const currentLPPrice = await usdcHousePool.getTokenPrice()
        
        await usdcHousePool.connect(user1).deposit(amount)

        const updatedTVlOfPool = await usdcHousePool.getTVLofPool()
        const updatedLiquidity = await usdcHousePool.getLiquidityStatus()
        const updatedclaimTokens = await usdcClaimToken.totalSupply()
        const updatedBalanceOfUser = await usdcClaimToken.balanceOf(user1.address)
        const updatedLPPrice = await usdcHousePool.getTokenPrice()
        
        expect(updatedTVlOfPool.toNumber()).to.equal(amount + currentTVLOfValue.toNumber())
        expect(updatedLiquidity.toNumber()).to.equal(currentLiquidity.toNumber() + amount);
        
    })
})
