const { BigNumber } = require("ethers");
const returnBigNumber = (number) => {
    number = number.toString(16)
    return BigNumber.from("0x" + number);
}
async function main() {

    const name = "VLFI"
    const symbol = "VLFI"
    const stakedToken = "0x9c4c940205cF972e0B5742c17B3B9a3eAAF87a47"
    const cooldownSeconds = 864000 // Use this in production. 864000 is equal to 10 days
    const unstakeWindow = 172800 // use this in production. 172800 is equal to 2 days.
    const rewardPerSecond = ethers.utils.formatUnits(returnBigNumber(1 * 10**18),0)
    const VLFI = await ethers.getContractFactory("VLFI");
    console.log("Deploying VLFI...");
    const vlfi = await upgrades.deployProxy(VLFI,[name,symbol,stakedToken,cooldownSeconds,unstakeWindow,rewardPerSecond],{initializer: 'initialize'});
    console.log("VLFI Deployed to :", vlfi.address);
  }
  
  main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });