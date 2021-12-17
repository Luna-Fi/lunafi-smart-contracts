const func = async ({getNamedAccounts, deployments, getChainId}) => {
  const { deployer, diamondAdmin } = await getNamedAccounts();
  const { deploy } = deployments;

  const libDiamond = await deployments.get('LibDiamond')
  const libAccess = await deploy('LibAccess', { from: deployer })

  await deploy('AccessControlFacet', {
    from: deployer,
    libraries: {
      LibAccess: libAccess.address,
      LibDiamond: libDiamond.address
    },
    logs: true,
  })
}

module.exports = func
func.tags = ['AccessControl']
