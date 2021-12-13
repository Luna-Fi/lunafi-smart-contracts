const hre = require("hardhat");
const ethers = hre.ethers;

async function main(stringToConvert) {
  const b = await ethers.utils.formatBytes32String("WETH");
  console.log(b);
  return b;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
