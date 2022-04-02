const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { ethers } = require("hardhat");
const { inTransaction } = require("openzeppelin-test-helpers/src/expectEvent");

const returnBigNumber = (number) => {
    number = number.toString(16)
    return BigNumber.from("0x" + number);
}

const getNumberFromStrBN = (str_bn, dec) => {
    let val = 0;
    for (let i = 0; i < str_bn.length; i++) {
       if (str_bn.substr(str_bn.length - 1 - i, 1) !== '0') {
          val = parseInt(str_bn.substr(0, str_bn.length - i)) / Math.pow(10, dec - i);
          break;
       }
    }
    return val;
 };

describe("LFI Token", () => {
    let LFIToken;
    let lfiToken;

    before(async() => {
        const [owner] = await ethers.getSigners()
        const supply = 1000000000
        LFIToken = await ethers.getContractFactory("LFIToken")
        lfiToken = await LFIToken.deploy(supply)
        console.log("LFI Token is deployed at :", lfiToken.address)
    })

    it("Should return the totalSupply", async() => {
        const [owner] = await ethers.getSigners();
        const totalSupply = await lfiToken.totalSupply();
        expect(totalSupply).to.equal("1000000000000000000000000000");
    })

    it("Should allow allow the user to query  token balance", async() => {
        const [owner] = await ethers.getSigners();
        const ownerBalance = await lfiToken.balanceOf(owner.address);
        expect(ownerBalance).to.equal("1000000000000000000000000000");
    })

    it("Should allow the pauser to stop the operations on the contract", async() => {
        const [owner,user1] = await ethers.getSigners();
        const amount = ethers.utils.formatUnits(returnBigNumber(100 * 10 **18),0)
        const pauserRole = ethers.utils.id("PAUSER_ROLE");
        await lfiToken.grantRole(pauserRole,owner.address);
        await lfiToken.pause();
        await expect(lfiToken.transfer(user1.address,amount)).to.be.revertedWith("")
    })
    
    it("Should allow the pauser to unpause the operations of the contract", async() => {
        const [owner,user1] = await ethers.getSigners();
        const amount = ethers.utils.formatUnits(returnBigNumber(100 * 10 **18),0)
        await lfiToken.unpause();
        await lfiToken.transfer(user1.address,amount)
        const balance = await lfiToken.balanceOf(user1.address)
        expect(balance.toString()).to.equal("100000000000000000000");
    })

    it("Should allow the user to get decimals", async() => {
        const decimals = await lfiToken.decimals()
        expect(decimals).to.equal(18)
    })

    it("Should allow the manager to revoke the role", async() => {
        const [owner] = await ethers.getSigners();
        const amount = ethers.utils.formatUnits(returnBigNumber(100 * 10 **18),0)
        const pauserRole = ethers.utils.id("PAUSER_ROLE");
        await lfiToken.revokeRole(pauserRole,owner.address)
        await expect(lfiToken.pause()).to.be.revertedWith("")
       
    })



    
    
})