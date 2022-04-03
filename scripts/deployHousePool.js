async function main() {
    const HOUSEPOOLUSDC = await ethers.getContractFactory("HousePoolUSDC");
    const HOUSEPOOLWBTC = await ethers.getContractFactory("HousePoolWBTC");
    const HOUSEPOOLWETH = await ethers.getContractFactory("HousePoolWETH");
    console.log("Deploying HousePools...");
    const usdcpool = await upgrades.deployProxy(HOUSEPOOLUSDC,["0xdd8eBa4604D2a9C6c77e4bC557B1884119174726","0x919Ee4677C65711128a4C7ADbB2478E8059cC2A3","0xB116b22474A5C5a62020c8C3b19dc49AD695Fd90","USDCPool","1"],{initializer: 'initialize'});
    console.log("Deploy HousePool deployed to:", usdcpool.address);
    const wbtcpool = await upgrades.deployProxy(HOUSEPOOLWBTC,["0xdd8eBa4604D2a9C6c77e4bC557B1884119174726","0x65216279e5dC112AeF189eF70a75b9e0F1Fb36d0","0x38C93D9eeEbF8CA69d21b5cd49F91cD0858f0667","WBTCPool","1"],{initializer: 'initialize'});
    console.log("Deploy HousePool deployed to:", wbtcpool.address);
    const wethpool = await upgrades.deployProxy(HOUSEPOOLWETH,["0xdd8eBa4604D2a9C6c77e4bC557B1884119174726","0xe8F1C4998d4A2de795318Bc345F61843FaB8AF9D","0x00A852E7d4bF84f3cB0f6c7b36A85D0Ce6E042A9","WETHPool","1"],{initializer: 'initialize'});
    console.log("Deploy HousePool deployed to:", wethpool.address);

  }
  
  main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });