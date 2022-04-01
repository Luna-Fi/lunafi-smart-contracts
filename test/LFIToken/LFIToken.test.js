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
    
    
})