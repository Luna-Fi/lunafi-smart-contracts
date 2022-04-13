const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { ethers } = require("hardhat");
const { inTransaction } = require("openzeppelin-test-helpers/src/expectEvent");

const returnBigNumber = (number) => {
    number = number.toString(16)
    return BigNumber.from("0x" + number);
}

describe("Claim Token", () => {
    let ClaimToken;
    let claimToken;

    before(async() => {

        const [owner] = await ethers.getSigners()
        const tokenName = "USDCClaimToken";
        const tokenSymbol = "USDCClaimToken"
        ClaimToken = await ethers.getContractFactory("claimToken")
        claimToken = await ClaimToken.deploy(tokenName,tokenSymbol);
        console.log("Claim Token is deployed at Address", claimToken.address);
    })

    it("Should allow the owner of the contract to addAdmin",async() => {
        const [owner,user1] = await ethers.getSigners();
        await claimToken.connect(owner).addAdmin(user1.address)
        // Check if user1 is admin or not.
        const isAdmin = await claimToken.isAdmin(user1.address)
        expect(isAdmin).equal(true);
    })

    it("Should now allow the non owner to add admin", async() => {
        const [owner,user1,user2] = await ethers.getSigners();
        //await claimToken.connect(user1).addAdmin(user2.address)
        await expect(claimToken.connect(user1).addAdmin(user2.address)).to.be.revertedWith("")
    })

    it("Should allow the owner of the contract to removeAdmin",async() => {
        const [owner,user1] = await ethers.getSigners();
        await claimToken.connect(owner).removeAdmin(user1.address)
        // Check if user1 is admin or not.
        const isAdmin = await claimToken.isAdmin(user1.address)
        expect(isAdmin).equal(false);
    })

    it("Should not allow the non owner to remove admin", async() => {
        const [owner,user1,user2] = await ethers.getSigners();
        //await claimToken.connect(user1).addAdmin(user2.address)
        await expect(claimToken.connect(user1).removeAdmin(user2.address)).to.be.revertedWith("")
    })

    it("Should return weather an user is an admin or not", async () => {
        const [owner,user1] = await ethers.getSigners();
        await expect(claimToken.connect(user1).addAdmin(user1.address)).to.be.revertedWith("")
    })

    it("Should allow the admin to mint tokens", async () => {
        const [owner, user1] = await ethers.getSigners();
        const tokens = ethers.utils.formatUnits(returnBigNumber(10 * 10**18),0)
        await claimToken.addAdmin(owner.address)
        await claimToken.mint(user1.address,tokens)
        const totalSupplyAfterMint = await claimToken.totalSupply();
        expect(totalSupplyAfterMint ).to.be.equal(tokens);  
    })

    it("Should allow the admin to mint the tokens, but cannot exceed maxCap", async() => {
        const [owner, user1] = await ethers.getSigners();
        const tokens = ethers.utils.formatUnits(returnBigNumber(1000000001 * 10**18),0)
        await claimToken.addAdmin(owner.address)
        await expect(claimToken.mint(user1.address,tokens)).to.be.revertedWith("")
    })

    it("Should not allow the non owner to mint tokens", async () => {
        const [owner,user1] = await ethers.getSigners();
        const tokens = ethers.utils.formatUnits(returnBigNumber(20 * 10**18),0)
        await claimToken.addAdmin(owner.address)
        await expect(claimToken.connect(user1).mint(user1.address,tokens)).to.be.revertedWith("")
        
    })

    it("Should allow the token owner to burn tokens", async () => {
        const [owner,user1] = await ethers.getSigners();
        const tokensToBurn = ethers.utils.formatUnits(returnBigNumber(10 * 10**18),0)
        await claimToken.addAdmin(owner.address)
        const balanceOfUserBeforeBurn = await claimToken.balanceOf(user1.address);
        await claimToken.connect(user1).burn(user1.address,tokensToBurn)
        const BalanceAfterBurn =  await claimToken.balanceOf(user1.address);
        expect(BalanceAfterBurn).to.equal("0")
    })

    it("Should not allow the non owner to burn tokens", async () => {
        const [owner,user1] = await ethers.getSigners();
        const tokensToBurn = ethers.utils.formatUnits(returnBigNumber(10 * 10**18),0)
        await expect(claimToken.burn(user1.address,tokensToBurn)).to.be.revertedWith("")
        
    })

    it("Should allow the any user to transfer tokens to another user", async () => {
        const [owner,user1,user2] = await ethers.getSigners();
        const tokensToMint = ethers.utils.formatUnits(returnBigNumber(40 * 10**18),0)
        const tokensToTransfer = ethers.utils.formatUnits(returnBigNumber(10 * 10**18),0)
        await claimToken.addAdmin(owner.address)
        const balanceOfUser1 = await claimToken.balanceOf(user1.address)
        await claimToken.mint(user1.address,tokensToMint)
        const balanceOfUser1AfterMint = await claimToken.balanceOf(user1.address)
        await claimToken.connect(user1).transfer(user2.address,tokensToTransfer)
        const balanceOfUser2 = await claimToken.balanceOf(user2.address)
        expect(balanceOfUser2).to.equal(tokensToTransfer)

    })

    it("Should allow the user to return totalSupply", async() => {
        const totalSupply = await claimToken.totalSupply()
        expect(totalSupply).to.equal(ethers.utils.formatUnits(returnBigNumber(40 * 10**18),0));
    })

    it("Should return the balance of the given user", async() => {
        const [owner,user1,user2] = await ethers.getSigners();
        const balance = await claimToken.balanceOf(user1.address);
        expect(balance).to.equal(ethers.utils.formatUnits(returnBigNumber(30 * 10**18),0));
    })

    it("Should allow the user2 to spend user1s tokens", async() => {
        const [owner,user1,user2] = await ethers.getSigners();
        const tokensToUse = ethers.utils.formatUnits(returnBigNumber(50 * 10**18),0)
        const tokensToSend = ethers.utils.formatUnits(returnBigNumber(40 * 10**18),0)
        
        await claimToken.addAdmin(owner.address)
        await claimToken.mint(user1.address,tokensToUse)
        await claimToken.connect(user1).approve(user2.address,tokensToUse);
        await claimToken.connect(user2).transferFrom(user1.address,user2.address,tokensToSend)
        const balanceOfUser2 = await claimToken.balanceOf(user2.address);
        expect(balanceOfUser2).to.equal(ethers.utils.formatUnits(returnBigNumber(50 * 10**18),0));
    })

    it("Should allow the user to get the allowance", async() => {
        const [owner,user1,user2] = await ethers.getSigners();
        const allowance = await claimToken.allowance(user1.address,user2.address);
        expect(allowance).to.equal(ethers.utils.formatUnits(returnBigNumber(10 * 10**18),0));
    })
})