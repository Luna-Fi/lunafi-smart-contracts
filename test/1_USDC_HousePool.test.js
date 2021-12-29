const { expect } = require("chai");

describe("USDC HousePool", () => {
   
    let mockUSDC
    let USDCClaimToken
    let USDCHousePool 
    let usdc_house_pool
    let usdc_claim_token
    let mock_usdc

    before(async () => {
        
        const approvalAmount = 1000000 * 10**8
        const [owner,user1] = await ethers.getSigners()

        mockUSDC = await ethers.getContractFactory("mockUSDCToken")
        mock_usdc = await mockUSDC.deploy()
        await mock_usdc.deployed()
        console.log(" Mock USDC Token Address  : ", mock_usdc.address)
        
        USDCClaimToken = await ethers.getContractFactory("USDCclaimToken")
        usdc_claim_token = await USDCClaimToken.deploy()
        await usdc_claim_token.deployed()
        console.log(" USDC Claim Token Address : ", usdc_claim_token.address)

        USDCHousePool = await ethers.getContractFactory("HousePoolUSDC")
        usdc_house_pool = await USDCHousePool.deploy(owner.address,mock_usdc.address,usdc_claim_token.address)
        await usdc_house_pool.deployed()
        console.log(" USDC House Pool  Address  : ", usdc_house_pool.address)

        await mock_usdc.approve(usdc_house_pool.address, approvalAmount)
        await usdc_claim_token.approve(usdc_house_pool.address,approvalAmount)
        await usdc_claim_token.addAdmin(usdc_house_pool.address)

        await mock_usdc.connect(user1).approve(usdc_house_pool.address, approvalAmount)
        await usdc_claim_token.connect(user1).approve(usdc_house_pool.address,approvalAmount)
        await mock_usdc.transfer(user1.address,10000*10**6)
    })

    it(`Should allow the first user to deposit USDC Tokens into the house pool and get pool Tokens
         with the initial token price 100`, async () => {

        const [owner] = await ethers.getSigners()
        const amount = 5000 * 10**6
        let lpTokenPrice = 100 * 10**6
        
        await usdc_house_pool.deposit(amount)
        const liquidity = await usdc_house_pool.getLiquidityStatus()
        const TVLOfPool = await usdc_house_pool.getTVLofPool()
        const LPTokenPrice = await usdc_house_pool.getTokenPrice()
        const LpTokensIssued = await usdc_claim_token.balanceOf(owner.address)

        expect(liquidity.toNumber()).to.equal(amount)
        expect(TVLOfPool.toNumber()).to.equal(amount)
        expect(LPTokenPrice.toNumber()).to.equal(lpTokenPrice)   
        expect(LpTokensIssued.toNumber()).to.equal(amount/lpTokenPrice) 
    })

    it(`Should change the TVL value when EV value is added to the HousePool. 
        It should also change the token price`, async () => {

        const [owner] = await ethers.getSigners()
        const evValue = 15 * 10**6;
        const DataProviderValue = await usdc_house_pool.HOUSE_POOL_DATA_PROVIDER()
        await usdc_house_pool.grantRole(DataProviderValue,owner.address)

        await usdc_house_pool.setEV(evValue)

        const TVLOfPool = await usdc_house_pool.getTVLofPool()
        const liquidity = await usdc_house_pool.getLiquidityStatus()
        const LPTokenPrice = await usdc_house_pool.getTokenPrice()
        const LPTotalSupply = await usdc_claim_token.totalSupply()
        const LpTokenPrice = TVLOfPool.toNumber()/LPTotalSupply.toNumber()
        
        expect(TVLOfPool.toNumber()).to.equal(liquidity.toNumber() + evValue)
        expect(LPTokenPrice.toString()).to.equal(LpTokenPrice.toString())
        
    })

    it(`Should change allow any user to deposit into USDC Pool and get back LP tokens
        with the current LPToken Price`, async () => {
        
        const [owner,user1] = await ethers.getSigners();
        const amount = 10000 * 10**6
        const approvalAmount = 1000000 * 10**8

        const currentLPTokenPrice = await usdc_house_pool.getTokenPrice()

        const currentTVLOfValue = await usdc_house_pool.getTVLofPool()
        const currentLiquidity = await usdc_house_pool.getLiquidityStatus()
        const currentClaimTokens = await usdc_claim_token.totalSupply()
        const currentBalanceOfUser = await usdc_claim_token.balanceOf(user1.address)
        const currentLPPrice = await usdc_house_pool.getTokenPrice()
        console.log("Current LP Price",currentLPPrice.toNumber())

        await usdc_house_pool.connect(user1).deposit(amount)

        const updatedTVlOfPool = await usdc_house_pool.getTVLofPool()
        const updatedLiquidity = await usdc_house_pool.getLiquidityStatus()
        const updatedclaimTokens = await usdc_claim_token.totalSupply()
        const updatedBalanceOfUser = await usdc_claim_token.balanceOf(user1.address)
        const updatedLPPrice = await usdc_house_pool.getTokenPrice()
        
        expect(updatedTVlOfPool.toNumber()).to.equal(amount + currentTVLOfValue.toNumber())
        expect(updatedLiquidity.toNumber()).to.equal(currentLiquidity.toNumber() + amount);
        
    })
})
