const { BigNumber } = require("ethers");

async function main() {

  const lfiAddress = "0xCa7BF3C514d412AC12D10Eff302301A81153F557"
  const ownerAddress = "0xA2E31d79E65bF200a9681A38BA18cd9C5Fbe4Df5"
  const Fund = await ethers.getContractFactory("FundDistributor")
  const fund = await Fund.deploy(lfiAddress)
  console.log('fund deployed')
  const FARM = await ethers.getContractFactory("LFiFarms");
  const farm = await upgrades.deployProxy(FARM,[ownerAddress, lfiAddress, fund.address], { initializer: 'initialize' });

  console.log("Fund Distributor Address :", fund.address)
  console.log("Farms address :", farm.address)
  }
  
  main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });