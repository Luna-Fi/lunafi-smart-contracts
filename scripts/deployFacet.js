async function deployFacet(contractName, ...args) {
  const Contract = await ethers.getContractFactory(contractName);
  const contract = await Contract.deploy(...args);
  await contract.deployed();
  return contract.address;
}

exports.deployFacet = deployFacet