/**
 * @type import('hardhat/config').HardhatUserConfig
 */
require("@nomiclabs/hardhat-waffle");


module.exports = {
  solidity: {
    compilers: [
      { version: "0.8.0" },
      { version: "0.8.3" },
      { version: "0.8.10" }
    ]
  },
  settings: {
    outputSelection: {
      "*": {
        "*": ["storageLayout"]
      }
    }
  }
};
