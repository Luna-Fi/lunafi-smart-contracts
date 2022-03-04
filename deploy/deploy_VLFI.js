// deploy/00_deploy_my_contract.js

module.exports  = async ({getNamedAccounts, deployments}) => {
    const {deploy} = deployments;
    const {deployer} = await getNamedAccounts();

    const LFIAddress = "0x9c4c940205cF972e0B5742c17B3B9a3eAAF87a47"
    
    const VLFI = await deploy('VLFI', {from: deployer, log: true, args: ["VLFI", "VLFI",LFIAddress,300,60 ]});
   
    console.log("VLFIAddress : ", VLFI.address)

  };

  module.exports.tags = ['deployVLFI']