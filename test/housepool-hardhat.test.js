const { inputToConfig } = require("@ethereum-waffle/compiler")
const { expect } = require("chai")

describe("USDCHousePool", (accounts) => {

  before("Deploy contract", async () => {
    USDCClaimToken = await ethers.getContractFactory("USDCclaimToken")
    usdcclaimtoken = await USDCClaimToken.deploy("UCTOKEN","UCT",6)
    
    TestUSDCToken = await ethers.getContractFactory("tUSDCToken")
    testusdctoken = await TestUSDCToken.deploy()
   
    UsdcHousePoolContract = await hre.ethers.getContractFactory("housePoolUSDC")
    usdchousepool = await UsdcHousePoolContract.deploy(testusdctoken.address,usdcclaimtoken.address)

    const usdchouspoolAddress = await usdchousepool.address 
    await usdcclaimtoken.approve(usdchouspoolAddress,1000000000000000)
    await testusdctoken.approve(usdchouspoolAddress,1000000000000000)
  
  })

  it("Should add the housePool Contract address as admin in claimToken contract", async () => {
    
    const usdchouspoolAddress = await usdchousepool.address   
    await usdcclaimtoken.addAdmin(usdchouspoolAddress)
    //check it the housepool address is added as an admin
    const isAdmin = await usdcclaimtoken.isAdmin(usdchouspoolAddress)
    expect(isAdmin).equal(true)
    
  })

  it("Should allow the LunaFi users to depoist USDC into HousePool Contract", async () => {
    
    const [owner, account1, account2, account3] = await ethers.getSigners()
    const usdcToDeposit = 100

    await usdchousepool.connect(owner).deposit(usdcToDeposit)
    // This can be verified by checking the balance of the user in housepool. And user's balance in claimToken.
    const balanceInClaim = await usdcclaimtoken.balanceOf(owner.address)
    
  })
  

  
})