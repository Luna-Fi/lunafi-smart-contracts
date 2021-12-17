async function main(lunaFiServerAddress, facetAddress_, selectors, action_, initArgs) {
  const diamondCutFacet = await ethers.getContractAt('DiamondCutFacet', lunaFiServerAddress);
  const tx = await diamondCutFacet.diamondCut(
    [{
      facetAddress: facetAddress_,
      action: action_,
      functionSelectors: selectors
    }],
    ((typeof initArgs === 'undefined') ? ethers.constants.AddressZero : facetAddress_),
    (typeof initArgs === 'undefined') ? '0x' : initArgs
  );
  const receipt = await tx.wait();
  if(!receipt.status) {
    throw Error(`Upgrade failed: $(tx.hash)`)
  } // else { console.log(" -- LunaFi server diamond was cut!") }
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

exports.cut = main
