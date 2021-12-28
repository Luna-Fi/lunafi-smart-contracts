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

        mockUSDC = await ethers.getContractFactory("mockUSDCToken")
        mock_usdc = await mockUSDC.deploy()
        await mock_usdc.deployed()
        console.log(" Mock USDC Token Address : ", mock_usdc.address)
        
        USDCClaimToken = await ethers.getContractFactory("USDCclaimToken")
        usdc_claim_token = await USDCClaimToken.deploy()
        await usdc_claim_token.deployed()
        console.log(" USDC Claim Token Address : ", usdc_claim_token.address)

        USDCHousePool = await ethers.getContractFactory("HousePoolUSDC")
        usdc_house_pool = await USDCHousePool.deploy(mock_usdc.address,usdc_claim_token.address)
        await usdc_house_pool.deployed()
        console.log(" USDC House Pool  Address : ", usdc_house_pool.address)

        await mock_usdc.approve(usdc_house_pool.address, approvalAmount)
        await usdc_claim_token.approve(usdc_house_pool.address,approvalAmount)
        await usdc_claim_token.addAdmin(usdc_house_pool.address)

    })

    it("Should allow any user to deposit USDC Tokens in the house pool", async () => {
        const [owner,user1,user2] = await ethers.getSigners()
        const amount = 5000 * 10**8
        await usdc_house_pool.deposit(amount)
        const liquidity = await usdc_house_pool.getLiquidityStatus()
        console.log(liquidity)
    })
})