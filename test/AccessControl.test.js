const { getSelectors, FacetCutAction, deployFacet, deployLunaFiServer } = require('../scripts/deploy.js');
const { cut } = require('../scripts/cut.js');
const { assert } = require('chai');

describe('AccessControlTests', async function () {
  let tx, receipt, result;
  let owner, accounts

  let lunaFi, diamondLoupeFacet

  before(async function () {
    await hre.network.provider.send("hardhat_reset");
    [owner, ...accounts] = await ethers.getSigners();
    lunaFi = await deployLunaFiServer();
    diamondLoupeFacet = await ethers.getContractAt('DiamondLoupeFacet', lunaFi);
  })

  it('should deploy access control facet', async function () {
    // const LibAccess = await ethers.getContractFactory('LibAccess');
    // const libAccess = await LibAccess.deploy();
    // await libAccess.deployed();

    // const AccessControlFacet = await ethers.getContractFactory('AccessControlFacet', {
      // libraries: {
        // LibAccess: libAccess.address,
      // }
    // });

    // const libAccess = await ethers.getContractAt('LibAccess', lunaFi);
    // console.log("libaccess is available at ", libAccess.address);

    const AccessControlFacet = await ethers.getContractFactory('AccessControlFacet');
    const accessControlFacet = await AccessControlFacet.deploy();
    await accessControlFacet.deployed();

    const selectors = getSelectors(AccessControlFacet);
    await cut(lunaFi, accessControlFacet.address, selectors, FacetCutAction.Add);
    const selectorsOnChain = await diamondLoupeFacet.facetFunctionSelectors(accessControlFacet.address);
    assert.sameMembers(selectorsOnChain,selectors);
  });

  it('should add a new admin as default admin', async function(){

  });

  it('should not a non-admin as default admin', async function(){

  });

  it('should allow role admin to grant that role to a new user', async function(){

  });
});
