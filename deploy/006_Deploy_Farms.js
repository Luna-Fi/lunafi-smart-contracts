  const rewardPerSecond = 5;

  module.exports = async ({getNamedAccounts, deployments}) => {
    const {deploy} = deployments;
    const {deployer} = await getNamedAccounts();

    const LFITOKEN = await deploy('LFIToken', {from: deployer, log: true});
    const FUND = await deploy('FundDistributor',{from: deployer, log: true, args: [LFITOKEN.address]});
    const FARMS = await deploy('LFiFarms',{from: deployer, log: true, args: [deployer,LFITOKEN.address,FUND.address]});
    
    console.log("LFI Token Address :", LFITOKEN.address)
    console.log("Fund Distributor Address :", FUND.address)
    console.log("Farms address :", FARMS.address)
  };

  module.exports.tags = ['deployFarms']
    