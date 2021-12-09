// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import { IERC20 } from '../interfaces/IERC20.sol';
import  '../repositories/ERC20StorageRepository.sol';

contract usdcClaimToken is IERC20 {

  constructor()  {
      TokenStorageContract.ClaimTokenStorage storage usdcts = TokenStorageContract.usdcClaimTokenStorage();
      usdcts.name = "usdcClaimToken";
      usdcts.symbol = "UDCT";
      usdcts.decimals = 6;
      usdcts._totalSupply = 1000000000 * 10 ** uint256(usdcts.decimals);
	  usdcts.initialSupply = usdcts._totalSupply;
	  usdcts.balances[msg.sender] = usdcts._totalSupply;
      usdcts.owner = msg.sender;
      emit Transfer(address(0), msg.sender, usdcts._totalSupply);
  }

  modifier onlyAdmin() {
      TokenStorageContract.ClaimTokenStorage storage usdcts = TokenStorageContract.usdcClaimTokenStorage();
      require(usdcts.admins[msg.sender]);
      _;
  }

  modifier onlyOwner() {
      TokenStorageContract.ClaimTokenStorage storage usdcts = TokenStorageContract.usdcClaimTokenStorage();
      require(msg.sender == usdcts.owner);
      _;
  }

  function addAdmin(address _account) public onlyOwner {
      TokenStorageContract.ClaimTokenStorage storage usdcts = TokenStorageContract.usdcClaimTokenStorage();
      usdcts.admins[_account] = true;
  }

  function removeAdmin(address _account) public onlyOwner {
      TokenStorageContract.ClaimTokenStorage storage usdcts = TokenStorageContract.usdcClaimTokenStorage();
      usdcts.admins[_account] = false;
  }

  function isAdmin(address account) public view onlyOwner returns (bool) {
      TokenStorageContract.ClaimTokenStorage storage usdcts = TokenStorageContract.usdcClaimTokenStorage();
      return usdcts.admins[account];
  }

  function name() external view override returns(string memory tokenName) {
      TokenStorageContract.ClaimTokenStorage storage usdcts = TokenStorageContract.usdcClaimTokenStorage();
      tokenName = usdcts.name;
  }

  function symbol() external view override returns(string memory tokenSymbol) {
      TokenStorageContract.ClaimTokenStorage storage usdcts = TokenStorageContract.usdcClaimTokenStorage();
      tokenSymbol = usdcts.symbol;
  }

   function decimals() external view override returns(uint8) {
      TokenStorageContract.ClaimTokenStorage storage usdcts = TokenStorageContract.usdcClaimTokenStorage();
      return usdcts.decimals;
   }

  function totalSupply() external view override returns(uint) {
      TokenStorageContract.ClaimTokenStorage storage usdcts = TokenStorageContract.usdcClaimTokenStorage();
      return usdcts._totalSupply;
  }

  function balanceOf(address tokenOwner) external view override returns (uint getBalance) {
      TokenStorageContract.ClaimTokenStorage storage usdcts = TokenStorageContract.usdcClaimTokenStorage();
      getBalance = usdcts.balances[tokenOwner];
  }

  function allowance(address tokenOwner, address spender) external view override returns (uint remaining) {
      TokenStorageContract.ClaimTokenStorage storage usdcts = TokenStorageContract.usdcClaimTokenStorage();
      remaining = usdcts.allowed[tokenOwner][spender];
  }

  function approve(address spender, uint tokens) external override returns (bool success) {
      TokenStorageContract.ClaimTokenStorage storage usdcts = TokenStorageContract.usdcClaimTokenStorage();
      usdcts.allowed[msg.sender][spender] = tokens;
      emit Approval(msg.sender, spender, tokens);
      return true;
  }

  function transfer(address to, uint tokens) external override returns (bool success) {
      require(to != address(0));
      TokenStorageContract.ClaimTokenStorage storage usdcts = TokenStorageContract.usdcClaimTokenStorage();
      usdcts.balances[msg.sender] = usdcts.balances[msg.sender] - tokens;
      usdcts.balances[to] = usdcts.balances[to] + tokens;
      emit Transfer(msg.sender, to, tokens);
      return true;
  }

  function transferFrom(address from, address to, uint tokens) external override returns (bool success) {
      require(to != address(0));
      TokenStorageContract.ClaimTokenStorage storage usdcts = TokenStorageContract.usdcClaimTokenStorage();
      usdcts.balances[from] = usdcts.balances[from] - tokens;
      usdcts.allowed[from][msg.sender] = usdcts.allowed[from][msg.sender] - tokens;
      usdcts.balances[to] = usdcts.balances[to] - tokens;
      emit Transfer(from, to, tokens);
      return true;
  }

   function burn(address account,uint tokens) external onlyAdmin {
      require(account != address(0),"USDCclaimToken: Burn from a zero address");
      TokenStorageContract.ClaimTokenStorage storage usdcts = TokenStorageContract.usdcClaimTokenStorage();
      uint256 accountBalance = usdcts.balances[account];
      require(accountBalance >= tokens , "USDCclaimToken: Burn amount exceeds Balance");
      usdcts.balances[account] = accountBalance - tokens;
      usdcts._totalSupply = usdcts._totalSupply - tokens;
      emit Burn(msg.sender,address(0), tokens);
   }

   function mint(address account,uint tokens) external onlyAdmin {
      require(account != address(0),"USDCclaimToken: Mint from a zero address");
      TokenStorageContract.ClaimTokenStorage storage usdcts = TokenStorageContract.usdcClaimTokenStorage();
      usdcts.balances[account] = usdcts.balances[usdcts.owner] + tokens;
      usdcts._totalSupply = usdcts._totalSupply + tokens;
      emit Mint(msg.sender,address(0),tokens);  
   }

}