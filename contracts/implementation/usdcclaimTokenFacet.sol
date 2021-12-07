// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import { IERC20 } from '../interfaces/IERC20.sol';
import  '../repositories/ERC20Storage.sol';

contract wbtcClaimToken is IERC20, TokenStorageContract {

  constructor()  {
    ClaimTokenStorage storage gts = usdcClaimTokenStorage();
    gts.name = "usdcClaimToken";
    gts.symbol = "UDCT";
    gts.decimals = 6;
    gts._totalSupply = 1000000000 * 10 ** uint256(gts.decimals);
	  gts.initialSupply = gts._totalSupply;
	  gts.balances[msg.sender] = gts._totalSupply;
    gts.owner = msg.sender;
    emit Transfer(address(0), msg.sender, gts._totalSupply);
  }

  modifier onlyAdmin() {
    ClaimTokenStorage storage gts = usdcClaimTokenStorage();
    require(gts.admins[msg.sender]);
    _;
    }

   modifier onlyOwner() {
     ClaimTokenStorage storage gts = usdcClaimTokenStorage();
     require(msg.sender == gts.owner);
     _;
    }

  function name() external view override returns(string memory tokenName) {
    ClaimTokenStorage storage gts = usdcClaimTokenStorage();
    tokenName = gts.name;
  }

  function symbol() external view override returns(string memory tokenSymbol) {
     ClaimTokenStorage storage gts = usdcClaimTokenStorage();
     tokenSymbol = gts.symbol;
   }

   function decimals() external view override returns(uint8) {
     ClaimTokenStorage storage gts = usdcClaimTokenStorage();
     return gts.decimals;
   }

  function totalSupply() external view override returns(uint) {
     ClaimTokenStorage storage gts = usdcClaimTokenStorage();
     return gts._totalSupply;
  }

  function balanceOf(address tokenOwner) external view override returns (uint getBalance) {
    ClaimTokenStorage storage gts = usdcClaimTokenStorage();
    getBalance = gts.balances[tokenOwner];
  }

  function allowance(address tokenOwner, address spender) external view override returns (uint remaining) {
    ClaimTokenStorage storage gts = usdcClaimTokenStorage();
    remaining = gts.allowed[tokenOwner][spender];
  }

  function approve(address spender, uint tokens) external override returns (bool success) {
    ClaimTokenStorage storage gts = usdcClaimTokenStorage();
    gts.allowed[msg.sender][spender] = tokens;
    emit Approval(msg.sender, spender, tokens);
    return true;
  }

  function transfer(address to, uint tokens) external override returns (bool success) {
    require(to != address(0));
    ClaimTokenStorage storage gts = usdcClaimTokenStorage();
    gts.balances[msg.sender] = gts.balances[msg.sender] - tokens;
    gts.balances[to] = gts.balances[to] + tokens;
    emit Transfer(msg.sender, to, tokens);
    return true;
  }

  function transferFrom(address from, address to, uint tokens) external override returns (bool success) {
    require(to != address(0));
    ClaimTokenStorage storage gts = usdcClaimTokenStorage();
    gts.balances[from] = gts.balances[from] - tokens;
    gts.allowed[from][msg.sender] = gts.allowed[from][msg.sender] - tokens;
    gts.balances[to] = gts.balances[to] - tokens;
    emit Transfer(from, to, tokens);
    return true;
  }

   function burn(address account,uint tokens) external onlyAdmin {
     require(account != address(0),"USDCclaimToken: Burn from a zero address");
     ClaimTokenStorage storage gts = usdcClaimTokenStorage();
     uint256 accountBalance = gts.balances[account];
     require(accountBalance >= tokens , "USDCclaimToken: Burn amount exceeds Balance");
     gts.balances[account] = accountBalance - tokens;
     gts._totalSupply = gts._totalSupply - tokens;
     emit Burn(msg.sender,address(0), tokens);
   }

   function mint(address account,uint tokens) external onlyAdmin {
     require(account != address(0),"USDCclaimToken: Mint from a zero address");
     ClaimTokenStorage storage gts = usdcClaimTokenStorage();
     gts.balances[account] = gts.balances[gts.owner] + tokens;
     gts._totalSupply = gts._totalSupply + tokens;
     emit Mint(msg.sender,address(0),tokens);  
    }

}