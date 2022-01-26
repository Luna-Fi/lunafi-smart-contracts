module.exports  = async ({getNamedAccounts, deployments}) => {
    const {deploy} = deployments;
    const {deployer} = await getNamedAccounts();
    
    const LFiToken = await deploy('LFIToken', {from: deployer, log: true});
    console.log("LFi Token Address : ", LFiToken.address)

  };

  module.exports.tags = ['deployLFI']
    