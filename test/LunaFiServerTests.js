const { getSelectors, FacetCutAction, deployFacet, deployLunaFiServer } = require('../scripts/deploy.js');
const { expect } = require("chai");
const { ethers, deployments, getNamedAccounts } = require('hardhat');

describe('LunaFiServerTests', async function () {
  let tx, receipt, result;
  let lFiAddress

  let diamondCutFacet, diamondLoupeFacet, oracleFacet

  const addresses = [];

  before(async function () {
    lFiAddress = await deployLunaFiServer();
    diamondCutFacet = await ethers.getContractAt('DiamondCutFacet', lFiAddress);
    diamondLoupeFacet = await ethers.getContractAt('DiamondLoupeFacet', lFiAddress);
  })

  it('should have three initial facets -- call to facetAddresses function', async () => {
    for (const address of await diamondLoupeFacet.facetAddresses()) {
      addresses.push(address)
    }
    assert.equal(addresses.length, 4);
  })

  it ('should add a new facet functions -- cut in access control facet', async () => {
    // const accessControlFacetAddress = await deployFacet('AccessControlFacet');
    const libAccess = await ethers.getContractAt('LibAccess', lFiAddress);
    const AccessControlFacet = await ethers.getContractFactory('AccessControlFacet', {
      libraries: {
        LibAccess: libAccess.address,
        // LibDiamond:
      }
    });
    const accessControlFacet = await AccessControlFacet.deploy();
    await accessControlFacet.deployed();

    const selectors = getSelectors(AccessControlFacet);

    tx = await diamondCutFacet.diamondCut(
      [{
        facetAddress: accessControlFacet.address,
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
    result = await diamondLoupeFacet.facetFunctionSelectors(accessControlFacet.address);
    assert.sameMembers(result, selectors);
  })

  it('Should add a new facet functions -- cut in usdcClaimToken facet', async () => {
    const usdcClaimTokenFacet = await ethers.getContractFactory('usdcClaimTokenFacet');
    const usdcClaimToken = await usdcClaimTokenFacet.deploy();
    await usdcClaimToken.deployed();

    const selectors = getSelectors(usdcClaimTokenFacet);

    tx = await diamondCutFacet.diamondCut(
      [{
        facetAddress: usdcClaimToken.address,
        action: FacetCutAction.Add,
        functionSelectors: selectors
      }],
      ethers.constants.AddressZero,
      '0x'
    )
    receipt = await tx.wait();
    if(!receipt.status) {
      throw Error(`Upgrade failed: $(tx.hash')`)
    }
    result = await diamondLoupeFacet.facetFunctionSelectors(usdcClaimToken.address)
    assert.sameMembers(result,selectors);

    const supply = await usdcClaimToken.totalSupply()
    assert(ethers.BigNumber.from(supply).toNumber() == 0)
  })

  it('Should add a new facet functions -- cut in usdcTestToken facet', async () => {
    const sampleFacet = await ethers.getContractFactory('sample');
    const sampleSample = await sampleFacet.deploy();
    await sampleSample.deployed();

    const selectors = getSelectors(sampleFacet);

    tx = await diamondCutFacet.diamondCut(
      [{
        facetAddress: sampleSample.address,
        action: FacetCutAction.Add,
        functionSelectors: selectors
      }],
      ethers.constants.AddressZero,
      '0x'
    )
    receipt = await tx.wait();
    if(!receipt.status) {
      throw Error(`Upgrade failed: $(tx.hash')`)
    }
    result = await diamondLoupeFacet.facetFunctionSelectors(sampleSample.address)
    assert.sameMembers(result,selectors);

    const name = await sampleSample.getName()
    assert( name == "Hello")
  })

})
