// deploy/00_deploy_my_contract.js

module.exports  = async ({getNamedAccounts, deployments}) => {
    const {deploy} = deployments;
    const {deployer} = await getNamedAccounts();
    
    const mockUSDCToken = await deploy('mockUSDCToken', {from: deployer, log: true});
    const mockWBTCToken = await deploy('mockWBTCToken', {from: deployer, log: true});
    const mockWETHToken = await deploy('mockWETHToken', {from: deployer, log: true});
    
    console.log("mockUSDCToken Address : ", mockUSDCToken.address)
    console.log("mockWBTCToken Address : ", mockWBTCToken.address)
    console.log("mockWETHToken Address : ", mockWETHToken.address)
    
  };

  module.exports.tags = ['deployMockTokens']
    
  
  