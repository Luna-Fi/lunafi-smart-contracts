// deploy/00_deploy_my_contract.js

const mockUSDCTokenAddress = "0xb1DB29B83d4e1329d8C28BA8DF69e75c25e57235"; 
const mockWBTCTokenAddress = "0x9F5b3Eeffb978cF50b897Cb1f44d1a2Ca66acCF9";
const mockWETHTokenAddress = "0xcaF1a42750C277bf06862012Ce5458EDBeA6e9E4";

const USDCClaimTokenAddress = "";
const WETHClaimTokenAddress = "";
const WBTCClaimTokenAddress = "";

const name = "";
const version = "";

module.exports = async ({getNamedAccounts, deployments}) => {
    const {deploy} = deployments;
    const {deployer} = await getNamedAccounts();
    
    const HousePoolUSDC = await deploy('HousePoolUSDC', { from: deployer, log: true, args: [deployer,mockUSDCTokenAddress,USDCClaimTokenAddress,name,version] });
    const HousePoolWBTC = await deploy('HousePoolWBTC', { from: deployer, log: true, args: [deployer,mockWBTCTokenAddress,WBTCclaimToken.address,name,version] });
    const HousePoolWETH = await deploy('HousePoolWETH', { from: deployer, log: true, args: [deployer,mockWETHTokenAddress,WETHclaimToken.address,name,version] });

    console.log("HousePoolUSDC Address : ", HousePoolUSDC.address)
    console.log("HousePoolWBTC Address : ", HousePoolWBTC.address)
    console.log("HousePoolWETH Address : ", HousePoolWETH.address)
   
  };

  module.exports.tags = ['deployHousePools']