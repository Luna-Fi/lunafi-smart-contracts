### One Step DAO Staking Pool Deposit
One method call to DAO Staking Poool to Approve + Deposit
```mermaid
sequenceDiagram
    participant A as User
    participant B as DAO Staking Pool
    participant C as LFI Token
    participant D as vLFI Token
    Note over A: User signs approve messages for ERC20Permit
    A->>A: {Sign Approve for Token to DAO Staking}
    Note over A: Send Signed Approval to newDeposit Method with deposit amount
    A->>+B: {newDeposit}
    B->>+C: {Permit}
    Note over C: Approve Token for DAO Staking Address
    C-->>-B: {Success}
    B->>+D: {Mint vLFI Tokens for user}
    D-->>-B: {Success}
    B-->>-A: {Success}
```


### One Step DAI Staking Rewards
One method call to DAO Staking Pool for Deposit to Staking Pool and LFI Farm
```mermaid
sequenceDiagram
    participant A as User
    participant B as DAO Staking Pool
    participant C as LFI Token
    participant D as vLFI Token
    participant E as Farm
    Note over A: User signs approve messages for ERC20Permit
    A->>A: {Sign Approve for LFI Token to DAO Staking}
    A->>A: {Sign Approve for vLFI Token to Farm}
    Note over A: Send Signed Approvals to newDeposit Method with deposit amount
    A->>+B: {newDeposit}
    B->>+C: {Permit}
    Note over C: Approve LFI Token for DAO Staking Address
    C-->>-B: {Success}
    B->>+D: {Mint vLFI Tokens for user}
    B->>D: {Permit}: Approve VLFI Token for Farm Address
    D-->>-B: {Success}
    B->>+E: {Deposit vLFI in Farm}
    E-->>-B: {Success}
    B-->>-A: {Success}
```
