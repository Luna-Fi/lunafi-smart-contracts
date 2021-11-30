const { expect } = require("chai");
const { smoddit, smockit } = require("@eth-optimism/smock");
const { BigNumber, ethers } = require("ethers");

describe("HousePoolContracts", () => {
  let testUSDCToken;
  let usdcclaimToken;

  beforeEach(async () => {
    const tUSDCToken = await ethers.getContractFactory("tUSDCToken");
    const USDCclaimToken = await ethers.getContractFactory("USDCclaimToken");
    testUSDCToken = await tUSDCToken.deploy();
    usdcclaimToken = await USDCclaimToken.deploy()
    await testUSDCToken.deployed();
    await usdcclaimToken.deployed(); 
  })

  
})