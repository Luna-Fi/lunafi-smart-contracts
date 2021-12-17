// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import { LibAccess } from '../libraries/LibAccess.sol';
import { LibERC20 } from '../libraries/LibERC20.sol';
import { IERC20MetadataUser } from '../interfaces/IERC20User.sol';

contract ERC20Facet {
    modifier onlyRole(bytes32 _roleName) {
        require(LibAccess.hasRole(_roleName, msg.sender), "Access restricted to specific role");
        _;
    }

    function initializeERC20Facet()
        external onlyRole(LibAccess._getDefaultAdminRoleName())
    {
        // TODO something with ERC20CREATOR_ROLE
    }

    function createERC20(IERC20MetadataUser.ERC20Metadata calldata erc20Metadata, address serverAddress)
        external
        // onlyRole(_getERC20CreatorRoleName())
    {
        LibERC20.createERC20(erc20Metadata, serverAddress);
    }

    // function _getERC20CreatorRoleName(){}

    function name(bytes32 currencyKey) external view returns (string memory) {
        return LibERC20.getName(currencyKey);
    }

    function symbol(bytes32 currencyKey) external view returns (string memory){
        return LibERC20.getSymbol(currencyKey);
    }

    function decimals(bytes32 currencyKey) external view returns (uint8){
        return LibERC20.getDecimals(currencyKey);
    }

    function totalSupply(bytes32 currencyKey) external view returns (uint256){
        return LibERC20.getTotalSupply(currencyKey);
    }

    function balanceOf(address _owner, bytes32 currencyKey) external view returns (uint256 balance){
        balance = LibERC20.getBalanceOf(_owner, currencyKey);
    }

    function transfer(address _to, uint256 _value, bytes32 currencyKey) external returns (bool success){
        success = LibERC20.transfer(msg.sender, _to, _value, currencyKey);
    }

    function transferFrom(address _from, address _to, uint256 _value, bytes32 currencyKey) external returns (bool success){
        return false; // TODO
    }

    function approve(address _spender, uint256 _value, bytes32 currencyKey) external returns (bool success){
        success = LibERC20.approve(msg.sender, _spender, _value, currencyKey);
    }

    function allowance(address _owner, address _spender, bytes32 currencyKey) external view returns (uint256 remaining){
        remaining = LibERC20.getAllowance(_owner, _spender, currencyKey);
    }
}
