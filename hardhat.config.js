
/**
 * @type import('hardhat/config').HardhatUserConfig
 */
require("@nomiclabs/hardhat-waffle");
require("hardhat-deploy");
require('dotenv').config();
require("@nomiclabs/hardhat-ethers");

const config = {
  solidity: "0.8.10",
  networks : {
    localhost: {
      url: "http://127.0.0.1:8545/"
    },
    ropsten: {
      url: `${process.env.NODE_URI_ROPSTEN}`,
      chainId: 3,
      live: true,
      tags: ["staging"],
      saveDeployments: true,
      accounts: [`0x${process.env.DEPLOYER_PRIVATE_KEY}`]
    },
    mainnet: {
      url: `${process.env.NODE_URI_MAINNET}`,
      chainId: 3,
      live: true,
      tags: ["production"],
      saveDeployments: true,
      accounts: [`0x${process.env.DEPLOYER_PRIVATE_KEY}`]
    },
    BSCTestNet: {
      url: `${process.env.NODE_URI_BSCTESTNET}`,
      chainId: 97,
      live: true,
      tags: ["BSCTest"],
      saveDeployments: true,
      accounts: [`0x${process.env.DEPLOYER_PRIVATE_KEY}`]
    },
    BSCMainNet: {
      url: `${process.env.NODE_URI_BSCMAINNET}`,
      chainId: 56,
      live: true,
      tags: ["BSCMainNet"],
      saveDeployments: true,
      accounts: [`0x${process.env.DEPLOYER_PRIVATE_KEY}`]
    }

  },
  namedAccounts: {
    deployer: {
        default: 0, 
        localhost: `${process.env.DEPLOYER_ACCOUNT_ADDRESS}`,
        ropsten: `${process.env.DEPLOYER_ACCOUNT_ADDRESS}`
    }     
  }
};

module.exports = config;


