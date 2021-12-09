// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import { IERC20 } from '../interfaces/IERC20.sol';
import  '../repositories/ERC20StorageRepository.sol';

contract wethClaimToken is IERC20  {

    constructor()  {
        TokenStorageContract.ClaimTokenStorage storage wetcts = TokenStorageContract.wethClaimTokenStorage()();
        wetcts.name = "wethClaimToken";
        wetcts.symbol = "WECT";
        wetcts.decimals = 18;
        wetcts._totalSupply = 1000000000 * 10 ** uint256(wetcts.decimals);
        wetcts.initialSupply = wetcts._totalSupply;
        wetcts.balances[msg.sender] = wetcts._totalSupply;
        wetcts.owner = msg.sender;
        emit Transfer(address(0), msg.sender, wetcts._totalSupply);
    }

    modifier onlyAdmin() {
        TokenStorageContract.ClaimTokenStorage storage wetcts = TokenStorageContract.wethClaimTokenStorage()();
        require(wetcts.admins[msg.sender]);
        _;
    }

    modifier onlyOwner() {
        TokenStorageContract.ClaimTokenStorage storage wetcts = TokenStorageContract.wethClaimTokenStorage()();
        require(msg.sender == wetcts.owner);
        _;
    }

    function addAdmin(address _account) public onlyOwner {
        TokenStorageContract.ClaimTokenStorage storage wetcts = TokenStorageContract.wethClaimTokenStorage()();
        wetcts.admins[_account] = true;
    }

    function removeAdmin(address _account) public onlyOwner {
        TokenStorageContract.ClaimTokenStorage storage wetcts = TokenStorageContract.wethClaimTokenStorage()();
        wetcts.admins[_account] = false;
    }

    function isAdmin(address account) public view onlyOwner returns (bool) {
        TokenStorageContract.ClaimTokenStorage storage wetcts = TokenStorageContract.wethClaimTokenStorage()();
        return wetcts.admins[account];
    }

    function name() external view override returns(string memory tokenName) {
        TokenStorageContract.ClaimTokenStorage storage wetcts = TokenStorageContract.wethClaimTokenStorage()();
        tokenName = wetcts.name;
    }

    function symbol() external view override returns(string memory tokenSymbol) {
        TokenStorageContract.ClaimTokenStorage storage wetcts = TokenStorageContract.wethClaimTokenStorage()();
        tokenSymbol = wetcts.symbol;
    }

    function decimals() external view override returns(uint8) {
        TokenStorageContract.ClaimTokenStorage storage wetcts = TokenStorageContract.wethClaimTokenStorage()();
        return wetcts.decimals;
    }

    function totalSupply() external view override returns(uint) {
        TokenStorageContract.ClaimTokenStorage storage wetcts = TokenStorageContract.wethClaimTokenStorage()();
        return wetcts._totalSupply;
    }

    function balanceOf(address tokenOwner) external view override returns (uint getBalance) {
        TokenStorageContract.ClaimTokenStorage storage wetcts = TokenStorageContract.wethClaimTokenStorage()();
        getBalance = wetcts.balances[tokenOwner];
    }

    function allowance(address tokenOwner, address spender) external view override returns (uint remaining) {
        TokenStorageContract.ClaimTokenStorage storage wetcts = TokenStorageContract.wethClaimTokenStorage()();
        remaining = wetcts.allowed[tokenOwner][spender];
    }

    function approve(address spender, uint tokens) external override returns (bool success) {
        TokenStorageContract.ClaimTokenStorage storage wetcts = TokenStorageContract.wethClaimTokenStorage()();
        wetcts.allowed[msg.sender][spender] = tokens;
        emit Approval(msg.sender, spender, tokens);
        return true;
    }

    function transfer(address to, uint tokens) external override returns (bool success) {
        require(to != address(0));
        TokenStorageContract.ClaimTokenStorage storage wetcts = TokenStorageContract.wethClaimTokenStorage()();
        wetcts.balances[msg.sender] = wetcts.balances[msg.sender] - tokens;
        wetcts.balances[to] = wetcts.balances[to] + tokens;
        emit Transfer(msg.sender, to, tokens);
        return true;
    }

    function transferFrom(address from, address to, uint tokens) external override returns (bool success) {
        require(to != address(0));
        TokenStorageContract.ClaimTokenStorage storage wetcts = TokenStorageContract.wethClaimTokenStorage()();
        wetcts.balances[from] = wetcts.balances[from] - tokens;
        wetcts.allowed[from][msg.sender] = wetcts.allowed[from][msg.sender] - tokens;
        wetcts.balances[to] = wetcts.balances[to] - tokens;
        emit Transfer(from, to, tokens);
        return true;
    }

   function burn(address account,uint tokens) external onlyAdmin {
       require(account != address(0),"wethclaimToken: Burn from a zero address");
       TokenStorageContract.ClaimTokenStorage storage wetcts = TokenStorageContract.wethClaimTokenStorage()();
       uint256 accountBalance = wetcts.balances[account];
       require(accountBalance >= tokens , "wethclaimToken: Burn amount exceeds Balance");
       wetcts.balances[account] = accountBalance - tokens;
       wetcts._totalSupply = wetcts._totalSupply - tokens;
       emit Burn(msg.sender,address(0), tokens);
   }

   function mint(address account,uint tokens) external onlyAdmin {
      require(account != address(0),"wethclaimToken: Mint from a zero address");
      TokenStorageContract.ClaimTokenStorage storage wetcts = TokenStorageContract.wethClaimTokenStorage()();
      wetcts.balances[account] = wetcts.balances[wetcts.owner] + tokens;
      wetcts._totalSupply = wetcts._totalSupply + tokens;
      emit Mint(msg.sender,address(0),tokens);  
   }

} 