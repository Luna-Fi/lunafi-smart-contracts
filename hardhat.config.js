
/**
 * @type import('hardhat/config').HardhatUserConfig
 */
require("@nomiclabs/hardhat-waffle");
require("hardhat-deploy");
require("@nomiclabs/hardhat-ethers");

module.exports = {
  solidity: "0.8.10",
  networks : {
    ropsten: {
      url : "https://ropsten.infura.io/v3/06ad6936699f4bd2887f8d4db7e2b613",
      chainId: 3,
    }
  },
  namedAccounts: {
    deployer: {
        default: 0, 
        3:0,
    }     
  }
};


