async function main() {
    const HOUSEPOOLUSDC = await ethers.getContractFactory("HousePoolUSDC");
    const HOUSEPOOLWBTC = await ethers.getContractFactory("HousePoolWBTC");
    const HOUSEPOOLWETH = await ethers.getContractFactory("HousePoolWETH");
    console.log("Deploying HousePools...");
    const usdcpool = await upgrades.deployProxy(HOUSEPOOLUSDC,["","","","USDCPool","1"],{initializer: 'initialize'});
    console.log("Deploy HousePool deployed to:", usdcpool.address);
    const wbtcpool = await upgrades.deployProxy(HOUSEPOOLWBTC,["","","","WBTCPool","1"],{initializer: 'initialize'});
    console.log("Deploy HousePool deployed to:", wbtcpool.address);
    const wethpool = await upgrades.deployProxy(HOUSEPOOLWETH,["","","","WETHPool","1"],{initializer: 'initialize'});
    console.log("Deploy HousePool deployed to:", wethpool.address);

  }
  
  main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });