// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

library ERC20StorageRepository {

    bytes32 internal constant CLAIM_TOKENS = keccak256("lunafi.erc20.claimtokens");
    /* bytes32 internal constant WBTCCLAIMTOKEN_STORAGE_POSITION = keccak256("WBTCClaimToken.token.diamond.ERC20Token"); */
    /* bytes32 internal constant WETHCLAIMTOKEN_STORAGE_POSITION = keccak256("WETHClaimToken.token.diamond.ERC20Token"); */

    // LunaFi ERC20 tokens
    struct ERC20TokenStore {
        uint8  decimals;
        address  owner;
        address forERC20Token;
        uint256  _totalSupply;
        uint256  initialSupply;
        string  name;
        string  symbol;
        mapping(address => uint256)  balances;
        mapping(address => mapping(address => uint256))  allowed;
        /* mapping(address => bool)  admins; */
    }

    struct ClaimTokenStore {
        mapping(bytes32 => ERC20TokenStore) acceptedCryptos;
    }

    function claimTokenStore() internal pure
        returns(ClaimTokenStore storage _cts) {
        bytes32 position = CLAIM_TOKENS;
        assembly { _cts.slot := position }
    }
    /* function usdcClaimTokenStorage() internal pure returns(ClaimTokenStorage storage ds) { */
    /*     bytes32 position = USDCCLAIMTOKEN_STORAGE_POSITION; */
    /*     assembly { ds.slot := position } */
    /* } */

    /* function wbtcClaimTokenStorage() internal pure returns(ClaimTokenStorage storage ds) { */
    /*     bytes32 position = WBTCCLAIMTOKEN_STORAGE_POSITION; */
    /*     assembly { ds.slot := position } */
    /* } */

    /* function wethClaimTokenStorage() internal pure returns(ClaimTokenStorage storage ds) { */
    /*     bytes32 position = WETHCLAIMTOKEN_STORAGE_POSITION; */
    /*     assembly { ds.slot := position } */
    /* } */
}
