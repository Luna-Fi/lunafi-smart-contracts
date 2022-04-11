// SPDX-License-Identifier: MIT

pragma solidity 0.8.10;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @notice claimToken contract. ERC20 contract for LunaFi's LP Tokens
contract claimToken is IERC20 {
    uint8 public decimals;
    address public owner;
    uint256 public _totalSupply;
    uint256 public initialSupply;
    uint256 public constant maxCap = 1000000000 * 10**18;
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

    /// @notice constructor to construct the contract with the initial values
    /// @param tokenName The name of the token
    /// @param tokenSymbol The symbol of the token
    constructor(string memory tokenName, string memory tokenSymbol) {
        name = tokenName;
        symbol = tokenSymbol;
        decimals = 18;
        _totalSupply = 0;
        initialSupply = _totalSupply;
        owner = msg.sender;
        balances[msg.sender] = _totalSupply;
        emit Transfer(address(0), msg.sender, _totalSupply);
    }

    /// @notice addAdmin function is used to add an admin. Only this admin can call mint or burn the tokens
    /// @param account the EOA address to be added as an admin.
    function addAdmin(address account) public onlyOwner {
        admins[account] = true;
    }

    /// @notice removeAadmin function is used to remove an admin. 
    /// @param account the EOA address to be removed as an admin
    function removeAdmin(address account) public onlyOwner {
        admins[account] = false;
    }

    /// @notice isAdmin function is used to query if the provided address is an admin or not
    /// @param account the EOA address to query if that address is an admin or not
    function isAdmin(address account) public view onlyOwner returns (bool) {
        return admins[account];
    }

    /// @notice totalSupply function returns the total number of tokens
    function totalSupply() external view override returns (uint256) {
        return _totalSupply - balances[address(0)];
    }

    /// @notice balanceOf function returns the balance of a particular user
    /// @param tokenOwner the address to which the token balance is returned
    function balanceOf(address tokenOwner)
        external
        view
        override
        returns (uint256 getBalance)
    {
        return balances[tokenOwner];
    }

    /// @notice allowance function that returns the allowance
    function allowance(address tokenOwner, address spender)
        external
        view
        override
        returns (uint256 remaining)
    {
        return allowed[tokenOwner][spender];
    }

    function approve(address spender, uint256 tokens)
        external
        override
        returns (bool success)
    {
        allowed[msg.sender][spender] = tokens;
        emit Approval(msg.sender, spender, tokens);
        return true;
    }

    function transfer(address to, uint256 tokens)
        external
        override
        returns (bool success)
    {
        require(
            to != address(0),
            "USDCclaimToken: Address should not be a zero"
        );
        balances[msg.sender] = balances[msg.sender] - tokens;
        balances[to] = balances[to] + tokens;
        emit Transfer(msg.sender, to, tokens);
        return true;
    }

    function transferFrom(
        address from,
        address to,
        uint256 tokens
    ) external override returns (bool success) {
        require(
            to != address(0),
            "USDCclaimToken: Address should not be a zero"
        );
        balances[from] = balances[from] - tokens;
        allowed[from][msg.sender] = allowed[from][msg.sender] - tokens;
        balances[to] = balances[to] + tokens;
        emit Transfer(from, to, tokens);
        return true;
    }

    /// @notice burn function burns the tokens of the token holder, Token holder should be an admin
    function burn(address account, uint256 tokens) external  {
        require(account == msg.sender,"Only the token Owner can burn their tokens");
        require(
            account != address(0),
            "USDCclaimToken: Burn from a zero address"
        );
        uint256 accountBalance = balances[account];
        require(
            accountBalance >= tokens,
            "USDCclaimToken: Burn amount exceeds Balance"
        );
        balances[account] = accountBalance - tokens;
        _totalSupply = _totalSupply - tokens;
        emit Transfer(account, address(0), tokens);
    }

    /// @notice burn function mints the tokens of the token holder, Token holder should be an admin
    function mint(address account, uint256 tokens) external onlyAdmin {
        require(
            account != address(0),
            "USDCclaimToken: Mint from a zero address"
        );
        require(
            _totalSupply + tokens <= maxCap,
            "Error: Max supply reached, 1 Billion tokens minted."
        );
        balances[account] = balances[account] + tokens;
        _totalSupply = _totalSupply + tokens;
        emit Transfer(address(0), account, tokens);
    }
}
