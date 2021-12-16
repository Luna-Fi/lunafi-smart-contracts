const { getSelectors, FacetCutAction, deployFacet, deployLunaFiServer } = require('../scripts/deploy.js');
const { cut } = require('../scripts/cut.js');
const { expect } = require('chai');

describe('OwnershipTests', async function () {
  let tx, receipt, result;
  let owner, accounts

  let lunaFi

  before(async function () {
    [owner, ...accounts] = await ethers.getSigners();
    lunaFi = await deployLunaFiServer();
  })

  // it('should deploy ownership facet', async function () {
  // const ownershipFacetAddress = await deployFacet('OwnershipFacet');
  // const selectors = getSelectors(await ethers.getContractFactory('OwnershipFacet'));
  // await cut(lunaFi, ownershipFacetAddress, selectors, FacetCutAction.Add)
  // });

  it ('should get the owner', async () => {
    const ownershipFacet = await ethers.getContractAt('OwnershipFacet', lunaFi);
    expect(await ownershipFacet.owner())
      .to.equal(owner.address);
  });
});
