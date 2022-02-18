// deploy/00_deploy_my_contract.js

//Ropsten Contracts

// const mockUSDCTokenAddress = "0xb1DB29B83d4e1329d8C28BA8DF69e75c25e57235"; 
// const mockWBTCTokenAddress = "0x9F5b3Eeffb978cF50b897Cb1f44d1a2Ca66acCF9";
// const mockWETHTokenAddress = "0xcaF1a42750C277bf06862012Ce5458EDBeA6e9E4";

// const USDCClaimTokenAddress = "0x8D5dFbd9b885BDdaeD9812AA8b3AA47f75e06210";
// const WBTCClaimTokenAddress = "0xca131f7baB00E794F492E477CfA3dd06a145b23a";
// const WETHClaimTokenAddress = "0x91D6dF9d3314EcC10662d3fdb7e55b38B53e4610";


// Rinkeby Contracts for testing upgradeability and Gnosis wallet

const mockUSDCTokenAddress = "0xc0a07701Aa1a103CB3cA850c774d80236cC5691A"; 
const mockWBTCTokenAddress = "0xff8F9d2b7f2ef66F1CFA0A094b998D6538E2D8bF";
const mockWETHTokenAddress = "0x3c8D76f67Cfc419633eB9d1EcF989b0a40b22f1E";

const USDCClaimTokenAddress = "0x4E15C7cfE0392d58d2c8733ec85ae6dAe4Ebac98";
const WBTCClaimTokenAddress = "0x8dE1554550Cb46578CA04962DF95Afe7995B76f9";
const WETHClaimTokenAddress = "0xdD715145FF0551e8Ef6a7859Ea8e40e81889D396";


const name = "";
const version = "";

module.exports = async ({getNamedAccounts, deployments}) => {
    const {deploy} = deployments;
    const {deployer} = await getNamedAccounts();
    // ROPSTEN SCRIPT
    //const HousePoolUSDC = await deploy('HousePoolUSDC', { from: deployer, log: true, args: [deployer,mockUSDCTokenAddress,USDCClaimTokenAddress,name,version] });
    //const HousePoolWBTC = await deploy('HousePoolWBTC', { from: deployer, log: true, args: [deployer,mockWBTCTokenAddress,WBTCClaimTokenAddress,name,version] });
    //const HousePoolWETH = await deploy('HousePoolWETH', { from: deployer, log: true, args: [deployer,mockWETHTokenAddress,WETHClaimTokenAddress,name,version] });

    const HousePoolUSDC = await deploy('HousePoolUSDC', { from: deployer, log: true});
    const HousePoolWBTC = await deploy('HousePoolWBTC', { from: deployer, log: true});
    const HousePoolWETH = await deploy('HousePoolWETH', { from: deployer, log: true});

    console.log("HousePoolUSDC Address : ", HousePoolUSDC.address)
    console.log("HousePoolWBTC Address : ", HousePoolWBTC.address)
    console.log("HousePoolWETH Address : ", HousePoolWETH.address)
   
  };

  module.exports.tags = ['deployHousePools']