const { expect } = require("chai");
const { ethers } = require("ethers");

describe("USDC HousePool", () => {
   
    let mockUSDC
    let USDCClaimToken
    let USDCHousePool 
    let usdc_house_pool
    let usdc_claim_token
    let mock_usdc

    before(async () => {
        
        const approvalAmount = 1000000 * 10**8

        mockUSDC = await ethers.getContractFactory("mockUSDCToken")
        mock_usdc = await mockUSDC.deploy()
        await mock_usdc.deployed()
        console.log(" Mock USDC Token Address  : ", mock_usdc.address)
        
        USDCClaimToken = await ethers.getContractFactory("USDCclaimToken")
        usdc_claim_token = await USDCClaimToken.deploy()
        await usdc_claim_token.deployed()
        console.log(" USDC Claim Token Address : ", usdc_claim_token.address)

        USDCHousePool = await ethers.getContractFactory("HousePoolUSDC")
        usdc_house_pool = await USDCHousePool.deploy(mock_usdc.address,usdc_claim_token.address)
        await usdc_house_pool.deployed()
        console.log(" USDC House Pool  Address  : ", usdc_house_pool.address)

        await mock_usdc.approve(usdc_house_pool.address, approvalAmount)
        await usdc_claim_token.approve(usdc_house_pool.address,approvalAmount)
        await usdc_claim_token.addAdmin(usdc_house_pool.address)

    })

    it(`Should allow the first user to deposit USDC Tokens into the house pool and get pool Tokens
         with the initial token price 100`, async () => {

        const [owner] = await ethers.getSigners()
        const amount = 5000 * 10**8
        let lpTokenPrice = 100
        
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
        It should also change the token p`, async () => {

        const owner = await ethers.getSigners()
        const evValue = 15 * 10**8;

        await usdc_house_pool.setEV(evValue)

        const TVLOfPool = await usdc_house_pool.getTVLofPool()
        const liquidity = await usdc_house_pool.getLiquidityStatus()
        const LPTokenPrice = await usdc_house_pool.getTokenPrice()

        expect(TVLOfPool.toNumber()).to.equal(liquidity.toNumber() + evValue)
        





    })
})