// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import { IERC20 } from '../interfaces/IERC20.sol';
import { claimTokenInterface } from '../interfaces/claimTokenInterface.sol';


contract HousePoolStorageContract {           

    bytes32 internal constant USDCHOUSEPOOL_STORAGE_POSITION = keccak256("USDC.House.diamond.Pool");
    bytes32 internal constant WETHHOUSEPOOL_STORAGE_POSITION = keccak256("WETH.House.diamond.Pool");
    bytes32 internal constant WBTCHOUSEPOOL_STORAGE_POSITION = keccak256("WBTC.House.diamond.Pool");

    struct housePoolStorage {  
      IERC20 stableToken;
      claimTokenInterface claimToken;
      address owner;
      uint256 poolLiquidity;
      uint256  ExchangeRatio;
      mapping(address => uint256) userDepositAmount;    
    }

    function usdcHousePoolStorage() internal pure returns(housePoolStorage storage ds) {
      bytes32 position = USDCHOUSEPOOL_STORAGE_POSITION;
      assembly { ds.slot := position }
    }  

    function wethHousePoolStorage() internal pure returns(housePoolStorage storage ds) {
      bytes32 position = WETHHOUSEPOOL_STORAGE_POSITION;
      assembly { ds.slot := position }
    }  

    function wbtcHousePoolStorage() internal pure returns(housePoolStorage storage ds) {
      bytes32 position = WBTCHOUSEPOOL_STORAGE_POSITION;
      assembly { ds.slot := position }
    } 

}