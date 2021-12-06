const { deployLunaFiServer } = require('../scripts/deploy.js');
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
})
