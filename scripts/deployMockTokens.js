
const main = async () => {
  const mockUSDCToken = await ethers.getContractFactory("mockUSDCToken");
  const mockWETHToken = await ethers.getContractFactory("mockWETHToken");
  const mockWBTCToken = await ethers.getContractFactory("mockWBTCToken");

  const USDCToken = await mockUSDCToken.deploy();
  const WETHToken = await mockWETHToken.deploy();
  const WBTCToken = await mockWBTCToken.deploy();

  console.log("MockUSDCToken deployed to : ", USDCToken.address);
  console.log("MockWBTCToken deployed to : ", WBTCToken.address);
  console.log("MockWETHToken deployed to : ", WETHToken.address);
  
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });