// deploy/00_deploy_my_contract.js
module.exports = async ({getNamedAccounts, deployments}) => {
    const {deploy} = deployments;
    const {deployer} = await getNamedAccounts();
    await deploy('USDCclaimToken', {
      from: deployer,
      log: true,
    });
  };
  module.exports.tags = ['USDCclaimToken'];