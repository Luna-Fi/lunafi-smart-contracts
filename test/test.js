const { inputToConfig } = require("@ethereum-waffle/compiler")
const { expect } = require("chai")
const { ethers } = require("ethers")

describe("USDC HousePool Contract", () => {
   
  before("DeployContract", async () => {
    USDCClaimToken = await hre.ethers.getContractFactory("USDCclaimToken")
    TestUSDCToken = await hre.ethers.getContractFactory("tUSDCToken")
    UsdcHousePoolContract = await hre.ethers.getContractFactory("housePoolUSDC")

    usdcclaimtoken = await USDCClaimToken.deploy()
    testusdctoken = await TestUSDCTOken.deploy()
    usdchousepool = await UsdcHousePoolContract.deploy(testusdctoken.address,usdcclaimtoken.address)

    console.log("TestToken : ",testusdctoken.address)
    console.log("ClaimToken : ",usdcclaimtoken.address)
    console.log("HousePool : ",usdchousepool.address)

    uct = await usdcclaimtoken.deployed()
    tut = await testusdctoken.deployed()
    uhp = await usdchousepool.deployed()

  })

  beforeEach("Add housepool as a admin", async () => {
    await uct.connect(accounts[0]).addAdmin(usdchousepool.address)
  })

  it("Should allow the user to deposit USDC and get a proportionate amount of claimTokens in return", async () => {
    const amount = 100
    await uhp.deposit(amount)

    expect(uct.balanceOf(accounts[0]).to.equal(1))
  })
  
  
})