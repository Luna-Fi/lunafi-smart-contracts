const { FacetCutAction, getSelectors } = require('./diamondHelpers.js');
const { deployFacet } = require('./deployFacet.js');

async function deployLunaFiServer() {
  const accounts = await ethers.getSigners();
  const owner = accounts[0];

  const diamondCutFacetAddress = await deployFacet('DiamondCutFacet');
  console.log('Diamond Cut Facet deployed at: ', diamondCutFacetAddress);

  const lFiAddress = await deployFacet('LunaFiServer', diamondCutFacetAddress);
  console.log('LunaFi diamond server deployed at: ', lFiAddress);

  // deploy facets
  console.log('');
  console.log('Deploying Facets...');
  const FacetNames = [
    'DiamondLoupeFacet',
    'OracleFacet',
    'OwnershipFacet'
  ]
  const cut = [];
  for (const FacetName of FacetNames) {
    const Facet = await ethers.getContractFactory(FacetName);
    const facet = await Facet.deploy();
    await facet.deployed();
    console.log(`${FacetName} deployed: ${facet.address}`);
    cut.push({
      facetAddress: facet.address,
      action: FacetCutAction.Add,
      functionSelectors: getSelectors(facet)
    });
  }

  // upgrade server
  console.log('');
  console.log('Diamond Cut being attempted: ', cut);
  const diamondCut = await ethers.getContractAt('IDiamondCut', lFiAddress);
  let tx, receipt;
  tx = await diamondCut.diamondCut(cut, ethers.constants.AddressZero, '0x');
  console.log('LFi server cut attempted by tx:', tx.hash);
  receipt = await tx.wait();
  if (!receipt.status) { throw Error(`Cutting failed: ${tx.hash}`)}
  console.log('LunaFi server successfully deployed & setup.');
  return lFiAddress;
}

if (require.main === module) {
  deployLunaFiServer()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error)
      process.exit(1)
    })
}

exports.getSelectors = getSelectors
exports.FacetCutAction = FacetCutAction
exports.deployFacet = deployFacet
exports.deployLunaFiServer = deployLunaFiServer
