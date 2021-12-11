# Stand alone HousePool contracts.
 
 The contracts here are just to serve the purpose of initial integration <br />

 All the contracts are deployed on Ropsten Test Net. <br />

 Contract Address Details : <br />

 `USDC Test Token Contract Address ---- 0xb1DB29B83d4e1329d8C28BA8DF69e75c25e57235` <br />
 `USDClaim Token Contract Address  ---- 0x1E3b2b406E5307468A7db6Ff81C4FF591BC3b515` <br />
 `USDCHousePool Contract Address   ---- 0x376b38685f707facF97Ed5EFC38714D3EA16F93E` <br />
 
 `WBTC Test Token Contract Address ---- 0x9F5b3Eeffb978cF50b897Cb1f44d1a2Ca66acCF9` <br />
 `WBTCClaim Token Contract Address ---- 0x51C124831eF8E18513B664cDc1348D9073D2F14D` <br />
 `WBTCHousePool Contract Address   ---- 0x2994C2B9FcEfb6685081Bc414cf14AAe939617B2` <br />

 `WETH Test Token Contract Address ---- 0xcaF1a42750C277bf06862012Ce5458EDBeA6e9E4` <br />
 `WETHClaim Token Contract Address ---- 0x246bB3384ED24D810F2b568E463Cf876DF68C10E` <br />
 `WETHHousePool Contract Address   ---- 0xEf003d4CC833ae9975813119aa89de5E595A0C3A` <br />

 

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

