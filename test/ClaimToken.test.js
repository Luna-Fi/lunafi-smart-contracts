const { getSelectors, FacetCutAction, deployLunaFiServer } = require('../scripts/deploy.js')
const { cut } = require('../scripts/cut.js')
const { assert, expect } = require('chai')

describe('ClaimTokens', async function () {
  
  let owner, accounts

  let lunaFi, diamondLoupeFacet

  before(async function () {
    [owner, ...accounts] = await ethers.getSigners();
    lunaFi = await deployLunaFiServer();
    diamondLoupeFacet = await ethers.getContractAt('DiamondLoupeFacet', lunaFi);

    const claimTokenFacet = await ethers.getContractFactory('ClaimTokenFacet');
    claimTFacet = await claimTokenFacet.deploy();
    await claimTFacet.deployed();

    const selectors = getSelectors(claimTokenFacet);
    await cut(lunaFi, claimTFacet.address, selectors, FacetCutAction.Add);
  })

  it('claimToken facet test -- creates claimToken tokens', async function () {
    const wethRopstenAddress = "0xcaF1a42750C277bf06862012Ce5458EDBeA6e9E4";
    const wbtcRopstenAddress = "0x9F5b3Eeffb978cF50b897Cb1f44d1a2Ca66acCF9";
    const usdcRopstenAddress = "0xb1DB29B83d4e1329d8C28BA8DF69e75c25e57235";

    const ef = await ethers.getContractAt('ClaimTokenFacet', lunaFi);
    const claimTokenMetadata1 = [18, 'Wrapped Ethereum', 'WETH'];
    const claimTokenMetadata2 = [10, 'Wrapped Bitcoin', 'WBTC'];
    const claimTokenMetadata3 = [8,   'USDCToken', 'USDC'];

    const wethReceipt = await ef.registerToken(claimTokenMetadata1, lunaFi, wethRopstenAddress)
    const wbtcReceipt = await ef.registerToken(claimTokenMetadata2, lunaFi, wbtcRopstenAddress)
    const USDCReceipt = await ef.registerToken(claimTokenMetadata3, lunaFi, usdcRopstenAddress)

    console.log("wethTxHash :", wethReceipt.hash)
    console.log("wbtcTxHash :", wbtcReceipt.hash)
    console.log("USDCTxHash :", USDCReceipt.hash)

  })
})

