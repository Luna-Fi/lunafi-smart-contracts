### Helper Contract for Front End

Front end currently calls a number of contracts and reads information in multiple calls to the blockchain.
This has time delay as well as cost implications due to multiple calls going through infura.
We can create a contract that does all the read operation calls to house pools and collate this data and send in a singe call.

#### 1. POC

As a first step lets try and get liquidity for all pools in one call
In the front end we can remove mulitple calls for `getLiquidityStatus` and replace it with one call to to `HelperContract.getLiquidityStatus()`

```mermaid
sequenceDiagram
    participant A as Front End
    participant B as Helper Contract
    participant C as House Pools(3)
    participant D as LF-HP
    Note over A: FE calls helper contracts poolLiquityStatus method
    A->>+B: {getPoolLiquidity}
    Note over B: Helper contract maintains list of house pool addresses<br />Helper calls getLiquidityStatus method on each of the House Pools one by one
    B->>+C: {getLiquidityStatus}
    C-->>-B: {USDC Liquidty Data}
    B->>+C: {getLiquidityStatus}
    C-->>-B: {WBTC Liquidty Data}
    B->>+C: {getLiquidityStatus}
    C-->>-B: {WETH Liquidty Data}
    Note over B: Collate data and return to FE
    B-->>-A: {data for all House Pools}
    Note over A: Format data in current state structure<br />add to state as usual
```
