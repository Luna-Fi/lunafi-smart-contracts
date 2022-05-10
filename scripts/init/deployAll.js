const { BigNumber } = require("ethers");
const returnBigNumber = (number) => {
  number = number.toString(16)
  return BigNumber.from("0x" + number);
}
const USDCPoolTokenPrice = ethers.utils.formatUnits(returnBigNumber(100 * 10 ** 18), 0);
const WBTCPoolTokenPrice = ethers.utils.formatUnits(returnBigNumber(1 * 10 ** 16), 0);
const WETHPoolTokenPrice = ethers.utils.formatUnits(returnBigNumber(100 * 10 ** 17), 0);
const USDCPoolTokenWithdrawalPrice = ethers.utils.formatUnits(returnBigNumber(100 * 10 ** 18), 0);
const WBTCPoolTokenWithdrawalPrice = ethers.utils.formatUnits(returnBigNumber(1 * 10 ** 16), 0);
const WETHPoolTokenWithdrawalPrice = ethers.utils.formatUnits(returnBigNumber(100 * 10 ** 17), 0);
const USDCPrecision = 12;
const WBTCPrecision = 10;
const WETHPrecision = 0;

const sleep = (milliseconds) => {
  const date =  Date.now();
  let currentDate = null;
  do {
      currentDate = Date.now()
  } while (currentDate - date < milliseconds)
}


async function main() {
  const [owner, user1, user2, user3] = await ethers.getSigners()

  const MOCKUSDCTOKEN = await ethers.getContractFactory("mockUSDCToken");
  const mockUSDCToken = await MOCKUSDCTOKEN.deploy();
  const MOCKWBTCTOKEN = await ethers.getContractFactory("mockWBTCToken");
  const mockWBTCToken = await MOCKWBTCTOKEN.deploy();
  const MOCKWETHTOKEN = await ethers.getContractFactory("mockWETHToken");
  const mockWETHToken = await MOCKWETHTOKEN.deploy();

  const CLAIMTOKEN = await ethers.getContractFactory("claimToken");
  const usdcClaimToken = await CLAIMTOKEN.deploy('LFUSDCLP', 'LFUSDCLP');
  const wbtcClaimToken = await CLAIMTOKEN.deploy('LFWBTCLP', 'LFWBTCLP');
  const wethClaimToken = await CLAIMTOKEN.deploy('LFWETHLP', 'LFWETHLP');

  const HOUSEPOOL = await ethers.getContractFactory("HousePool");
  console.log("Deploying HousePools...");
  const usdcHousePool = await upgrades.deployProxy(HOUSEPOOL, [mockUSDCToken.address, usdcClaimToken.address, USDCPoolTokenPrice, USDCPoolTokenWithdrawalPrice, USDCPrecision], { initializer: 'initialize' });
  console.log("USDC House Pool:", usdcHousePool.address);
  const wbtcHousePool = await upgrades.deployProxy(HOUSEPOOL, [mockWBTCToken.address, wbtcClaimToken.address, WBTCPoolTokenPrice, WBTCPoolTokenWithdrawalPrice, WBTCPrecision], { initializer: 'initialize' });
  console.log("WBTC House Pool:", wbtcHousePool.address);
  const wethHousePool = await upgrades.deployProxy(HOUSEPOOL, [mockWETHToken.address, wethClaimToken.address, WETHPoolTokenPrice, WETHPoolTokenWithdrawalPrice, WETHPrecision], { initializer: 'initialize' });
  console.log("WETH House Pool:", wethHousePool.address);

  console.log("mockUSDCToken Address : ", mockUSDCToken.address)
  console.log("mockWBTCToken Address : ", mockWBTCToken.address)
  console.log("mockWETHToken Address : ", mockWETHToken.address)

  console.log("USDCclaimToken Address : ", usdcClaimToken.address)
  console.log("WBTCclaimToken Address : ", wbtcClaimToken.address)
  console.log("WETHclaimToken Address : ", wethClaimToken.address)
  const supply = 1000000000


  const LFITOKEN = await ethers.getContractFactory("LFIToken");
  const lfiToken = await LFITOKEN.deploy(supply);
  await lfiToken.deployed()

  const name = "VLFI"
  const symbol = "VLFI"
  const lfiAddress = lfiToken.address
  const cooldown = 300
  const unstakeWindow = 60
  const rewardsPerSecond = ethers.utils.formatUnits(returnBigNumber(1 * 10 **18),0);
 
  VLFI = await ethers.getContractFactory("VLFI")
  vlfi = await upgrades.deployProxy(VLFI,[name,symbol,lfiToken.address,120,60,rewardsPerSecond,3000],{initializer: 'initialize'});
  await vlfi.deployed()
  console.log("VLFI Address:",vlfi.address)

  const Fund = await ethers.getContractFactory("FundDistributor")
  const fund = await Fund.deploy(lfiToken.address)
  console.log('fund deployed')
  const FARM = await ethers.getContractFactory("LFiFarms");
  const farm = await upgrades.deployProxy(FARM, [owner.address, lfiToken.address, fund.address], { initializer: 'initialize' });

  console.log("LFI Token Address :", lfiToken.address)
  console.log("Fund Distributor Address :", fund.address)
  console.log("Farms address :", farm.address)


  const approvalAmount = ethers.utils.formatUnits(returnBigNumber(10000000 * 10 ** 18), 0)

  await mockUSDCToken.approve(usdcHousePool.address, approvalAmount)
  await mockWBTCToken.approve(wbtcHousePool.address, approvalAmount)
  await mockWETHToken.approve(wethHousePool.address, approvalAmount)

  await usdcClaimToken.approve(usdcHousePool.address, approvalAmount)
  await wbtcClaimToken.approve(wbtcHousePool.address, approvalAmount)
  await wethClaimToken.approve(wethHousePool.address, approvalAmount)

  await lfiToken.approve(fund.address, approvalAmount)

  await usdcClaimToken.approve(farm.address, approvalAmount)
  await wbtcClaimToken.approve(farm.address, approvalAmount)
  await wethClaimToken.approve(farm.address, approvalAmount)

  await usdcClaimToken.addAdmin(usdcHousePool.address)
  await wbtcClaimToken.addAdmin(wbtcHousePool.address)
  await wethClaimToken.addAdmin(wethHousePool.address)

  const USDCFarmAllocPoints = 50
  const WBTCFarmAllocPoints = 10
  const WETHFarmAllocPoints = 40

  const rewardTokensPerSecond = ethers.utils.formatUnits(returnBigNumber(10 * 10 ** 18), 0)
  const fids = [0, 1, 2]

  // create Farms 
  await farm.createFarm(USDCFarmAllocPoints, usdcClaimToken.address)
  await farm.createFarm(WBTCFarmAllocPoints, wbtcClaimToken.address)
  await farm.createFarm(WETHFarmAllocPoints, wethClaimToken.address)

  sleep(10000)
  // Set RewardsPer second
  await farm.setRewardPerSecond(rewardTokensPerSecond, fids)
  await fund.addRequester(farm.address)
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });