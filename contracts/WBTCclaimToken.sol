// SPDX-License-Identifier: MIT

pragma solidity 0.8.10;

import "./libraries/SafeMath.sol";
import "./interfaces/ERC20Interface.sol";

//--------------------------------------
//   WBTC claim Token Contract 
//
// Symbol      : WBTCCT
// Name        : WBTCClaimToken
// Total supply: 0
// Decimals    : 8
//--------------------------------------

contract WBTCclaimToken is ERC20Interface, SafeMath {
    
    uint8 public decimals;
    address public owner;
    uint256 public _totalSupply;
    uint256 public initialSupply;
    string public name;
    string public symbol;

    mapping(address => uint256) internal balances;
    mapping(address => mapping(address => uint256)) internal allowed;
    mapping(address => bool) internal admins;

    modifier onlyAdmin() {
        require(admins[msg.sender]);
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    constructor()  {
        name = "WBTCClaimToken";
        symbol = "WBTCCT";
        decimals = 8;
        _totalSupply = 0;
	    initialSupply = _totalSupply;
	    balances[msg.sender] = _totalSupply;
        owner = msg.sender;
        emit Transfer(address(0), msg.sender, _totalSupply);
    }


    function addAdmin(address account) public onlyOwner {
        admins[account] = true;
    }

    function removeAdmin(address account) public onlyOwner {
        admins[account] = false;
    }

    function isAdmin(address account) public view onlyOwner returns (bool) {
        return admins[account];
    }


    function totalSupply() external view override returns (uint256) {
        return safeSub(_totalSupply, balances[address(0)]);
    }

    function balanceOf(address tokenOwner) external view override returns (uint getBalance) {
        return balances[tokenOwner];
    }

    function allowance(address tokenOwner, address spender) external view override returns (uint remaining) {
        return allowed[tokenOwner][spender];
    }
 
    function approve(address spender, uint tokens) external override returns (bool success) {
        allowed[msg.sender][spender] = tokens;
        emit Approval(msg.sender, spender, tokens);
        return true;
    }
    
    function transfer(address to, uint tokens) external override returns (bool success) {
        require(to != address(0),"WBTCclaimToken: Address should not be a zero");
        balances[msg.sender] = safeSub(balances[msg.sender], tokens);
        balances[to] = safeAdd(balances[to], tokens);
        emit Transfer(msg.sender, to, tokens);
        return true;
    }
    
   function transferFrom(address from, address to, uint tokens) external override returns (bool success) {
        require(to != address(0),"WBTCclaimToken: Address should not be a zero");
        balances[from] = safeSub(balances[from], tokens);
        allowed[from][msg.sender] = safeSub(allowed[from][msg.sender], tokens);
        balances[to] = safeAdd(balances[to], tokens);
        emit Transfer(from, to, tokens);
        return true;
    }
   
    function burn(address account,uint tokens) external onlyAdmin {
        require(account != address(0),"WBTCclaimToken: Burn from a zero address");
        uint256 accountBalance = balances[account];
        require(accountBalance >= tokens , "WBTCclaimToken: Burn amount exceeds Balance");
        balances[account] = safeSub(accountBalance,tokens);
        _totalSupply = safeSub(_totalSupply,tokens);
        emit Burn(msg.sender,address(0), tokens);
    }
    
    function mint(address account,uint tokens) external onlyAdmin {
        require(account != address(0),"WBTCclaimToken: Mint from a zero address");
        balances[account] = safeAdd(balances[account],tokens);
        _totalSupply = safeAdd(_totalSupply,tokens);
        emit Mint(msg.sender,address(0),tokens);  
    }

}