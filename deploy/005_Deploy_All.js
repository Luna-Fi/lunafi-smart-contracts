// deploy/00_deploy_my_contract.js

const name = "";
const version = "";

  module.exports = async ({getNamedAccounts, deployments}) => {
    const {deploy} = deployments;
    const {deployer} = await getNamedAccounts();
    const mockUSDCToken = await deploy('mockUSDCToken', {from: deployer, log: true});
    //const mockWBTCToken = await deploy('mockWBTCToken', {from: deployer, log: true});
    //const mockWETHToken = await deploy('mockWETHToken', {from: deployer, log: true});

    const USDCclaimToken = await deploy('USDCclaimToken', { from: deployer, log: true });
    //const WBTCclaimToken = await deploy('WBTCclaimToken', { from: deployer, log: true });
    //const WETHclaimToken = await deploy('WETHclaimToken', { from: deployer, log: true });
    
    const HousePoolUSDC = await deploy('HousePoolUSDC', { from: deployer, log: true, args: [deployer,mockUSDCToken.address,USDCclaimToken.address,name,version] });
    //const HousePoolWBTC = await deploy('HousePoolWBTC', { from: deployer, log: true, args: [deployer,mockWBTCToken.address,WBTCclaimToken.address,name,version] });
    //const HousePoolWETH = await deploy('HousePoolWETH', { from: deployer, log: true, args: [deployer,mockWETHToken.address,WETHclaimToken.address,name,version] });

    console.log("mockUSDCToken Address : ", mockUSDCToken.address)
    //console.log("mockWBTCToken Address : ", mockWBTCToken.address)
    //console.log("mockWETHToken Address : ", mockWETHToken.address)
    
    console.log("USDCclaimToken Address : ", USDCclaimToken.address)
    //console.log("WBTCclaimToken Address : ", WBTCclaimToken.address)
    //console.log("WETHclaimToken Address : ", WETHclaimToken.address)

    console.log("HousePoolUSDC Address : ", HousePoolUSDC.address)
    //console.log("HousePoolWBTC Address : ", HousePoolWBTC.address)
    //console.log("HousePoolWETH Address : ", HousePoolWETH.address)
   
  };

  module.exports.tags = ['deployAll']
    

  