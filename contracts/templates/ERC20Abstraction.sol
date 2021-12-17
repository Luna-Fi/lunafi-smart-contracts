// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import '../functions/ERC20Facet.sol';
import { IERC20 } from '../interfaces/IERC20.sol';
import { IERC20MetadataUser } from '../interfaces/IERC20User.sol';

contract ERC20Abstraction is IERC20 {

    bytes32 currencyKey;
    ERC20Facet server;

    constructor(address _lunaFiServer, bytes32 _currencyKey){
        // TODO fail construction if currency key exists
        currencyKey = _currencyKey;
        server =  ERC20Facet(_lunaFiServer); // TODO hardcode the address
    }

    function name() external view returns (string memory) {
        return server.name(currencyKey);
    }

    function symbol() external view returns (string memory){
        return server.symbol(currencyKey);
    }

    function decimals() external view returns (uint8){
        return server.decimals(currencyKey);
    }

    function totalSupply() external view returns (uint256){
        return server.totalSupply(currencyKey);
    }

    function balanceOf(address _owner) external view returns (uint256 balance){
        balance = server.balanceOf(_owner, currencyKey);
    }

    function transfer(address _to, uint256 _value) external returns (bool success){
        emit Transfer(msg.sender, _to, _value);
        success = server.transfer(_to, _value, currencyKey);
    }

    function transferFrom(address _from, address _to, uint256 _value) external returns (bool success){
        success = server.transferFrom(_from, _to, _value, currencyKey);
    }

    function approve(address _spender, uint256 _value) external returns (bool success){
        emit Approval(msg.sender, _spender, _value);
        success = server.approve(_spender, _value, currencyKey);
    }

    function allowance(address _owner, address _spender) external view returns (uint256 remaining){
        remaining = server.allowance(_owner, _spender, currencyKey);
    }
}
