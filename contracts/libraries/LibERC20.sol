// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import  '../repositories/ERC20Storage.sol';
import '../templates/ERC20Abstraction.sol';
import { IERC20MetadataUser, IERC20DataUser } from '../interfaces/IERC20User.sol';
import "hardhat/console.sol";

library LibERC20 {
    event Approved(address indexed _owner, address indexed _spender, uint256 _value, bytes32 _currencyKey);
    event Transferred(address indexed _from, address indexed _to, uint256 _value, bytes32 _currencyKey);
    event Burnt(address _from, uint256 _value, bytes32 _currencyKey);
    event Minted(address _from, uint256 _value, bytes32 _currencyKey);
    event Created(address _creator, bytes32 _currencyKey, address _erc20Address);
    // event Destroyed(address _creator, bytes32 _currencyKey);

    function createERC20(IERC20MetadataUser.ERC20Metadata calldata _erc20Metadata, address _serverAddress)
        internal
    {
        bytes32 currencyKey = _getERC20StoreKey(_erc20Metadata.name);
        require(currencyKey != "", 'LibERC20: token exists');

        ERC20Storage.ERC20Store storage ts = ERC20Storage.erc20Store();
        ts.erc20Tokens[currencyKey].tokenMetadata = _erc20Metadata;
        address erc20Address = _deployERC20Contract(_serverAddress, currencyKey);

        emit Created(msg.sender, currencyKey, erc20Address);
    }

    /// @notice name of token converted to bytes32 is used as its key for storage
    function _getERC20StoreKey(string memory name)
        internal pure returns(bytes32 currency)
    {
        currency = keccak256(abi.encodePacked(name));
    }

    function _deployERC20Contract(address _serverAddress, bytes32 _currencyKey)
        internal returns(address erc20Address_)
    {
        erc20Address_ = address(new ERC20Abstraction(_serverAddress, _currencyKey));
    }

    function getName(bytes32 currencyKey)
        internal view returns(string memory)
    {
        ERC20Storage.ERC20Store storage ts = ERC20Storage.erc20Store();
        return ts.erc20Tokens[currencyKey].tokenMetadata.name;
    }

    function getSymbol(bytes32 currencyKey)
        internal view returns(string memory)
    {
        ERC20Storage.ERC20Store storage ts = ERC20Storage.erc20Store();
        return ts.erc20Tokens[currencyKey].tokenMetadata.symbol;
    }

    function getDecimals(bytes32 currencyKey)
        internal view returns(uint8)
    {
        ERC20Storage.ERC20Store storage ts = ERC20Storage.erc20Store();
        return ts.erc20Tokens[currencyKey].tokenMetadata.decimals;
    }


    function getTotalSupply(bytes32 currencyKey) internal view returns(uint256) {
        ERC20Storage.ERC20Store storage ts = ERC20Storage.erc20Store();
        return ts.erc20Tokens[currencyKey].totalSupply;
    }

    function mint(address account, uint256 amount, bytes32 currencyKey)
        internal
    {
        require(account != address(0), "LibERC20: mint from a zero address");

        ERC20Storage.ERC20Store storage ts = ERC20Storage.erc20Store();
        IERC20DataUser.ERC20Data storage erc20data = ts.erc20Tokens[currencyKey];

        erc20data.totalSupply += amount;
        erc20data.balances[account] += amount;

        emit Minted(account, amount, currencyKey);
     }

    function burn(address account, uint256 amount, bytes32 currencyKey)
        internal
    {
        require(account != address(0),"LibERC20: Burn from a zero address");

        ERC20Storage.ERC20Store storage ts = ERC20Storage.erc20Store();
        IERC20DataUser.ERC20Data storage erc20data = ts.erc20Tokens[currencyKey];

        uint256 accountBalance = erc20data.balances[account];
        require(accountBalance >= amount, "LibERC20: burn amount exceeds balance");

        unchecked {
            erc20data.balances[account] = accountBalance - amount;
        }
        erc20data.totalSupply -= amount;

        emit Burnt(account, amount, currencyKey);
    }

    function getBalanceOf(address account, bytes32 currencyId) internal view returns(uint256) {
        ERC20Storage.ERC20Store storage ts = ERC20Storage.erc20Store();
        return ts.erc20Tokens[currencyId].balances[account];
    }

    function getAllowance(address tokenOwner, address spender, bytes32 currencyId)
        internal view returns(uint256)
    {
        ERC20Storage.ERC20Store storage ts = ERC20Storage.erc20Store();
        return ts.erc20Tokens[currencyId].allowances[tokenOwner][spender];
    }

    function approve(address tokenOwner, address spender, uint256 amount, bytes32 currencyKey)
        internal returns (bool)
    {
        require(tokenOwner != address(0), "LibERC20: approval from zero address");
        require(spender != address(0), "LibERC20: approval for zero address");

        ERC20Storage.ERC20Store storage ts = ERC20Storage.erc20Store();
        ts.erc20Tokens[currencyKey].allowances[tokenOwner][spender] = amount;

        emit Approved(tokenOwner, spender, amount, currencyKey);
        return true;
    }

    function transfer(address sender, address recipient, uint256 amount, bytes32 currencyKey)
        internal returns (bool)
    {
        require(sender != address(0), "LibERC20: transfer from zero address");
        require(recipient != address(0), "LibERC20: transfer to zero address");

        ERC20Storage.ERC20Store storage ts = ERC20Storage.erc20Store();
        IERC20DataUser.ERC20Data storage erc20data = ts.erc20Tokens[currencyKey];

        uint256 senderBalance = erc20data.balances[sender];
        require(senderBalance >= amount, "LibERC20: transfer amount exceeds balance");

        unchecked {
            erc20data.balances[sender] = senderBalance - amount;
        }
        erc20data.balances[recipient] += amount;

        emit Transferred(sender, recipient, amount, currencyKey);
        return true;
    }
}
