// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import { IERC20 } from '../interfaces/IERC20.sol';
import  '../repositories/ERC20Storage.sol';

contract usdctestToken is IERC20, TokenStorageContract {
  
  constructor()  {
    ERC20TokenStorage storage gts = usdcTestTokenStorage();
    gts.name = "tUSDC";
    gts.symbol = "tUDC";
    gts.decimals = 6;
    gts._totalSupply = 1000000000 * 10 ** uint256(gts.decimals);
	  gts.initialSupply = gts._totalSupply;
	  gts.balances[msg.sender] = gts._totalSupply;
    gts.owner = msg.sender;
    emit Transfer(address(0), msg.sender, gts._totalSupply);
  }
    
   function name() external view override returns(string memory tokenName) {
     ERC20TokenStorage storage gts = usdcTestTokenStorage();
     tokenName = gts.name;
   }

   function symbol() external view override returns(string memory tokenSymbol) {
     ERC20TokenStorage storage gts = usdcTestTokenStorage();
     tokenSymbol = gts.symbol;
   }

   function decimals() external view override returns(uint8) {
     ERC20TokenStorage storage gts = usdcTestTokenStorage();
     return gts.decimals;
   }

   function totalSupply() external view override returns(uint) {
     ERC20TokenStorage storage gts = usdcTestTokenStorage();
     return gts._totalSupply;
   }

   function balanceOf(address tokenOwner) external view override returns (uint getBalance) {
     ERC20TokenStorage storage gts = usdcTestTokenStorage();
     getBalance = gts.balances[tokenOwner];
   }

   function allowance(address tokenOwner, address spender) external view override returns (uint remaining) {
     ERC20TokenStorage storage gts = usdcTestTokenStorage();
     remaining = gts.allowed[tokenOwner][spender];
   }

   function approve(address spender, uint tokens) external override returns (bool success) {
     ERC20TokenStorage storage gts = usdcTestTokenStorage();
     gts.allowed[msg.sender][spender] = tokens;
     emit Approval(msg.sender, spender, tokens);
     return true;
    }

   function transfer(address to, uint tokens) external override returns (bool success) {
     require(to != address(0));
     ERC20TokenStorage storage gts = usdcTestTokenStorage();
     gts.balances[msg.sender] = gts.balances[msg.sender] - tokens;
     gts.balances[to] = gts.balances[to] + tokens;
     emit Transfer(msg.sender, to, tokens);
     return true;
    }
  
    function transferFrom(address from, address to, uint tokens) external override returns (bool success) {
      require(to != address(0));
      ERC20TokenStorage storage gts = usdcTestTokenStorage();
      gts.balances[from] = gts.balances[from] - tokens;
      gts.allowed[from][msg.sender] = gts.allowed[from][msg.sender] - tokens;
      gts.balances[to] = gts.balances[to] - tokens;
      emit Transfer(from, to, tokens);
      return true;
    }

}