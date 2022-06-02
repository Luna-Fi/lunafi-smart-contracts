async function main() {
    const LFITOKEN = await ethers.getContractFactory("LFIToken");
    const supply = 1000000000
    console.log("Deploying LFIToken...");
    const lfiToken = await LFITOKEN.deploy(supply);
    await lfiToken.deployed()
    console.log("LFIToken Address:",lfiToken.address)
  } 
  
  main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
});