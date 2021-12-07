// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import { IERC20 } from '../interfaces/IERC20.sol';
import  '../repositories/ERC20Storage.sol';

contract wbtcClaimToken is IERC20, TokenStorageContract {

    constructor()  {
        ClaimTokenStorage storage gts = wbtcClaimTokenStorage();
        gts.name = "wbtcClaimToken";
        gts.symbol = "WBCT";
        gts.decimals = 8;
        gts._totalSupply = 1000000000 * 10 ** uint256(gts.decimals);
        gts.initialSupply = gts._totalSupply;
        gts.balances[msg.sender] = gts._totalSupply;
        gts.owner = msg.sender;
        emit Transfer(address(0), msg.sender, gts._totalSupply);
    }

    modifier onlyAdmin() {
        ClaimTokenStorage storage gts = wbtcClaimTokenStorage();
        require(gts.admins[msg.sender]);
        _;
    }

    modifier onlyOwner() {
        ClaimTokenStorage storage gts = wbtcClaimTokenStorage();
        require(msg.sender == gts.owner);
        _;
      }

    function name() external view override returns(string memory tokenName) {
        ClaimTokenStorage storage gts = wbtcClaimTokenStorage();
        tokenName = gts.name;
    }

    function symbol() external view override returns(string memory tokenSymbol) {
        ClaimTokenStorage storage gts = wbtcClaimTokenStorage();
        tokenSymbol = gts.symbol;
    }

    function decimals() external view override returns(uint8) {
        ClaimTokenStorage storage gts = wbtcClaimTokenStorage();
        return gts.decimals;
    }

    function totalSupply() external view override returns(uint) {
        ClaimTokenStorage storage gts = wbtcClaimTokenStorage();
        return gts._totalSupply;
    }

    function balanceOf(address tokenOwner) external view override returns (uint getBalance) {
        ClaimTokenStorage storage gts = wbtcClaimTokenStorage();
        getBalance = gts.balances[tokenOwner];
    }

    function allowance(address tokenOwner, address spender) external view override returns (uint remaining) {
        ClaimTokenStorage storage gts = wbtcClaimTokenStorage();
        remaining = gts.allowed[tokenOwner][spender];
    }

    function approve(address spender, uint tokens) external override returns (bool success) {
        ClaimTokenStorage storage gts = wbtcClaimTokenStorage();
        gts.allowed[msg.sender][spender] = tokens;
        emit Approval(msg.sender, spender, tokens);
        return true;
    }

    function transfer(address to, uint tokens) external override returns (bool success) {
        require(to != address(0));
        ClaimTokenStorage storage gts = wbtcClaimTokenStorage();
        gts.balances[msg.sender] = gts.balances[msg.sender] - tokens;
        gts.balances[to] = gts.balances[to] + tokens;
        emit Transfer(msg.sender, to, tokens);
        return true;
    }

    function transferFrom(address from, address to, uint tokens) external override returns (bool success) {
        require(to != address(0));
        ClaimTokenStorage storage gts = wbtcClaimTokenStorage();
        gts.balances[from] = gts.balances[from] - tokens;
        gts.allowed[from][msg.sender] = gts.allowed[from][msg.sender] - tokens;
        gts.balances[to] = gts.balances[to] - tokens;
        emit Transfer(from, to, tokens);
        return true;
    }

    function burn(address account,uint tokens) external onlyAdmin {
        require(account != address(0),"wbtcclaimToken: Burn from a zero address");
        ClaimTokenStorage storage gts = wbtcClaimTokenStorage();
        uint256 accountBalance = gts.balances[account];
        require(accountBalance >= tokens , "wbtcclaimToken: Burn amount exceeds Balance");
        gts.balances[account] = accountBalance - tokens;
        gts._totalSupply = gts._totalSupply - tokens;
        emit Burn(msg.sender,address(0), tokens);
    }

    function mint(address account,uint tokens) external onlyAdmin {
        require(account != address(0),"wbtcclaimToken: Mint from a zero address");
        ClaimTokenStorage storage gts = wbtcClaimTokenStorage();
        gts.balances[account] = gts.balances[gts.owner] + tokens;
        gts._totalSupply = gts._totalSupply + tokens;
        emit Mint(msg.sender,address(0),tokens);  
    }

}