// deploy/00_deploy_my_contract.js

module.exports  = async ({getNamedAccounts, deployments}) => {
    const {deploy} = deployments;
    const {deployer} = await getNamedAccounts();
    const { BigNumber} = require("ethers");

    const returnBigNumber = (number) => {
      number = number.toString(16)
      return BigNumber.from("0x" + number);
  }
  

    const LFIAddress = "0x9c4c940205cF972e0B5742c17B3B9a3eAAF87a47"
    const rewardsPerSecond = ethers.utils.formatUnits(returnBigNumber(1 * 10 **18),0);
    
    const VLFI = await deploy('VLFI', {from: deployer, log: true, args: ["VLFI", "VLFI",LFIAddress,120,60,rewardsPerSecond,3000 ]});
   
    console.log("VLFIAddress : ", VLFI.address)

  };

  module.exports.tags = ['deployVLFI']