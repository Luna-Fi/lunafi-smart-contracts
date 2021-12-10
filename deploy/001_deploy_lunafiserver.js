const func = async ({getNamedAccounts, deployments, getChainId}) => {
  const { deployer, diamondAdmin } = await getNamedAccounts();
  const { deploy } = deployments;
  // const {diamond} = deployments;
  // await diamond.deploy('LunaFiServer', {
  //   from: deployer,
  //   owner: diamondAdmin,
  //   facets: [
  //     // 'DiamondCutFacet',
  //     // 'DiamondLoupeFacet',
  //     // 'OwnershipFacet',
  //     'AccessControlFacet',
  //   ],
  // });
  const diamondCutFacet = await deploy('DiamondCutFacet', { from: deployer });
  console.log(diamondCutFacet.address);
  const libDiamond = await deploy('LibDiamond', { from: deployer });
  console.log(libDiamond.address);
  const lfi = await deploy('LunaFiServer', {
    from: deployer,
    args: [ diamondCutFacet.address, diamondAdmin ],
    libraries: {
      LibDiamond: libDiamond.address
    },
    logs: true,
  });
  console.log(lfi.address);
};

module.exports = func;
func.tags = ['LunaFiServer'];
