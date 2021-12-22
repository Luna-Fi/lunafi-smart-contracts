// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import '../libraries/helpers/Utils.sol';
import  '../repositories/TokenStorage.sol';
import '../templates/ERC20Abstraction.sol';
import { IERC20MetadataUser, IERC20DataUser } from '../interfaces/IERC20User.sol';

import "hardhat/console.sol";

library LibToken {
    event Approved(address indexed _owner, address indexed _spender, uint256 _value, bytes32 _currencyKey);
    event Transferred(address indexed _from, address indexed _to, uint256 _value, bytes32 _currencyKey);
    event Burnt(address _from, uint256 _value, bytes32 _currencyKey);
    event Minted(address _from, uint256 _value, bytes32 _currencyKey);
    event Created(address _creator, bytes32 _currencyKey, address _erc20Address);
    // TODO // event Destroyed(address _creator, bytes32 _currencyKey);

    function tokenExists(bytes32 currencyKey) internal returns (bool)
    {
        TokenStorage.TokenStore storage ts = TokenStorage.tokenStore();
        return ts.erc20Tokens[currencyKey].erc20Implementation == address(0);
    }

    function createClaimToken(IERC20MetadataUser.ERC20Metadata calldata _tokenMetadata,
                              address _serverAddress,
                              address _forERC20)
        internal
    {
        bytes32 _currencyKey = Utils._getTokenStoreKey(_tokenMetadata.name);
        require(!tokenExists(_currencyKey), 'LibERC20: token exists');

        TokenStorage.TokenStore storage ts = TokenStorage.tokenStore();
        ts.erc20Tokens[_currencyKey].tokenMetadata = _tokenMetadata;
        ts.erc20Tokens[_currencyKey].forERC20 = _forERC20;
        address _erc20Address =  address(new ERC20Abstraction(_serverAddress, _currencyKey));
        ts.erc20Tokens[_currencyKey].erc20Implementation = _erc20Address;

        emit Created(msg.sender, _currencyKey, _erc20Address);
    }

    function getERC20ForClaimToken(bytes32 ckey)
        internal view returns (IERC20)
    {
        TokenStorage.TokenStore storage ts = TokenStorage.tokenStore();
        return IERC20(ts.erc20Tokens[ckey].forERC20);
    }

    function getName(bytes32 currencyKey)
        internal view returns(string memory)
    {
        TokenStorage.TokenStore storage ts = TokenStorage.tokenStore();
        return ts.erc20Tokens[currencyKey].tokenMetadata.name;
    }

    function getSymbol(bytes32 currencyKey)
        internal view returns(string memory)
    {
        TokenStorage.TokenStore storage ts = TokenStorage.tokenStore();
        return ts.erc20Tokens[currencyKey].tokenMetadata.symbol;
    }

    function getDecimals(bytes32 currencyKey)
        internal view returns(uint8)
    {
        TokenStorage.TokenStore storage ts = TokenStorage.tokenStore();
        return ts.erc20Tokens[currencyKey].tokenMetadata.decimals;
    }


    function getTotalSupply(bytes32 currencyKey) internal view returns(uint256) {
        TokenStorage.TokenStore storage ts = TokenStorage.tokenStore();
        return ts.erc20Tokens[currencyKey].totalSupply;
    }

    function mint(address account, uint256 amount, bytes32 currencyKey)
        internal
    {
        require(account != address(0), "LibERC20: mint from a zero address");

        TokenStorage.TokenStore storage ts = TokenStorage.tokenStore();
        IERC20DataUser.ERC20Data storage erc20data = ts.erc20Tokens[currencyKey];

        erc20data.totalSupply += amount;
        erc20data.balances[account] += amount;

        emit Minted(account, amount, currencyKey);
     }

    function burn(address account, uint256 amount, bytes32 currencyKey)
        internal
    {
        require(account != address(0),"LibERC20: Burn from a zero address");

        TokenStorage.TokenStore storage ts = TokenStorage.tokenStore();
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
        TokenStorage.TokenStore storage ts = TokenStorage.tokenStore();
        return ts.erc20Tokens[currencyId].balances[account];
    }

    function getAllowance(address tokenOwner, address spender, bytes32 currencyId)
        internal view returns(uint256)
    {
        TokenStorage.TokenStore storage ts = TokenStorage.tokenStore();
        return ts.erc20Tokens[currencyId].allowances[tokenOwner][spender];
    }

    function approve(address tokenOwner, address spender, uint256 amount, bytes32 currencyKey)
        internal returns (bool)
    {
        require(tokenOwner != address(0), "LibERC20: approval from zero address");
        require(spender != address(0), "LibERC20: approval for zero address");

        TokenStorage.TokenStore storage ts = TokenStorage.tokenStore();
        ts.erc20Tokens[currencyKey].allowances[tokenOwner][spender] = amount;

        emit Approved(tokenOwner, spender, amount, currencyKey);
        return true;
    }

    function transfer(address sender, address recipient, uint256 amount, bytes32 currencyKey)
        internal returns (bool)
    {
        require(sender != address(0), "LibERC20: transfer from zero address");
        require(recipient != address(0), "LibERC20: transfer to zero address");

        TokenStorage.TokenStore storage ts = TokenStorage.tokenStore();
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