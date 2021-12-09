// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import { IERC20 } from '../interfaces/IERC20.sol';
import  '../repositories/ERC20StorageRepository.sol';

contract wbtctestToken is IERC20 {
  
    constructor()  {
        TokenStorageContract.ERC20TokenStorage storage wbttts = TokenStorageContract.wbtcTestTokenStorage();
        wbttts.name = "tWBTC";
        wbttts.symbol = "tWBTC";
        wbttts.decimals = 8;
        wbttts._totalSupply = 1000000000 * 10 ** uint256(wbttts.decimals);
        wbttts.initialSupply = wbttts._totalSupply;
        wbttts.balances[msg.sender] = wbttts._totalSupply;
        wbttts.owner = msg.sender;
        emit Transfer(address(0), msg.sender, wbttts._totalSupply);
    }
    
    function name() external view override returns(string memory tokenName) {
        TokenStorageContract.ERC20TokenStorage storage wbttts = TokenStorageContract.wbtcTestTokenStorage();
        tokenName = wbttts.name;
    }

    function symbol() external view override returns(string memory tokenSymbol) {
        TokenStorageContract.ERC20TokenStorage storage wbttts = TokenStorageContract.wbtcTestTokenStorage();
        tokenSymbol = wbttts.symbol;
    }

    function decimals() external view override returns(uint8) {
        TokenStorageContract.ERC20TokenStorage storage wbttts = TokenStorageContract.wbtcTestTokenStorage();
        return wbttts.decimals;
    }

    function totalSupply() external view override returns(uint) {
        TokenStorageContract.ERC20TokenStorage storage wbttts = TokenStorageContract.wbtcTestTokenStorage();
        return wbttts._totalSupply;
    }

    function balanceOf(address tokenOwner) external view override returns (uint getBalance) {
        TokenStorageContract.ERC20TokenStorage storage wbttts = TokenStorageContract.wbtcTestTokenStorage();
        getBalance = wbttts.balances[tokenOwner];
    }

    function allowance(address tokenOwner, address spender) external view override returns (uint remaining) {
        TokenStorageContract.ERC20TokenStorage storage wbttts = TokenStorageContract.wbtcTestTokenStorage();
        remaining = wbttts.allowed[tokenOwner][spender];
    }

    function approve(address spender, uint tokens) external override returns (bool success) {
        TokenStorageContract.ERC20TokenStorage storage wbttts = TokenStorageContract.wbtcTestTokenStorage();
        wbttts.allowed[msg.sender][spender] = tokens;
        emit Approval(msg.sender, spender, tokens);
        return true;
    }

   function transfer(address to, uint tokens) external override returns (bool success) {
        require(to != address(0));
        TokenStorageContract.ERC20TokenStorage storage wbttts = TokenStorageContract.wbtcTestTokenStorage();
        wbttts.balances[msg.sender] = wbttts.balances[msg.sender] - tokens;
        wbttts.balances[to] = wbttts.balances[to] + tokens;
        emit Transfer(msg.sender, to, tokens);
        return true;
    }
  
    function transferFrom(address from, address to, uint tokens) external override returns (bool success) {
        require(to != address(0));
        TokenStorageContract.ERC20TokenStorage storage wbttts = TokenStorageContract.wbtcTestTokenStorage();
        wbttts.balances[from] = wbttts.balances[from] - tokens;
        wbttts.allowed[from][msg.sender] = wbttts.allowed[from][msg.sender] - tokens;
        wbttts.balances[to] = wbttts.balances[to] - tokens;
        emit Transfer(from, to, tokens);
        return true;
    }

}