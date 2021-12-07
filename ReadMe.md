# Stand alone HousePool contracts.
 
 The contracts here are just to serve the purpose of initial integration <br />

 All the contracts are deployed on Ropsten Test Net. <br />

 Contract Address Details : <br />

 `USDC Test Token Contract Address ---- 0xA7686F874E17931C7278DF8308215b007A766a40` <br />
 `USDClaim Token Contract Address  ---- 0x00407222f8754b6390bD6489117cd56072361D8C` <br />
 `USDCHousePool Contract Address   ---- 0x01048B2518201b06B4f3bF285d56F6aC924f661d` <br />
 
 `WBTC Test Token Contract Address ---- 0xF6fd1De60E85B05BBfa781aDB22FaBfA2541f18d` <br />
 `WBTCClaim Token Contract Address ---- 0x81C48A887760Bdc280f24025c24Dfe239Ab23643` <br />
 `WBTCHousePool Contract Address   ---- 0x43667Fdd57C43F9797b8b9267a5daeA9075100f9` <br />

 `WETH Test Token Contract Address ---- 0xb2b37182B4AF1D78C75F91090D7fc99D124920aB` <br />
 `WETHClaim Token Contract Address ---- 0xe0c7e70A762e5eF174ebD4843Ec2E6A992BF9a72` <br />
 `WETHHousePool Contract Address   ---- 0xA4f7961e35Db62544A6455131fCE1a44dcf57353` <br />

 

ABI  Information : <br />

ABI for the contracts is available in below paths <br />

`USDC HousePool Contract ABI -- artifacts/contracts/libraries/HousePoolUSDC.sol/housePoolUSDC.json` <br />

`WBTC HousePool Contract ABI -- artifacts/contract/libraries/HousePoolWBTC.sol/housePoolWBTC.json` <br />

`WETH HousePool Contract ABI -- artifacts/contract/libraries/HousePoolWETH.sol/housePoolWETH.json` <br />

`USDC Test Token Contract ABI -- artifacts/contracts/libraries/USDCToken.sol/tUSDCToken.json` <br />

`WBTC Test Token Contract ABI -- artifacts/contracts/libraries/WBTCToken.sol/tWBTCToken.json` <br />

`WETH Test Token Contract ABI -- artifacts/contracts/libraries/WETHToken.sol/tWETHToken.json` <br />

`USDC Claim Token Contract ABI -- artifacts/contracts/libraries/USDCclaimToken.sol/USDCclaimToken.json` <br />

`WBTC Claim Token Contract ABI -- artifacts/contracts/libraries/WBTCclaimToken.sol/WBTCclaimToken.json` <br />

`WETH Claim Token Contract ABI -- artifacts/contracts/libraries/WETHclaimToken.sol/WETHclaimToken.json` <br />



# lunafi-core
Smart Contracts for [LunaFi](#) & [LunaBets](https://lunabets.io/), a betting dapp, available on various EVM-compatible blockchains.

# Setup
Clone the repo & change to the directory.

```
npm i
```

# Testing
To run the latest test suite:

```npx hardhat test```

or

```npm test```

# Source Code Organization
- `/contracts/factories`: Constructors for investment interface, markets, event oracles, etc.
- `/contracts/libraries`: Data Structures, utilities & helpers
- `/contracts/management`: Creation & management of tokens, markets, oracles, distribute rewards etc.
- `/contracts/operations`: High-frequency functions such as to view markets, fill bets, claim proceeds etc.

# Docs
- [Contribution guidelines for this project](docs/CONTRIBUTING.md)
- `/docs/devDocs`: Documents for developers consideration during development

# Additional Notes
## General Info
[LunaFi Docs](https;//docs.lunafi.io/)

## EVM numbers are always integers
There is no floating-point numbers in EVM, only integers. Therefore, ether & claim tokens etc. values in contracts is represented in units of wei(i.e., 10^-18 indivible units).

