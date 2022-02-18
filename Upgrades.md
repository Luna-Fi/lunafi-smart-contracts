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

    

