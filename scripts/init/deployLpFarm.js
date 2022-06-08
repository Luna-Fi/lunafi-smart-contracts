const { BigNumber } = require("ethers");

const LPTokenAddress = ''
const LPFarmAllocPoints = 10
const farmAddress = '0x4175Acd3d7f128cF41d42826cCe2185A5aDe7C82'

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