// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

library TokenStorageContract {           

    bytes32 internal constant USDCCLAIMTOKEN_STORAGE_POSITION = keccak256("USDCClaimToken.token.diamond.ERC20Token");
    bytes32 internal constant WBTCCLAIMTOKEN_STORAGE_POSITION = keccak256("WBTCClaimToken.token.diamond.ERC20Token");
    bytes32 internal constant WETHCLAIMTOKEN_STORAGE_POSITION = keccak256("WETHClaimToken.token.diamond.ERC20Token");
    

    struct ClaimTokenStorage {  
        uint8  decimals;
        address  owner;
        uint256  _totalSupply;
        uint256  initialSupply;
        string  name;
        string  symbol;
        mapping(address => uint256)  balances;
        mapping(address => mapping(address => uint256))  allowed;
        mapping(address => bool)  admins;
             
    }

    function usdcClaimTokenStorage() internal pure returns(ClaimTokenStorage storage ds) {
        bytes32 position = USDCCLAIMTOKEN_STORAGE_POSITION;
        assembly { ds.slot := position }
    }  

    function wbtcClaimTokenStorage() internal pure returns(ClaimTokenStorage storage ds) {
        bytes32 position = WBTCCLAIMTOKEN_STORAGE_POSITION;
        assembly { ds.slot := position }
    }

    function wethClaimTokenStorage() internal pure returns(ClaimTokenStorage storage ds) {
        bytes32 position = WETHCLAIMTOKEN_STORAGE_POSITION;
        assembly { ds.slot := position }
    }

}