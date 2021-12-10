// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import { IERC20 } from '../interfaces/IERC20.sol';
import  '../repositories/ERC20StorageRepository.sol';

contract usdctestTokenFacet is IERC20 {
  
    constructor()  {
        TokenStorageContract.ERC20TokenStorage storage usdtts = TokenStorageContract.usdcTestTokenStorage();
        usdtts.name = "tUSDC";
        usdtts.symbol = "tUDC";
        usdtts.decimals = 6;
        usdtts._totalSupply = 1000000000 * 10 ** uint256(usdtts.decimals);
        usdtts.initialSupply = usdtts._totalSupply;
        usdtts.balances[msg.sender] = usdtts._totalSupply;
        usdtts.owner = msg.sender;
        emit Transfer(address(0), msg.sender, usdtts._totalSupply);
    }
    
    function name() external view override returns(string memory tokenName) {
        TokenStorageContract.ERC20TokenStorage storage usdtts = TokenStorageContract.usdcTestTokenStorage();
        tokenName = usdtts.name;
    }

    function symbol() external view override returns(string memory tokenSymbol) {
        TokenStorageContract.ERC20TokenStorage storage usdtts = TokenStorageContract.usdcTestTokenStorage();
        tokenSymbol = usdtts.symbol;
    }

    function decimals() external view override returns(uint8) {
        TokenStorageContract.ERC20TokenStorage storage usdtts = TokenStorageContract.usdcTestTokenStorage();
        return usdtts.decimals;
    }

    function totalSupply() external view override returns(uint) {
        TokenStorageContract.ERC20TokenStorage storage usdtts = TokenStorageContract.usdcTestTokenStorage();
        return usdtts._totalSupply;
    }

    function balanceOf(address tokenOwner) external view override returns (uint getBalance) {
        TokenStorageContract.ERC20TokenStorage storage usdtts = TokenStorageContract.usdcTestTokenStorage();
        getBalance = usdtts.balances[tokenOwner];
    }

    function allowance(address tokenOwner, address spender) external view override returns (uint remaining) {
        TokenStorageContract.ERC20TokenStorage storage usdtts = TokenStorageContract.usdcTestTokenStorage();
        remaining = usdtts.allowed[tokenOwner][spender];
    }

    function approve(address spender, uint tokens) external override returns (bool success) {
        TokenStorageContract.ERC20TokenStorage storage usdtts = TokenStorageContract.usdcTestTokenStorage();
        usdtts.allowed[msg.sender][spender] = tokens;
        emit Approval(msg.sender, spender, tokens);
        return true;
    }

    function transfer(address to, uint tokens) external override returns (bool success) {
        require(to != address(0));
        TokenStorageContract.ERC20TokenStorage storage usdtts = TokenStorageContract.usdcTestTokenStorage();
        usdtts.balances[msg.sender] = usdtts.balances[msg.sender] - tokens;
        usdtts.balances[to] = usdtts.balances[to] + tokens;
        emit Transfer(msg.sender, to, tokens);
        return true;
    }
  
    function transferFrom(address from, address to, uint tokens) external override returns (bool success) {
        require(to != address(0));
        TokenStorageContract.ERC20TokenStorage storage usdtts = TokenStorageContract.usdcTestTokenStorage();
        usdtts.balances[from] = usdtts.balances[from] - tokens;
        usdtts.allowed[from][msg.sender] = usdtts.allowed[from][msg.sender] - tokens;
        usdtts.balances[to] = usdtts.balances[to] - tokens;
        emit Transfer(from, to, tokens);
        return true;
    }

}