// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import { IERC20 } from '../../interfaces/global/IERC20.sol';
import { LibERC20 } from '../../libraries/LibERC20.sol';

contract ClaimTokenWETHFacet is IERC20 {
    constructor() {
        bytes32 _erc20 = weth();
        LibERC20.initializeERC20(_erc20);
    }
    function weth() internal pure returns(bytes32 wethInBytes32){
        wethInBytes32 = "WETH";
        /* LibInvest._getWETHinfo(); */
    }
    function name() external view returns(string memory name_) {}
    function symbol() external view returns (string memory symbol_) {
        bytes32 _erc20 = weth();
        symbol_ = LibERC20.symbol(_erc20);
    }
    function decimals() external view returns (uint8){}
    function totalSupply() external view returns (uint256){}
    function balanceOf(address _owner) external view returns (uint256 balance){}
    function transfer(address _to, uint256 _value) external returns (bool success){}
    function transferFrom(address _from, address _to, uint256 _value) external returns (bool success){
        /* bytes32 _erc20 = weth(); */
        /* LibERC20.transfer(_erc20, _from, _to, _value); */
    }
    function approve(address _spender, uint256 _value) external returns (bool success){}
    function allowance(address _owner, address _spender) external view returns (uint256 remaining){}

}
