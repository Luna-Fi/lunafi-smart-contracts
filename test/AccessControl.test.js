const { getSelectors, FacetCutAction, deployFacet, deployLunaFiServer } = require('../scripts/deploy.js')
const { cut } = require('../scripts/cut.js')
const { assert, expect } = require('chai')

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
  })

  it('deploys access control facet', async function () {
    const AccessControlFacet = await ethers.getContractFactory('AccessControlFacet');
    const selectors = getSelectors(AccessControlFacet);
    const selectorsAvailable = await diamondLoupeFacet.facetFunctionSelectors(accessControlFacet.address);
    assert.sameMembers(selectorsAvailable, selectors);
  })

  it('should initilize access control facet', async function () {
    const ownershipFacet = await ethers.getContractAt('OwnershipFacet', lunaFi);
    expect(await ownershipFacet.owner())
      .to.equal(owner.address);
    const acf = await ethers.getContractAt('AccessControlFacet', lunaFi);
    await expect(acf.connect(owner).initAccessControl()).to.not.be.revertedWith();
  })

  it('adds a new admin as default admin', async function() {

  })

  it('should not add a non-admin as default admin', async function() {

  })

  it('should allow role admin to grant that role to a new user', async function() {

  })
})
