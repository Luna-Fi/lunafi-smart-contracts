const { getSelectors, FacetCutAction, deployFacet, deployLunaFiServer } = require('../scripts/deploy.js');
const { assert } = require('chai');
const { ethers } = require('ethers');

describe('LunaFiServerTests', async function () {
  let tx, receipt, result;
  let lFiAddress

  let diamondCutFacet, diamondLoupeFacet, oracleFacet

  const addresses = [];

  before(async function () {
    lFiAddress = await deployLunaFiServer();
    diamondCutFacet = await ethers.getContractAt('DiamondCutFacet', lFiAddress);
    diamondLoupeFacet = await ethers.getContractAt('DiamondLoupeFacet', lFiAddress);
    usdcClaimTokenFacet = await ethers.getContractAt('usdcClaimTokenFacet', lFiAddress);
    usdcTestTokenFacet = await ethers.getContractAt('usdctestTokenFacet', lFiAddress);


  })