// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

contract USDCTESTTOKENStorageContract {           

    bytes32 internal constant USDCTESTTOKEN_STORAGE_POSITION = keccak256(".token.diamond.ERC20Token");
    
    struct USDCTESTTOKENStorage {  
        mapping(address => uint) balances;      
        mapping(address => mapping(address => uint)) approved; 
        mapping(address => mapping(address => uint))  allowed; 
        uint8  decimals;
        address  owner; 
        string  name;
        string  symbol;
        uint256  initialSupply;
        uint256  _totalSupply;      
    }

    function usdcTestTokenStorage() internal pure returns(USDCTESTTOKENStorage storage ds) {
        bytes32 position = USDCTESTTOKEN_STORAGE_POSITION;
        assembly { ds.slot := position }
    }    
}