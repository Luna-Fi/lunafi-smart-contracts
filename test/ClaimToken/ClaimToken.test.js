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

    it("Should now allow the non owner to remove admin", async() => {
        const [owner,user1,user2] = await ethers.getSigners();
        //await claimToken.connect(user1).addAdmin(user2.address)
        await expect(claimToken.connect(user1).removeAdmin(user2.address)).to.be.revertedWith("")
    })

    it("Should return weather an user is an admin or not", async () => {
        const [owner,user1] = await ethers.getSigners();
        await expect(claimToken.connect(user1).addAdmin(user1.address)).to.be.revertedWith("")
    })

    it("Should allow the admin to mint tokens and should not exceed maxCap", async () => {
        const [owner, user1] = await ethers.getSigners();
        const tokens = ethers.utils.formatUnits(returnBigNumber(10 * 10**18),0)
        await claimToken.addAdmin(owner.address)
        await claimToken.mint(user1.address,tokens)
        const totalSupplyAfterMint = await claimToken.totalSupply();
        expect(totalSupplyAfterMint ).to.be.equal(tokens);
        
    })


})