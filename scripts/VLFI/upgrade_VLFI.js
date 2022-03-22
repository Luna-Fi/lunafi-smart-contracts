// scripts/prepare_upgrade.js
async function main() {
    const VLFIProxyAddress = '0x76345c73EB2f0a4c33418457e2F65A89Dd6d80E9'; 
    const VLFIT2 = await ethers.getContractFactory("VLFIT2");
    console.log("Upgrading...");
    const vlfiT2Address = await upgrades.upgradeProxy(VLFIProxyAddress, VLFIT2);
    console.log(" VLFI  Upgraded to :", vlfiT2Address);
    

  }
   
  main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });