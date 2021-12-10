const { getSelectors, FacetCutAction, deployFacet, deployLunaFiServer } = require('../scripts/deploy.js');
const { expect } = require("chai");
const { ethers, deployments, getNamedAccounts } = require('hardhat');

describe('LunaFiServerTests', async function () {
  // let tx, receipt, result;
  // let lFiAddress

  // let diamondCutFacet, diamondLoupeFacet, oracleFacet

  // const addresses = [];

  // before(async function () {
  //   lFiAddress = await deployLunaFiServer();
  //   diamondCutFacet = await ethers.getContractAt('DiamondCutFacet', lFiAddress);
  //   diamondLoupeFacet = await ethers.getContractAt('DiamondLoupeFacet', lFiAddress);
  //   // oracleFacet = await ethers
  // })

  it('should get owner of diamond', async () => {
    await deployments.fixture('LunaFiServer');
    const LunaFi = await deployments.get('LunaFiServer');
    const dcf = await deployments.get('DiamondCutFacet');
    console.log('Diamond Cut Facet Address is ', dcf.address);

    const { deployer, diamondAdmin } = await getNamedAccounts();
    await expect(LunaFi.contractOwner()).to.equal(deployer);
  });

  // it('should have three initial facets -- call to facetAddresses function', async () => {
  // const lunaFiServer = deployments.get('LunaFiServer');
  // console.log(lunaFiServer.address);
  //   for (const address of await diamondLoupeFacet.facetAddresses()) {
  //     addresses.push(address)
  //   }
  //   assert.equal(addresses.length, 3);
  // })

  // it ('should add a new facet functions -- cut in access control facet', async () => {
  //   // const accessControlFacetAddress = await deployFacet('AccessControlFacet');
  //   const libAccess = await ethers.getContractAt('LibAccess', lFiAddress);
  //   const AccessControlFacet = await ethers.getContractFactory('AccessControlFacet', {
  //     libraries: {
  //       LibAccess: libAccess.address,
  //       // LibDiamond:
  //     }
  //   });
  //   const accessControlFacet = await AccessControlFacet.deploy();
  //   await accessControlFacet.deployed();

  //   const selectors = getSelectors(AccessControlFacet);

  //   tx = await diamondCutFacet.diamondCut(
  //     [{
  //       facetAddress: accessControlFacet.address,
  //       action: FacetCutAction.Add,
  //       functionSelectors: selectors
  //     }],
  //     ethers.constants.AddressZero,
  //     '0x'
  //   )
  //   receipt = await tx.wait();
  //   if(!receipt.status) {
  //     throw Error(`Upgrade failed: $(tx.hash)`)
  //   }
  //   result = await diamondLoupeFacet.facetFunctionSelectors(accessControlFacet.address);
  //   assert.sameMembers(result, selectors);
  // })
})
