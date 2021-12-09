const { inputToConfig } = require("@ethereum-waffle/compiler")
const { expect } = require("chai")

describe("USDCHousePool", (accounts) => {

  before("Deploy contract", async () => {
    USDCClaimToken = await ethers.getContractFactory("USDCclaimToken")
    usdcclaimtoken = await USDCClaimToken.deploy("UCTOKEN", "UCT", 6)

    TestUSDCToken = await ethers.getContractFactory("tUSDCToken")
    testusdctoken = await TestUSDCToken.deploy()

    UsdcHousePoolContract = await hre.ethers.getContractFactory("housePoolUSDC")
    usdchousepool = await UsdcHousePoolContract.deploy(testusdctoken.address, usdcclaimtoken.address)

    const usdchouspoolAddress = await usdchousepool.address
    await usdcclaimtoken.approve(usdchouspoolAddress, 1000000000000000)
    await testusdctoken.approve(usdchouspoolAddress, 1000000000000000)

  })

  it("Should add the housePool Contract address as admin in claimToken contract", async () => {

    const usdchouspoolAddress = await usdchousepool.address
    await usdcclaimtoken.addAdmin(usdchouspoolAddress)

    const isAdmin = await usdcclaimtoken.isAdmin(usdchouspoolAddress)
    expect(isAdmin).equal(true)

  })

  it("Should allow the LunaFi users to depoist USDC into HousePool Contract", async () => {
    const [owner, account1, account2, account3] = await ethers.getSigners()
    const usdcToDeposit = 100 * 10 ** 6
    const usdcToDepoistforUser1 = 120 * 10 ** 6
    const usdcToDepositforUser2 = 5000 * 10 ** 6
    const usdcToDepositforUser3 = 235 * 10 ** 6

    await usdchousepool.connect(owner).deposit(usdcToDeposit)
    await usdchousepool.connect(account1).deposit(usdcToDepoistforUser1)
    await usdchousepool.connect(account2).deposit(usdcToDepositforUser2)
    await usdchousepool.connect(account3).deposit(usdcToDepositforUser3)

    const balanceInClaimToken = await usdcclaimtoken.balanceOf(owner.address)
    const balanceInClaimTokenNumber = ethers.BigNumber.from(balanceInClaimToken).toNumber()
    const balanceinHousePool = await usdchousepool.getMyBalance()
    expect(ethers.BigNumber.from(balanceinHousePool).toNumber()).to.equal(usdcToDeposit)
    expect(balanceInClaimTokenNumber).to.equal(1)

  })
})