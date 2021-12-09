# Smart Contract design considerations for LunaFi

## Proxy
    We consider the best-practice approach of EIP1967 to use a proxy that delegates calls to implementations address.
    - Transparent proxy has `upgradeTo` function in proxy
    - Universal/Minimal proxy has `upgradeTo` function in implementations
    - Beacon: A proxy contract points to a beacon contract which points to the implementation

* Transparent is expensive to run because `onlyAdmin` is checked for all function calls
* Universal is brickable. This can be avoided by using a check with `try catch` in proxy
* Beacon is useful when we need that a simple implementation upgrade will upgrade all instances pointing at the beacon. We have only one instance of the LunaFi Server.

    Both approach have storage collision problem.

## Storage
    The problem with delegate call is that the proxy and implementation both end up sharing the same storage layout. This leads to unintentional affects.

Solutions to storage collision:
* Inherited storage:  proxy & its implementations inherit a storage contract that contains the storage variables that they use. This ensures that the proxy contract and its facets all declare the same state variables in the same order so there is no conflict. But implementations cannot declare different or new veriables.
* App storage: Similar to inherited storage but instead of declaring variables directly in storage contract, they are declared in a struct. Better syntax than inherited storage.
* Eternal Storage: Use solidity mapping to create a generic storage API. Not easy to glance which variables exist because of the syntax. No separation of concern in storage possible - all implemenations & proxies must use same storage API.
* Unstructured storage: Using solidity assembly to set and store values at arbitrary positions in contract storage. But this does not work for structs or mappings. Also, need lot of getter-setter code for all variables.
* Diamond storage: Like unstructured storage but use structs instead of directly variables.

    Thus we consider diamond storage & app storage approach. Difference boils down to if the storage composability is app-level or at implementation/functionality-level.

## Upgradeability
Reasons for upgradeable code:
    - Project Goals
      - Long-term maintainability
      - Robust defi integration
    - Bugs are fixable

## Management
    Openzeppelin defender was considered
    - Cannot be used with diamond approach since it uses in-built proxy mechanism
    - Third-party solutions dedicated to solving security such as Wallet infrastructure etc. can be used
    - Uses AWS APIs for handling keys, which should be considered
    - Helpful in providing signing transactions as web API token
    - Helpful in gas relay network management


From the above, diamond proxy with diamond storage is considered & Openzeppelin Defender using as backup.

