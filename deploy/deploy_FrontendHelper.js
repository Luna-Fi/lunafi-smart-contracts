const MUMBAI_USDC_HOUSEPOOL = '0xBA93c977654e3588D5F8db22D6E4EdF956621947'
const MUMBAI_WBTC_HOUSEPOOL = '0x19036933ddB39713bceEA6f6F49659Fbdff54920'
const MUMBAI_WETH_HOUSEPOOL = '0xEd3501499378Dd125D007dDf4C2efdEDcb191Bd4'

module.exports = async ({getNamedAccounts, deployments}) => {

  const {deploy} = deployments;
  const {deployer} = await getNamedAccounts();

  const FRONTENDHELPER = await deploy('FrontendHelper',{from: deployer, log: true, args: [deployer,[MUMBAI_USDC_HOUSEPOOL, MUMBAI_WBTC_HOUSEPOOL, MUMBAI_WETH_HOUSEPOOL]]});
  
  console.log("Frontend Helper Address :", FRONTENDHELPER.address)

};

module.exports.tags = ['deployHelper']
  