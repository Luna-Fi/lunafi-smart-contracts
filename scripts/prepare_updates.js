// scripts/prepare_upgrade.js
async function main() {
    const USDCProxyAddress = '0x0e194E566a76d94F2956Abd9a865727755b53C59';
    const WBTCProxyAddress = '0xade38530F85236B89FBa7F658691552DCCdeB77C'
    const WETHProxyAddress = '0x3C3C7B36F09839BE1cAd98DA8db773d7F419b168'
   
    const USDCHousePoolV2 = await ethers.getContractFactory("HousePoolUSDCV2");
    const WBTCHousePoolV2 = await ethers.getContractFactory("HousePoolWBTCV2");
    const WETHHousePoolV2 = await ethers.getContractFactory("HousePoolWETHV2");

    console.log("Preparing upgrade...");
    const usdcHousePoolV2Address = await upgrades.prepareUpgrade(USDCProxyAddress, USDCHousePoolV2);
    const wbtcHousePoolV2Address = await upgrades.prepareUpgrade(WBTCProxyAddress, WBTCHousePoolV2);
    const wethHousePoolV2Address = await upgrades.prepareUpgrade(WETHProxyAddress, WETHHousePoolV2);

    console.log(" USDC HousePool Upgraded to :", usdcHousePoolV2Address);
    console.log(" WBTC HousePool Upgraded to :", wbtcHousePoolV2Address);
    console.log(" WETH HousePool Upgraded to :", wethHousePoolV2Address);

  }
   
  main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });