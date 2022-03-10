const { BigNumber } = require("ethers");
const returnBigNumber = (number) => {
    number = number.toString(16)
    return BigNumber.from("0x" + number);
}

const USDCToken = ""
const WBTCToken = ""
const WETHToken = ""
const USDCClaimToken = ""
const WBTCClaimToken = ""
const WETHClaimToken = ""
const USDCPoolTokenPrice = ethers.utils.formatUnits(returnBigNumber(100 * 10 **18),0);
const WBTCPoolTokenPrice = ethers.utils.formatUnits(returnBigNumber(1 * 10 **16),0);
const WETHPoolTokenPrice = ethers.utils.formatUnits(returnBigNumber(100 * 10 **17),0);
const USDCPoolTokenWithdrawalPrice = ethers.utils.formatUnits(returnBigNumber(100 * 10 **18),0);
const WBTCPoolTokenWithdrawalPrice = ethers.utils.formatUnits(returnBigNumber(1 * 10 **16),0);
const WETHPoolTokenWithdrawalPrice = ethers.utils.formatUnits(returnBigNumber(100 * 10 **17),0);
const USDCPrecision = 12;
const WBTCPrecision = 10;
const WETHPrecision = 0;




async function main() {
    const HOUSEPOOL = await ethers.getContractFactory("HousePoolUSDC");
    console.log("Deploying HousePools...");
    const usdcpool = await upgrades.deployProxy(HOUSEPOOL,[USDCToken,USDCClaimToken,USDCPoolTokenPrice,USDCPoolTokenWithdrawalPrice,USDCPrecision],{initializer: 'initialize'});
    console.log("Deploy HousePool deployed to:", usdcpool.address);
    const wbtcpool = await upgrades.deployProxy(HOUSEPOOL,[WBTCToken,WBTCClaimToken,WBTCPoolTokenPrice,WBTCPoolTokenWithdrawalPrice,WBTCPrecision],{initializer: 'initialize'});
    console.log("Deploy HousePool deployed to:", wbtcpool.address);
    const wethpool = await upgrades.deployProxy(HOUSEPOOL,[WETHToken,WETHClaimToken,WETHPoolTokenPrice,WETHPoolTokenWithdrawalPrice,WETHPrecision],{initializer: 'initialize'});
    console.log("Deploy HousePool deployed to:", wethpool.address);

  }
  
  main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });