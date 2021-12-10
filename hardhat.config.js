/**
 * @type import('hardhat/config').HardhatUserConfig
 */
require("@nomiclabs/hardhat-waffle");
require('dotenv').config();
require('hardhat-deploy');
// require('hardhat-deploy-ethers');
// require('hardhat-gas-reporter');
const {node_url, accounts} = require('./scripts/network.js');

const config = {
  solidity: {
    compilers: [
      { version: "0.8.0" },
      { version: "0.8.3" },
      { version: "0.8.10" }
    ]
  },
  namedAccounts: {
    deployer: 0,
    diamondAdmin: 1,
  },
  networks: {
    hardhat: {
      live: false,
      accounts: accounts(),
      tags: ["test", "local"]
    },
    localhost: {
      live: false,
      url: 'http://localhost:8545',
      accounts: accounts(),
      tags: ["local"]
    },
    mainnet: {
      live: true,
      url: node_url('mainnet'),
      accounts: accounts('mainnet'),
    },
    rinkeby: {
      live: true,
      url: node_url('rinkeby'),
      accounts: accounts('rinkeby'),
    },
    kovan: {
      live: true,
      url: node_url('kovan'),
      accounts: accounts('kovan'),
    },
    staging: {
      live: true,
      url: node_url('rinkeby'),
      accounts: accounts('rinkeby'),
      tags: ["staging"]
    },
  }
  //   gasReporter: {
  //   currency: 'USD',
  //   gasPrice: 100,
  //   enabled: process.env.REPORT_GAS ? true : false,
  //   coinmarketcap: process.env.COINMARKETCAP_API_KEY,
  //   maxMethodDiff: 10,
  // },
  // mocha: {
  //   timeout: 0,
  // },
};

module.exports = config;
