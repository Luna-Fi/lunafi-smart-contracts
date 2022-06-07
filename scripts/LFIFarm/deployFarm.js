const { BigNumber } = require("ethers");
const returnBigNumber = (number) => {
    number = number.toString(16)
    return BigNumber.from("0x" + number);
}
async function main() {

  const lfiAddress = ""
  const ownerAddress = ""
  const Fund = await ethers.getContractFactory("FundDistributor")
  const fund = await Fund.deploy(lfiAddress)
  console.log('fund deployed')
  const FARM = await ethers.getContractFactory("LFiFarms");
  const farm = await upgrades.deployProxy(FARM,[ownerAddress, lfiAddress, fund.address], { initializer: 'initialize' });

  console.log("LFI Token Address :", lfiToken.address)
  console.log("Fund Distributor Address :", fund.address)
  console.log("Farms address :", farm.address)
  }
  
  main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });