// deploy/00_deploy_my_contract.js

module.exports  = async ({getNamedAccounts, deployments}) => {
    const {deploy} = deployments;
    const {deployer} = await getNamedAccounts();
    
    const USDCclaimToken = await deploy('USDCclaimToken', { from: deployer, log: true });
    const WBTCclaimToken = await deploy('WBTCclaimToken', { from: deployer, log: true });
    const WETHclaimToken = await deploy('WETHclaimToken', { from: deployer, log: true });
    
    console.log("USDCclaimToken Address : ", USDCclaimToken.address)
    console.log("WBTCclaimToken Address : ", WBTCclaimToken.address)
    console.log("WETHclaimToken Address : ", WETHclaimToken.address)

  };

  module.exports = ['deployClaimTokens']
    
  
  