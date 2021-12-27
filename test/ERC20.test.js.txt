const { getSelectors, FacetCutAction, deployFacet, deployLunaFiServer } = require('../scripts/deploy.js')
const { cut } = require('../scripts/cut.js')
const { assert, expect } = require('chai')

describe('MockTokens', async function () {
  let tx, receipt, result;
  let owner, accounts

  let lunaFi, diamondLoupeFacet, accessControlFacet

  before(async function () {
    [owner, ...accounts] = await ethers.getSigners();
    lunaFi = await deployLunaFiServer();
    diamondLoupeFacet = await ethers.getContractAt('DiamondLoupeFacet', lunaFi);

    const ERC20Facet = await ethers.getContractFactory('ERC20Facet');
    erc20Facet = await ERC20Facet.deploy();
    await erc20Facet.deployed();

    const selectors = getSelectors(ERC20Facet);
    await cut(lunaFi, erc20Facet.address, selectors, FacetCutAction.Add);
  })

  it('erc20 facet test -- creates mock tokens', async function () {
    const ef = await ethers.getContractAt('ERC20Facet', lunaFi);
    const erc20Metadata = [18, 'Wrapped Ethereum', 'WETH'];

    await expect(ef.createERC20(erc20Metadata, lunaFi))
      .to.not.be.revertedWith();
  })
})
