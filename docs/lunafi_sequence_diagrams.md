### Placing a bet
```mermaid
sequenceDiagram
    participant A as SB-FE
    participant B as SB-BE
    participant C as LF-BE
    participant D as LF-HP
    Note over A: user signs bet transaction
    A->>+B: {betinfo}
    Note over B: validate bet data before accepting<br/> Add latest EV and ME
    B->>+C: {betinfo, MeEv}
    C->>+D: {betinfo, MeEv}
    Note over D: update MeEv if required <br/> transfer bet amount<br/>add bet data to contract
    D-->>-C: {success/failure}
    C-->>-B: {success/failure}
    Note over B: mark bet as confirmed
    B-->>-A: {success/failure}
    Note over A: notify user
```

Components, parameters and descriptions

| Symbol  | Description                                                  |
| :------ | ------------------------------------------------------------ |
| SB-FE   | Sports Book Front-End                                        |
| SB-BE   | Sports Book Back-End                                         |
| LF-BE   | LunaFi Back-End                                              |
| LF-HP   | LunaFi House Pool Contract                                   |
| betinfo | Signed transaction with bet data and token transacton.<br/>Data to include: { betID, marketID, amount, outcome, stakes } |
| MeEv    | Maximum Exposure and Expected Value of outstanding bets.<br />Signed by authorised Oracle wallet private key |
