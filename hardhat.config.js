/**
 * @type import('hardhat/config').HardhatUserConfig
 */
require("@nomiclabs/hardhat-waffle");
require('@eth-optimism/smock/build/src/plugins/hardhat-storagelayout');

module.exports = {
  solidity: "0.8.10",
};
