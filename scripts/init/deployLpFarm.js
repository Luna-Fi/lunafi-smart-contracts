const { BigNumber } = require("ethers");

const LPTokenAddress = '0xAc1B87fDFcb76e45542a79B0F05B2f95112f5965'
const LPFarmAllocPoints = 10
const farmAddress = '0xc8DEE4b85f4a202769821Dd8D916a8e4aBe9C659'

async function main() {
  const [owner, user1, user2, user3] = await ethers.getSigners()

  const FARM = await ethers.getContractFactory("LFiFarms");
  const farm = await FARM.attach(farmAddress);
  await farm.createFarm(LPFarmAllocPoints, LPTokenAddress)
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });