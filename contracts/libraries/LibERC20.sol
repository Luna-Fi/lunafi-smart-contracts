// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import  '../repositories/ERC20StorageRepository.sol';

library LibERC20 {
    function initializeERC20(bytes32 erc20SymbolInBytes32) internal {
        ERC20StorageRepository.ClaimTokenStore storage cts = ERC20StorageRepository.claimTokenStore();
        string memory erc20Symbol = string(abi.encodePacked(erc20SymbolInBytes32));
        cts.acceptedCryptos[erc20SymbolInBytes32].symbol = erc20Symbol;
    }

    /* /// @dev warning! from https://ethereum.stackexchange.com/a/9152 */
    /* function stringToBytes32(string memory source) internal pure returns (bytes32 result) { */
    /*     bytes memory temp = bytes(source); */
    /*     if (temp.length == 0) { */
    /*         return 0x0; */
    /*     } */
    /*     assembly { result := mload(add(source, 32)) } */
    /* } */

    /* function name(bytes32 cryptoName) internal view returns(string memory tokenName) { */
    /* } */

    function symbol(bytes32 erc20) external view returns(string memory tokenSymbol) {
        ERC20StorageRepository.ClaimTokenStore storage cts = ERC20StorageRepository.claimTokenStore();
        tokenSymbol = cts.acceptedCryptos[erc20].symbol;
    }

    /*  function decimals() external view override returns(uint8) { */
    /*     TokenStorageContract.ClaimTokenStorage storage usdcts = TokenStorageContract.usdcClaimTokenStorage(); */
    /*     return usdcts.decimals; */
    /*  } */

    /* function totalSupply() external view override returns(uint) { */
    /*     TokenStorageContract.ClaimTokenStorage storage usdcts = TokenStorageContract.usdcClaimTokenStorage(); */
    /*     return usdcts._totalSupply; */
    /* } */

    /* function balanceOf(address tokenOwner) external view override returns (uint getBalance) { */
    /*     TokenStorageContract.ClaimTokenStorage storage usdcts = TokenStorageContract.usdcClaimTokenStorage(); */
    /*     getBalance = usdcts.balances[tokenOwner]; */
    /* } */

    /* function allowance(address tokenOwner, address spender) external view override returns (uint remaining) { */
    /*     TokenStorageContract.ClaimTokenStorage storage usdcts = TokenStorageContract.usdcClaimTokenStorage(); */
    /*     remaining = usdcts.allowed[tokenOwner][spender]; */
    /* } */

    /* function approve(address spender, uint tokens) external override returns (bool success) { */
    /*     TokenStorageContract.ClaimTokenStorage storage usdcts = TokenStorageContract.usdcClaimTokenStorage(); */
    /*     usdcts.allowed[msg.sender][spender] = tokens; */
    /*     emit Approval(msg.sender, spender, tokens); */
    /*     return true; */
    /* } */

    /* function transfer(address to, uint tokens) external override returns (bool success) { */
    /*     require(to != address(0)); */
    /*     TokenStorageContract.ClaimTokenStorage storage usdcts = TokenStorageContract.usdcClaimTokenStorage(); */
    /*     usdcts.balances[msg.sender] = usdcts.balances[msg.sender] - tokens; */
    /*     usdcts.balances[to] = usdcts.balances[to] + tokens; */
    /*     emit Transfer(msg.sender, to, tokens); */
    /*     return true; */
    /* } */

    function transferFrom(bytes32 currency, address from, address to, uint tokens) external returns (bool success) {
        require(to != address(0));
        ERC20StorageRepository.ClaimTokenStore storage cts = ERC20StorageRepository.claimTokenStore();
        ERC20StorageRepository.ERC20TokenStore storage _weth = cts.acceptedCryptos[currency];
        /* TokenStorageContract.ClaimTokenStorage storage usdcts = TokenStorageContract.usdcClaimTokenStorage(); */
        /* usdcts.balances[from] = usdcts.balances[from] - tokens; */
        /* usdcts.allowed[from][msg.sender] = usdcts.allowed[from][msg.sender] - tokens; */
        /* usdcts.balances[to] = usdcts.balances[to] - tokens; */
        /* emit Transfer(from, to, tokens); */
        _weth.balances[to] = _weth.balances[to] + tokens;
        return true;
    }

    /*  function burn(address account,uint tokens) external onlyAdmin { */
    /*     require(account != address(0),"USDCclaimToken: Burn from a zero address"); */
    /*     TokenStorageContract.ClaimTokenStorage storage usdcts = TokenStorageContract.usdcClaimTokenStorage(); */
    /*     uint256 accountBalance = usdcts.balances[account]; */
    /*     require(accountBalance >= tokens , "USDCclaimToken: Burn amount exceeds Balance"); */
    /*     usdcts.balances[account] = accountBalance - tokens; */
    /*     usdcts._totalSupply = usdcts._totalSupply - tokens; */
    /*     emit Burn(msg.sender,address(0), tokens); */
    /*  } */

    /*  function mint(address account,uint tokens) external onlyAdmin { */
    /*     require(account != address(0),"USDCclaimToken: Mint from a zero address"); */
    /*     TokenStorageContract.ClaimTokenStorage storage usdcts = TokenStorageContract.usdcClaimTokenStorage(); */
    /*     usdcts.balances[account] = usdcts.balances[usdcts.owner] + tokens; */
    /*     usdcts._totalSupply = usdcts._totalSupply + tokens; */
    /*     emit Mint(msg.sender,address(0),tokens);   */
    /*  } */

}
