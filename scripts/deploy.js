const { FacetCutAction, getSelectors } = require('./diamondHelpers.js');

async function deployDiamond () {
  const accounts = await ethers.getSigners();
  const owner = accounts[0];

  // deploy Diamond Cut Facet
  const DiamondCutFacet = await ethers.getContractFactory('DiamondCutFacet');
  const diamondCutFacet = await DiamondCutFacet.deploy();
  await diamondCutFacet.deployed();
  console.log('Diamond Cut Facet deployed at: ', diamondCutFacet.address);

  // deploy LunaFi diamond server
  const LFi = await ethers.getContractFactory('LunaFiServer');
  const lFi = await LFi.deploy(diamondCutFacet.address);
  await lFi.deployed();
  console.log('LunaFi diamond server deployed at: ', lFi.address);

  // deploy facets
  console.log('');
  console.log('Deploying Facets...');
  const FacetNames = [
    'DiamondLoupeFacet',
    'OwnershipFacet',
    'OracleFacet'
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
  const diamondCut = await ethers.getContractAt('IDiamondCut', lFi.address);
  let tx, receipt;
  tx = await diamondCut.diamondCut(cut, ethers.constants.AddressZero, "");
  console.log('LFi server cut attempted by tx:', tx.hash);
  receipt = await tx.wait();
  if (!receipt.status) { throw Error(`Cutting failed: ${tx.hash}`)}
  console.log('Successfully cut!');
  return lFi.address;
}

if (require.main === module) {
  deployDiamond()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error)
      process.exit(1)
    })
}
