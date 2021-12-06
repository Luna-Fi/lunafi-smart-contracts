# Stand alone HousePool contracts.
 
 The contracts here are just to serve the purpose of initial integration 

 All the contracts are deployed on Ropsten Test Net.

 Contract Address Details :

 `USDC Test Token Contract Address ---- 0xB4154989873983c0bc3b19498906d3fd57dB6682`
 `USDClaim Token Contract Address  ---- 0xBE8e76368a126D7d3104D8eB2D4528463F5760b0`
 `USDCHousePool Contract Address   ---- 0x3739f603F3C088a992a0A784e389aE9C3137bA0f`
 
 `WBTC Test Token Contract Address ---- 0xF75389433932662c4B96EB87c6836526E30FC63C`
 `WBTCClaim Token Contract Address ---- 0xeaCBF26a031186c9416EB8fc5613EF9e14a230ee`
 `WBTCHousePool Contract Address   ---- 0x5ff538bbf3be97d27e3bd054de9e9d83ACF81011`

 `WETH Test Token Contract Address ---- 0x872598eC1339B70F8cc093373891834141E47871`
 `WETHClaim Token Contract Address ---- 0xd292B4EE9bA3Ce480D517505d0408C62fB605Df3`
 `WETHHousePool Contract Address   ---- 0x555Bbb4455A76D61ca655036ec175963CeA64D46`

 

ABI  Information :

ABI for the contracts is available in below paths

USDC HousePool Contract ABI -- artifacts/contracts/libraries/HousePoolUSDC.sol/housePoolUSDC.json

WBTC HousePool Contract ABI -- artifacts/contract/libraries/HousePoolWBTC.sol/housePoolWBTC.json

WETH HousePool Contract ABI -- artifacts/contract/libraries/HousePoolWETH.sol/housePoolWETH.json

USDC Test Token Contract ABI -- artifacts/contracts/libraries/USDCToken.sol/tUSDCToken.json

WBTC Test Token Contract ABI -- artifacts/contracts/libraries/WBTCToken.sol/tWBTCToken.json

WETH Test Token Contract ABI -- artifacts/contracts/libraries/WETHToken.sol/tWETHToken.json

USDC Claim Token Contract ABI -- artifacts/contracts/libraries/USDCclaimToken.sol/USDCclaimToken.json

WBTC Claim Token Contract ABI -- artifacts/contracts/libraries/WBTCclaimToken.sol/WBTCclaimToken.json

WETH Claim Token Contract ABI -- artifacts/contracts/libraries/WETHclaimToken.sol/WETHclaimToken.json


















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

