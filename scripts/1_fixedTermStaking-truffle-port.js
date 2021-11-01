const Staking = artifacts.require("lunaFund");
const Erc20 = artifacts.require('Lunatoken');

module.exports = async (deployer) => {
  const erc20 = await Erc20.new();
  Erc20.setAsDeployed(erc20);
  const staking = await Staking.new();
  Staking.setAsDeployed(staking);
};