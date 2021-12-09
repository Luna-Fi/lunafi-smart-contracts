// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import { IERC20 } from '../interfaces/IERC20.sol';
import  '../repositories/ERC20StorageRepository.sol';

contract wethtestToken is IERC20 {
  
    constructor()  {
        
        TokenStorageContract.ERC20TokenStorage storage wetts = TokenStorageContract.wethTestTokenStorage();
        wetts.name = "tWETH";
        wetts.symbol = "tWETH";
        wetts.decimals = 18;
        wetts._totalSupply = 1000000000 * 10 ** uint256(wetts.decimals);
        wetts.initialSupply = wetts._totalSupply;
        wetts.balances[msg.sender] = wetts._totalSupply;
        wetts.owner = msg.sender;
        emit Transfer(address(0), msg.sender, wetts._totalSupply);
    }
    
    function name() external view override returns(string memory tokenName) {
        TokenStorageContract.ERC20TokenStorage storage wetts = TokenStorageContract.wethTestTokenStorage();
        tokenName = wetts.name;
    }

    function symbol() external view override returns(string memory tokenSymbol) {
        TokenStorageContract.ERC20TokenStorage storage wetts = TokenStorageContract.wethTestTokenStorage();
        tokenSymbol = wetts.symbol;
    }

    function decimals() external view override returns(uint8) {
        TokenStorageContract.ERC20TokenStorage storage wetts = TokenStorageContract.wethTestTokenStorage();
        return wetts.decimals;
    }

    function totalSupply() external view override returns(uint) {
        TokenStorageContract.ERC20TokenStorage storage wetts = TokenStorageContract.wethTestTokenStorage();
        return wetts._totalSupply;
    }

    function balanceOf(address tokenOwner) external view override returns (uint getBalance) {
        TokenStorageContract.ERC20TokenStorage storage wetts = TokenStorageContract.wethTestTokenStorage();
        getBalance = wetts.balances[tokenOwner];
    }

    function allowance(address tokenOwner, address spender) external view override returns (uint remaining) {
        TokenStorageContract.ERC20TokenStorage storage wetts = TokenStorageContract.wethTestTokenStorage();
        remaining = wetts.allowed[tokenOwner][spender];
    }

    function approve(address spender, uint tokens) external override returns (bool success) {
        TokenStorageContract.ERC20TokenStorage storage wetts = TokenStorageContract.wethTestTokenStorage();
        wetts.allowed[msg.sender][spender] = tokens;
        emit Approval(msg.sender, spender, tokens);
        return true;
    }

    function transfer(address to, uint tokens) external override returns (bool success) {
        require(to != address(0));
        TokenStorageContract.ERC20TokenStorage storage wetts = TokenStorageContract.wethTestTokenStorage();
        wetts.balances[msg.sender] = wetts.balances[msg.sender] - tokens;
        wetts.balances[to] = wetts.balances[to] + tokens;
        emit Transfer(msg.sender, to, tokens);
        return true;
    }
  
    function transferFrom(address from, address to, uint tokens) external override returns (bool success) {
        require(to != address(0));
        TokenStorageContract.ERC20TokenStorage storage wetts = TokenStorageContract.wethTestTokenStorage();
        wetts.balances[from] = wetts.balances[from] - tokens;
        wetts.allowed[from][msg.sender] = wetts.allowed[from][msg.sender] - tokens;
        wetts.balances[to] = wetts.balances[to] - tokens;
        emit Transfer(from, to, tokens);
        return true;
    }

}