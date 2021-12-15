// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import { IERC20 } from '../interfaces/IERC20.sol';
import  '../repositories/ERC20StorageRepository.sol';

contract wbtcClaimToken is IERC20 {

    constructor()  {
        TokenStorageContract.ClaimTokenStorage storage wbtcts = TokenStorageContract.wbtcClaimTokenStorage();
        wbtcts.name = "wbtcClaimToken";
        wbtcts.symbol = "WBCT";
        wbtcts.decimals = 8;
        wbtcts._totalSupply = 0 * 10 ** uint256(wbtcts.decimals);
        wbtcts.initialSupply = wbtcts._totalSupply;
        wbtcts.balances[msg.sender] = wbtcts._totalSupply;
        wbtcts.owner = msg.sender;
        emit Transfer(address(0), msg.sender, wbtcts._totalSupply);
    }

    modifier onlyAdmin() {
        TokenStorageContract.ClaimTokenStorage storage wbtcts = TokenStorageContract.wbtcClaimTokenStorage();
        require(wbtcts.admins[msg.sender]);
        _;
    }

    modifier onlyOwner() {
        TokenStorageContract.ClaimTokenStorage storage wbtcts = TokenStorageContract.wbtcClaimTokenStorage();
        require(msg.sender == wbtcts.owner);
        _;
      }
    
    function addAdmin(address _account) public onlyOwner {
        TokenStorageContract.ClaimTokenStorage storage wbtcts = TokenStorageContract.wbtcClaimTokenStorage();
        wbtcts.admins[_account] = true;
    }

    function removeAdmin(address _account) public onlyOwner {
        TokenStorageContract.ClaimTokenStorage storage wbtcts = TokenStorageContract.wbtcClaimTokenStorage();
        wbtcts.admins[_account] = false;
    }

    function isAdmin(address account) public view onlyOwner returns (bool) {
        TokenStorageContract.ClaimTokenStorage storage wbtcts = TokenStorageContract.wbtcClaimTokenStorage();
        return wbtcts.admins[account];
    }

    function name() external view override returns(string memory tokenName) {
        TokenStorageContract.ClaimTokenStorage storage wbtcts = TokenStorageContract.wbtcClaimTokenStorage();
        tokenName = wbtcts.name;
    }

    function symbol() external view override returns(string memory tokenSymbol) {
        TokenStorageContract.ClaimTokenStorage storage wbtcts = TokenStorageContract.wbtcClaimTokenStorage();
        tokenSymbol = wbtcts.symbol;
    }

    function decimals() external view override returns(uint8) {
        TokenStorageContract.ClaimTokenStorage storage wbtcts = TokenStorageContract.wbtcClaimTokenStorage();
        return wbtcts.decimals;
    }

    function totalSupply() external view override returns(uint) {
        TokenStorageContract.ClaimTokenStorage storage wbtcts = TokenStorageContract.wbtcClaimTokenStorage();
        return wbtcts._totalSupply;
    }

    function balanceOf(address tokenOwner) external view override returns (uint getBalance) {
        TokenStorageContract.ClaimTokenStorage storage wbtcts = TokenStorageContract.wbtcClaimTokenStorage();
        getBalance = wbtcts.balances[tokenOwner];
    }

    function allowance(address tokenOwner, address spender) external view override returns (uint remaining) {
        TokenStorageContract.ClaimTokenStorage storage wbtcts = TokenStorageContract.wbtcClaimTokenStorage();
        remaining = wbtcts.allowed[tokenOwner][spender];
    }

    function approve(address spender, uint tokens) external override returns (bool success) {
        TokenStorageContract.ClaimTokenStorage storage wbtcts = TokenStorageContract.wbtcClaimTokenStorage();
        wbtcts.allowed[msg.sender][spender] = tokens;
        emit Approval(msg.sender, spender, tokens);
        return true;
    }

    function transfer(address to, uint tokens) external override returns (bool success) {
        require(to != address(0));
        TokenStorageContract.ClaimTokenStorage storage wbtcts = TokenStorageContract.wbtcClaimTokenStorage();
        wbtcts.balances[msg.sender] = wbtcts.balances[msg.sender] - tokens;
        wbtcts.balances[to] = wbtcts.balances[to] + tokens;
        emit Transfer(msg.sender, to, tokens);
        return true;
    }

    function transferFrom(address from, address to, uint tokens) external override returns (bool success) {
        require(to != address(0));
        TokenStorageContract.ClaimTokenStorage storage wbtcts = TokenStorageContract.wbtcClaimTokenStorage();
        wbtcts.balances[from] = wbtcts.balances[from] - tokens;
        wbtcts.allowed[from][msg.sender] = wbtcts.allowed[from][msg.sender] - tokens;
        wbtcts.balances[to] = wbtcts.balances[to] - tokens;
        emit Transfer(from, to, tokens);
        return true;
    }

    function burn(address account,uint tokens) external onlyAdmin {
        require(account != address(0),"wbtcclaimToken: Burn from a zero address");
        TokenStorageContract.ClaimTokenStorage storage wbtcts = TokenStorageContract.wbtcClaimTokenStorage();
        uint256 accountBalance = wbtcts.balances[account];
        require(accountBalance >= tokens , "wbtcclaimToken: Burn amount exceeds Balance");
        wbtcts.balances[account] = accountBalance - tokens;
        wbtcts._totalSupply = wbtcts._totalSupply - tokens;
        emit Burn(msg.sender,address(0), tokens);
    }

    function mint(address account,uint tokens) external onlyAdmin {
        require(account != address(0),"wbtcclaimToken: Mint from a zero address");
        TokenStorageContract.ClaimTokenStorage storage wbtcts = TokenStorageContract.wbtcClaimTokenStorage();
        wbtcts.balances[account] = wbtcts.balances[wbtcts.owner] + tokens;
        wbtcts._totalSupply = wbtcts._totalSupply + tokens;
        emit Mint(msg.sender,address(0),tokens);  
    }

}