
# Stand alone HousePool contracts.

Contracts are deployed on to Ropsten testnet 

`USDC Test Token Contract Address ---- 0xb1DB29B83d4e1329d8C28BA8DF69e75c25e57235` <br />
`USDClaim Token Contract Address  ---- 0xfFb7BaAc18ec9C88FBbDeec682664421b82332D3` <br />
`USDCHousePool Contract Address   ---- 0xDff0DE0E9cB085E7612A7f3ae0B472D9E61a6CD5` <br />

`WBTC Test Token Contract Address ---- 0x9F5b3Eeffb978cF50b897Cb1f44d1a2Ca66acCF9` <br />
`WBTCClaim Token Contract Address ---- 0xdD659e02B9182165D0322E5D906d9c2CB2727604` <br />
`WBTCHousePool Contract Address   ---- 0xa30bdd69EbDB850Da7D6a894Ed0e5f3a2E9e0674` <br />

`WETH Test Token Contract Address ---- 0xcaF1a42750C277bf06862012Ce5458EDBeA6e9E4` <br />
`WETHClaim Token Contract Address ---- 0x3759d7B927CfE2cE356012d25985E09F944Ce3e5` <br />
`WETHHousePool Contract Address   ---- 0xf276D51d4B9256a33Ec75683AC5DC2601A48DfA8` <br />

`LFI Token Contract Address       ---- 0x0A827fEeEb2E247001A6a2684805cb5d9A1fb6A2` <br />
`Fund Distributor Address         ---- 0xc59DeA44508026883C062e716D783547a2c1BbF0` <br />
`Farms Contract Address           ---- 0xB09E97D67ac060E9c4306FBa1Dd3D6ddD175d487` <br />

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

























The full process to write upgradeable contracts using Openzeppelin Hardhat upgrade plugin.

HousePools :

    To deploy HousePools, mockToken contact and claimToken contract must be available.
    Contracts are deployed and verified on Etherscan.

    1. MockToken contracts and claimToken contracts are available below, these contracts are deployed to Goerli network using            
       hardhat-deploy plugin.

            mockUSDCToken Address :  0x919Ee4677C65711128a4C7ADbB2478E8059cC2A3
            mockWBTCToken Address :  0x65216279e5dC112AeF189eF70a75b9e0F1Fb36d0
            mockWETHToken Address :  0xe8F1C4998d4A2de795318Bc345F61843FaB8AF9D

            USDCclaimToken Address :  0xB116b22474A5C5a62020c8C3b19dc49AD695Fd90
            WBTCclaimToken Address :  0x38C93D9eeEbF8CA69d21b5cd49F91cD0858f0667
            WETHclaimToken Address :  0x00A852E7d4bF84f3cB0f6c7b36A85D0Ce6E042A9

    2. Next Deploy HousePool contracts 

            Deploy housePool contracts using openzeppelin-upgrades hardhat plugin
            After the deployment, both proxy contract as well as backing contract are deployed.

            The addresses of the contracts are as below

            USDCHousePoolV1 : 0x3Ad03f0DF70fd20B730CC4e61491cB856a208F1c
            WBTCHousePoolV1 : 0x8d5203f265B4A9Fe20dF0Ad4Da68eF5EE61e7592
            WETHHousePoolV1 : 0x35C8dA86d649B7Fa490876a7345A8029ca26D509

            ProxyUSDCPool : 0x0e194E566a76d94F2956Abd9a865727755b53C59
            ProxyUSDCPool : 0xade38530F85236B89FBa7F658691552DCCdeB77C
            ProxyUSDCPool : 0x3C3C7B36F09839BE1cAd98DA8db773d7F419b168

            proxy Admin : 0x4251e26019aAb2267F18c16Ba1046beaB413bc05


         

            

    3. Verify the Proxy*Pool contracts in EtherScan as Proxy contracts


    4. Test the HousePool Contract.

            ** These txs should be done on respective proxy contracts. That's what is exposed to the client.

            1- Deposit 10000 tokens to all the housePool 
           USDCHousePool deposit_ ---- txhash :  https://rinkeby.etherscan.io/tx/0x8d67aeae7e69595a4c52526591705a6b69021595fd07d80ff1834f974b68b016

           WBTCHousePool deposit_ --- txhash : https://rinkeby.etherscan.io/tx/0xf055e58dd570d47c28df8b0a449a6bc8444fb080eb35ebc60cc6b3d3ada33abf

           WETHHousePool deposit_ --- txhash : https://rinkeby.etherscan.io/tx/0x4589d9b14d9ad3676a2c5ea54cec405e7978cfe48d57282556979b8168c27ccd

            2 - Read the contract state 
            USDCHousePool getLiquidityStatus --- 10000000000000000000000 uint256
            WBTCHousePool getLiquidityStatus --- 10000000000000000000000 uint256
            WETHHousePool getLiquidityStatus --- 10000000000000000000000 uint256

            0xdd8eBa4604D2a9C6c77e4bC557B1884119174726
            0xD3630a43C9D676a706b3BFC6A37e0564579e598C

    5. Create a Gnosis MultiSig wallet :

            Gnosis Wallet address : 0x403cC47A49a952a225b14e72550a5644b26C0B87
    
    6. Transfer proxy Admin ownership to Gnosis wallet. OwnerShip of the proxy admin is now transferred to Gnosis Wallet

            Transferring ownership of ProxyAdmin...
                ✔ 0x0e194E566a76d94F2956Abd9a865727755b53C59 (transparent) proxy ownership transfered through admin proxy
                ✔ 0xade38530F85236B89FBa7F658691552DCCdeB77C (transparent) proxy ownership transfered through admin proxy
                ✔ 0x3C3C7B36F09839BE1cAd98DA8db773d7F419b168 (transparent) proxy ownership transfered through admin proxy
            Transferred ownership of ProxyAdmin to: 0x403cC47A49a952a225b14e72550a5644b26C0B87

    7. Upgrade the HousePool contracts.


            Added a function called getUserLiquidity in the version 2 of the contract 
            Deploy the upgraded contracts using openzeppelin-updates hardhat plugin
            We have already transferred proxy admin ownership to Gnosis wallet and signatures are required from Gnosis to do the upgrade.
            verify the upgraded contracts

            USDC HousePool Upgraded to : 0x31488c12Bc9FDCa45e8495e739B5Ce27d4E374b1
            WBTC HousePool Upgraded to : 0x760e1c931083Ce77511915bf48409892542efd4f
            WETH HousePool Upgraded to : 0x35C8dA86d649B7Fa490876a7345A8029ca26D509
    
    8. Test if the storage is still available from the old version contracts on the upgraded contracts.

            check the getLiquidityStatus and it should be equal to 10000000000000000000000 uint256 on all the contracts
    
    9. Test if the contract got new and updated methods.

            Proxy contract should show the getMyBalance function

    

