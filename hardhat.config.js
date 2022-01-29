
/**
 * @type import('hardhat/config').HardhatUserConfig
 */
require("@nomiclabs/hardhat-waffle");
require("hardhat-deploy");
require('dotenv').config();
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");

const config = {
  solidity: "0.8.10",
  mocha: {
    timeout: 4000000
  },
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
    goerli: {
      url: `${process.env.NODE_URI_GOERLI}`,
      chainId: 5,
      live: true,
      tags: ["goerli"],
      saveDeployments: true,
      accounts: [`0x${process.env.DEPLOYER_PRIVATE_KEY}`]
    },
    mainnet: {
      url: `${process.env.NODE_URI_MAINNET}`,
      chainId: 1,
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
    },
    mumbai: {
      url: `${process.env.NODE_URI_PLOYGONMUMBAI}`,
      chainId: 80001,
      live: true,
      tags: ["mumbai"],
      saveDeployments: true,
      accounts: [`0x${process.env.DEPLOYER_PRIVATE_KEY}`]
    },
    PolygonMainNet: {
      url: `${process.env.NODE_URI_PLOYGONMAINNET}`,
      chainId: 137,
      live: true,
      tags: ["PolygonMainNet"],
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
  },
  etherscan: {
    apiKey: "6J8G9VC791WVYDIQK5FA2XUJXVGNP2YH4I"
  }
};

module.exports = config;


