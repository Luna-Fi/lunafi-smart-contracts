Note: To enable preview of designs add Markdown Preview Mermaid extension to VS Code.
### Please refer to docs folder for additional information

# LunaFI smart contracts :

## LunaFi

Smart Contracts for [LunaFi](#) built for EVM-compatible blockchains and will initially be launched on Polygon.

In LunaFi, we have a variety of products, from ERC20 Tokens, Yield Farms and Liquidity Pools(HousePools).

Details of the contracts are in the table below.

| CONTRACT NAME   | CONTRACT FILE PATH               | DESCRIPTION                                                  |
| --------------- | :------------------------------- | ------------------------------------------------------------ |
| LFIToken        | contracts/LFIToken.sol           | Native Token of  LunaFi. ERC20 token with a few standard OZ extensions. All tokens will be minted on deployment hence mint is not required. Has additional standard extensions for burn, pause and blacklist. |
| claimToken      | contracts/claimTokenContract.sol | Generic contract for liquidity Pool Tokens. ERC20 standard token with additonal mint and burn functionality |
| VLFI            | contracts/VLFI.sol               | This is the LFI Staking Pool. this issues vLFI LP tokens in exchange for LFI tokens deposited. VLFI contract is ERC20 tokens with some additional functionality. Users can deposit LFI and can mint proportionate amount of VLFI Tokens. "VLFI" immediately starts earning rewards in LFI tokens which are proportionally distributed to all the users in the pool.  there is a cooldown period and an unstake windowi f users wants to unstake or withdraw the staked LFI |
| vesting         | contracts/vesting.sol            | Lunabets vesting contract. Tokens are released to stake holders based on the vesting schedule. This will transfer vested tokens directly to the beneficiaries wallet every month. |

## NOTE:

claim tokens are part of Phase 2 functionality and the remaining phase 2 functionality will be built with house pools and audited again.

## Setup

1. clone the repo

2. install hardhat as a dev dependency

   

## Testing

To run the latest rest suite :

***npx hardhat test***
