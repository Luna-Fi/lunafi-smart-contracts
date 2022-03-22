const { expect } = require("chai");
const { BigNumber } = require("ethers");

const returnBigNumber = (number) => {
    number = number.toString(16)
    return BigNumber.from("0x" + number);
}

describe("HousePool", () => {
    let HousePool
    let housePool
    let MockToken 
    let mockToken 
    let ClaimToken
    let claimToken

    before(async () => {
        const [owner] = await ethers.getSigners()
        const PoolTokenPrice = ethers.utils.formatUnits(returnBigNumber(100 * 10**18),0)
        const PoolWithdrawalPrice =  ethers.utils.formatUnits(returnBigNumber(100 * 10**18),0)
        MockToken = await  ethers.getContractFactory("mockUSDCToken")
        HousePool = await ethers.getContractFactory("HousePool")
        ClaimToken = await ethers.getContractFactory("claimToken")
        
        mockToken = await MockToken.deploy()
        claimToken = await ClaimToken.deploy("USDCCLIAM","USDCLP")
        housePool = await upgrades.deployProxy(HousePool,["USDCPOOL",mockToken.address,claimToken.address,PoolTokenPrice,PoolWithdrawalPrice,12],{initializer: 'initialize'});

        console.log(" The Address of Mock Token is ", mockToken.address)
        console.log(" The Address of Claim Token is ", claimToken.address)
        console.log(" The Address of USDC HousePool is ", housePool.address)

        const approvalAmount = ethers.utils.formatUnits(returnBigNumber(10000000 * 10**18),0)
        await mockToken.approve(housePool.address, approvalAmount)
        await claimToken.approve(housePool.address,approvalAmount)
        await claimToken.addAdmin(housePool.address)
    
    })

    it(" Should allow the user to deposit USDC Tokens and get USDC Claim Tokens in return", async () => {
        const amount = ethers.utils.formatUnits(returnBigNumber(10000 * 10**6),0)
        const amountToVerify = ethers.utils.formatUnits(returnBigNumber(10000 * 10**18),0)
        const claimTokensToVerify = ethers.utils.formatUnits(returnBigNumber(100 * 10**18),0)
        
        await housePool.deposit_(amount);
        const liquidity = ethers.utils.formatUnits(await housePool.getLiquidityStatus(), 0)
        const claimTokensIssued = ethers.utils.formatUnits(await claimToken.totalSupply(),0)
        expect(liquidity).to.equal(amountToVerify)
        expect(claimTokensIssued).to.equal(claimTokensToVerify)
    })

    it(" Should allow the user to withdraw USDC Tokens and should burn the claimTokens ", async () => {
        const amount = ethers.utils.formatUnits(returnBigNumber(10000 * 10**6),0)
        const amountToVerify = ethers.utils.formatUnits(returnBigNumber(0 * 10**18),0)
        const claimTokensToVerify = ethers.utils.formatUnits(returnBigNumber(0 * 10**18),0)
        
        await housePool.withdraw_(amount);
        const liquidity = ethers.utils.formatUnits(await housePool.getLiquidityStatus(), 0)
        const claimTokensIssued = ethers.utils.formatUnits(await claimToken.totalSupply(),0)
        expect(liquidity).to.equal(amountToVerify)
        expect(claimTokensIssued).to.equal(claimTokensToVerify)
    })
    
})