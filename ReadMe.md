# Stand alone HousePool contracts.

Contracts are deployed on to Ropsten testnet 

`USDC Test Token Contract Address ---- 0xb1DB29B83d4e1329d8C28BA8DF69e75c25e57235` <br />
`USDClaim Token Contract Address  ---- 0x8D5dFbd9b885BDdaeD9812AA8b3AA47f75e06210` <br />
`USDCHousePool Contract Address   ---- 0xB081092D3238ecd6b15443fBC6f9Fc0Ac7A682E1` <br />

`WBTC Test Token Contract Address ---- 0x9F5b3Eeffb978cF50b897Cb1f44d1a2Ca66acCF9` <br />
`WBTCClaim Token Contract Address ---- 0x37Aba23eB68225cE6bbD9E38fbC7BEFDCEbd3794` <br />
`WBTCHousePool Contract Address   ---- 0x3C25f03d54baB45BA9a4949fCDADD7088d0eeE27` <br />

`WETH Test Token Contract Address ---- 0xcaF1a42750C277bf06862012Ce5458EDBeA6e9E4` <br />
`WETHClaim Token Contract Address ---- 0x91D6dF9d3314EcC10662d3fdb7e55b38B53e4610` <br />
`WETHHousePool Contract Address   ---- 0x8BBD9ea867128b2E8c0FbdEDA878dFeF6aC4Ad33` <br />

`LFI Token Contract Address       ---- 0xD52D68d889462B7a5d3Cb9b333a2c0F8b56336B2` <br />
`Fund Distributor Address         ---- 0x8AB1b15fC33d498749dE96450f1599056c1bC7a3` <br />
`Farms Contract Address           ---- 0x2CE935a11FBFf2E2b9a963A7381c1DF5d3af011C` <br />

`As of now this account "0xdd8eBa4604D2a9C6c77e4bC557B1884119174726" serves as the owner of the contract.`
`Private key for the account is available in .env.example file.`
`The above account is a test account created for LunaFI testing purpose. Don't send any main net Ether to that account.`


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

`LFI TOKEN Contract ABI        -- artifacts/contracts/LFIToken.sol/LFIToken.json` <br />

`FUND Contract ABI             -- artifacts/contracts/FundDistributor.sol/FundDistributor.json` <br />

`FARMS Contract ABI            -- artifacts/contracts/LFiFarms.sol/LFiFarms.json` <br />




# Deployment Scripts
Deployment Scripts are available at ./deploy folder.

 Scripts can be installed by using the command  `npx hardhat deploy --netwotk <network name>`
 To deploy a particular script use  we need to specify a tag name `npx hardhat deploy --tags ""deployAll --network <network name>`

Scripts Information :
    `001_Deploy_mockTokens.js      --- Deploys only mock tokens. -- Tag name : "deployMockTokens"`
    `002_Deploy_ClaimTokens.js     --- Deploys only claim tokens. -- Tag name : "deployClaimTokens"`
    `003_Deploy_Claim_HousePool.js --- Deploys claim tokens and HousePools. -- Tag name : "deployClaimTokensAndPools"`
    `004_Deploy_HousePools.js      --- Deploys House Pools. -- Tag name is "deployHousePools"`
    `005_Deploy_All.js             --- Deploys mock tokens, claim tokens and House Pools. -- Tag name : deployAll`
    `006_Deploy_Farms.js           --- Deploys all contracts related to LFI Farms.  -- Tag Name : deployFarms`
    `007_Deploy_LFIToken.js        --- Deploys all contracts related to LFI Farms.  -- Tag Name : deployLFI`

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

