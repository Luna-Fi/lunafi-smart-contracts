const { getSelectors, FacetCutAction, deployFacet, deployLunaFiServer } = require('../scripts/deploy.js');
const { assert } = require('chai');

describe('LunaFiTests', async function () {
  let tx, receipt, result;
  let lFiAddress

  let diamondCutFacet, diamondLoupeFacet, oracleFacet

  const addresses = [];

  before(async function () {
    lFiAddress = await deployLunaFiServer();
    diamondCutFacet = await ethers.getContractAt('DiamondCutFacet', lFiAddress);
    diamondLoupeFacet = await ethers.getContractAt('DiamondLoupeFacet', lFiAddress);
    // oracleFacet = await ethers
  })

  it('should have three initial facets -- call to facetAddresses function', async () => {
    for (const address of await diamondLoupeFacet.facetAddresses()) {
      addresses.push(address)
    }
    assert.equal(addresses.length, 3);
  })

  it ('should add a new facet functions - access control facet', async () => {
    const accessControlFacetAddress = await deployFacet('AccessControlFacet');

    const accessControlFacet = await ethers.getContractFactory('AccessControlFacet');
    const selectors = getSelectors(accessControlFacet);
    tx = await diamondCutFacet.diamondCut(
      [{
        facetAddress: accessControlFacetAddress,
        action: FacetCutAction.Add,
        functionSelectors: selectors
      }],
      ethers.constants.AddressZero,
      '0x'
    )
    receipt = await tx.wait();
    if(!receipt.status) {
      throw Error(`Upgrade failed: $(tx.hash)`)
    }
    result = await diamondLoupeFacet.facetFunctionSelectors(accessControlFacetAddress);
    assert.sameMembers(result, selectors);
  })
})
