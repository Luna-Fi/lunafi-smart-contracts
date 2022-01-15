# Updated USDC HousePool contract details:

`USDC Test Token Contract Address ---- 0xb1DB29B83d4e1329d8C28BA8DF69e75c25e57235` <br />
`USDClaim Token Contract Address  ---- 0xE9092e47182599c3B447B41E86628540d6A4e535` <br />
`USDCHousePool Contract Address   ---- 0xd250C0417f75A1b9851af8ED3A8296A99567263E` <br />


` As of now this account "0xdd8eBa4604D2a9C6c77e4bC557B1884119174726" serves as the owner of the contract.`
`Private key for the account is available in .env.example file.`
` The above account is a test account created for LunaFI testing purpose. Don't send any main net Ether to that account.`

# Stand alone HousePool contracts.
 
 The contracts here are just to serve the purpose of initial integration <br />

 All the contracts are deployed on Ropsten Test Net. <br />

 Contract Address Details : <br />

 `USDC Test Token Contract Address ---- 0xb1DB29B83d4e1329d8C28BA8DF69e75c25e57235` <br />
 `USDClaim Token Contract Address  ---- 0x1E3b2b406E5307468A7db6Ff81C4FF591BC3b515` <br />
 `USDCHousePool Contract Address   ---- 0x1d1Afa6794b0b1353Fb960EC27578a4E35BF1f27` <br />
 
 `WBTC Test Token Contract Address ---- 0x9F5b3Eeffb978cF50b897Cb1f44d1a2Ca66acCF9` <br />
 `WBTCClaim Token Contract Address ---- 0x51C124831eF8E18513B664cDc1348D9073D2F14D` <br />
 `WBTCHousePool Contract Address   ---- 0x328a2734c7b85180AF855fb9D1E37F31837c66cb` <br />

 `WETH Test Token Contract Address ---- 0xcaF1a42750C277bf06862012Ce5458EDBeA6e9E4` <br />
 `WETHClaim Token Contract Address ---- 0x246bB3384ED24D810F2b568E463Cf876DF68C10E` <br />
 `WETHHousePool Contract Address   ---- 0x4AaC4BF47417EE998B9451C7f3Baaca42e79F3f3` <br />

 

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




# Deployment Scripts
Deployment Scripts are available at ./deploy folder.

 Scripts can be installed by using the command  `npx hardhat deploy --netwotk <network name>`
 To deploy a particular script use  we need to specify a tag name `npx hardhat deploy --tags ""deplyAll --network <network name>`

Scripts Information :
    `001_Deploy_mockTokens.js      --- Deploys only mock tokens.  Tag name : "deployMockTokens"`
    `002_Deploy_ClaimTokens.js     --- Deploys only claim tokens. Tag name : "deployClaimTokens"`
    `003_Deploy_Claim_HousePool.js --- Deploys claim tokens and HousePools. Tag name : "deployClaimTokensAndPools"`
    `004_Deploy_HousePools.js      --- Deploys House Pools. Tag name is "deployHousePools"`
    `005_Deploy_All.js             --- Deploys mock tokens, claim tokens and House Pools.. Tag name : deployAll`

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

