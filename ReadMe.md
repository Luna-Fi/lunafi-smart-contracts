Note: To enable preview of designs add Markdown Preview Mermaid extension to VS Code.
### Please refer to docs folder for more information

# LunaFI smart contracts :

## LunaFi

Smart Contracts for [LunaFi](#) & [LunaBets](https://lunabets.io/), a betting dapp, available on various EVM-compatible blockchains.

In LunaFi, we have a variety of products, from ERC20 Tokens, Yield Farms and HousePools.

Details of the contracts are in the table below.

| CONTRACT NAME   | CONTRACT FILE PATH               | DESCRIPTION                                                  |
| --------------- | :------------------------------- | ------------------------------------------------------------ |
| LFIToken        | contracts/LFIToken.sol           | Native Token of  LunaBets. ERC20 token with a few extensions. |
| claimToken      | contracts/claimTokenContract.sol | Generic contract for liquidity Pool Tokens. ERC20 standard token with additonal mint and burn functionality |
| HousePool       | contracts/HousePool.sol          | Generic HousePool contract, where user can deposit "LFI" tokens and mint a proportionate amount of liquiduty pool tokens. Also users can withdraw their LFI tokens by buring the proportionate amount of liquidity pool tokens. |
| LFiFarms        | contracts/LFiFarms.sol           | An Yield farming contract, where users can deposit their liquidity pool tokens earned from housePools and earn rewards that are distributed in "LFI". |
| FundDistributor | contracts/FundDistributor.sol    | A contract that distribute rewards from LFiFarms contract    |
| VLFI            | contracts/VLFI.sol               | VLFI contract is ERC20 tokens with some additional functionality. Users can deposit LFI and can mint proportionate amount of VLFI Tokens. "VLFI" immediately starts earning rewards which are distributed to all the users in LFI. If users wants to withdraw the depoited LFI, there is a cooldown period. |
| vesting         | contracts/vesting.sol            | Lunabets vesting contract. Tokens are released based on the vesting schedules. |

## Setup

1. clone the repo

2. install hardhat as a dev dependency

   

## Testing

To run the latest rest suite :

***npx hardhat test***