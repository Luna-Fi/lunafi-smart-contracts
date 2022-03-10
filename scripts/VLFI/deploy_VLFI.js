const { BigNumber } = require("ethers");


async function main() {

    const { BigNumber } = require("ethers");
    const returnBigNumber = (number) => {
        number = number.toString(16)
        return BigNumber.from("0x" + number);
    }

    const name = "VLFI"
    const symbol = "VLFI"
    const stakedToken = "0x9c4c940205cF972e0B5742c17B3B9a3eAAF87a47"
    const cooldownSeconds = 120
    const unstakeWindow = 60
    const rewardPerSecond = ethers.utils.formatUnits(returnBigNumber(1 * 10**18),0)
    const treasuryPercentage = 3000
    const VLFI = await ethers.getContractFactory("VLFI");
    console.log("Deploying VLFI...");
    const vlfi = await upgrades.deployProxy(VLFI,[name,symbol,stakedToken,cooldownSeconds,unstakeWindow,rewardPerSecond,treasuryPercentage],{initializer: 'initialize'});
    console.log("VLFI Deployed to :", vlfi.address);
  }
  
  main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });