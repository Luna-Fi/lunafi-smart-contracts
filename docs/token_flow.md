## Token Flow

#### Step 1: Genesis - Initial minting and bridging

- LFI token contract will be deployed to Ethereum mainnet with total supply minted on deployment.
- All minted tokens will then be bridged to Polygon mainnet using Polygon provided bridge at: https://wallet.polygon.technology/bridge
- All minted tokens will then be moved to LunaFi Treasury Wallet, which is a Gnosis Safe with 3 of 5 MultiSig Wallet
- All access control roles of Token contract will be assigned to Time Lock controlled governer with LunaFi Treasury Wallet as executer.
- The default admin role will be renounced.

```mermaid
flowchart LR
    subgraph "Intial Minting"
    A(Deploy LFI token on Ethereum) -->|Bridge to Polygon| B(100% tokens on Polygon ) -->|Move to Wallet| C[DAO Treasury Wallet]
    end
```

#### Step 2: Vesting

- Tokens that are to be vested as per the vesting schedule will be moved to a vesting contract on Polygon.
- Vesting contract will release vested tokens to designated wallets as per the time locked schedule.
- Vested tokens will be transferred from the contract to designated wallets every fortnight.

```mermaid
flowchart TD
    subgraph Vesting
    A[DAO Treasury Wallet] -->|transfer 95%| B{{Vesting Contract}}
    B{{Vesting Contract}} -->|transfer over time| E[Multiple Beneficiaries]
    end
```

#### Step 3: Distribution from Treasury Wallet

The Treasury wallet will distribute tokens to farm rewards and other channels for incentives, partner rewards and partner liquidity like Quickswap liquidity pools.

```mermaid
flowchart LR
    subgraph Token distribution from Treasury
    A[DAO Treasury Wallet] -->|transfer x%| B{{Partner Liquidity Eg. Quickswap}}
    A[DAO Treasury Wallet] -->|transfer x%| C{{Bet Mining}}
    A[DAO Treasury Wallet] -->|transfer x%| D{{Rewarder Contracts}}
    A[DAO Treasury Wallet] -->|transfer x%| E{{Other Reward Channels}}
    end
```
