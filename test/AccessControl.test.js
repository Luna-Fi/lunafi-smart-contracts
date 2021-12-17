const { getSelectors, FacetCutAction, deployFacet, deployLunaFiServer } = require('../scripts/deploy.js')
const { cut } = require('../scripts/cut.js')
const { assert } = require('chai')

describe('AccessControlTests', async function () {
  let tx, receipt, result;
  let owner, accounts

  let lunaFi, diamondLoupeFacet, accessControlFacet

  before(async function () {
    [owner, ...accounts] = await ethers.getSigners();
    lunaFi = await deployLunaFiServer();
    diamondLoupeFacet = await ethers.getContractAt('DiamondLoupeFacet', lunaFi);
    const AccessControlFacet = await ethers.getContractFactory('AccessControlFacet');
    accessControlFacet = await AccessControlFacet.deploy();
    await accessControlFacet.deployed();
    const selectors = getSelectors(AccessControlFacet);
    await cut(lunaFi, accessControlFacet.address, selectors, FacetCutAction.Add);
    const acf = await ethers.getContractAt('AccessControlFacet', lunaFi);
    await acf.initAccessControl();
  })

  it('deploys access control facet', async function () {
    const AccessControlFacet = await ethers.getContractFactory('AccessControlFacet');
    const selectors = getSelectors(AccessControlFacet);
    const selectorsAvailable = await diamondLoupeFacet.facetFunctionSelectors(accessControlFacet.address);
    assert.sameMembers(selectorsAvailable, selectors);
  })

  it('adds a new admin as default admin', async function() {

  })

  it('should not add a non-admin as default admin', async function() {

  })

  it('should allow role admin to grant that role to a new user', async function() {

  })
})
