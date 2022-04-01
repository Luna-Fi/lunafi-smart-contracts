// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";

abstract contract BPContract {
    function protect(address sender, address receiver, uint256 amount) external virtual;
}

contract LFIToken is
    ERC20,
    Pausable,
    ERC20Permit,
    AccessControl
{
    string constant TOKEN_NAME = "LFIToken";
    string constant TOKEN_SYMBOL = "LFI";

    
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");

    uint256 public maxSupply;

    uint8 internal constant DECIMAL_PLACES = 18;

    BPContract public BP;
    bool public bpEnabled;
    bool public BPDisabledForever = false;

    mapping(string => bytes32) internal roles;

    constructor(uint256 supply) ERC20(TOKEN_NAME, TOKEN_SYMBOL) ERC20Permit(TOKEN_NAME) {
        maxSupply = supply * 10**DECIMAL_PLACES; // 1 Billion Tokens ^ 10 decimals

        super._mint(msg.sender, maxSupply);

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MANAGER_ROLE, msg.sender);
    }

    function setBPAddress(address _bp) external onlyRole(MANAGER_ROLE){
        require(address(BP) == address(0),"can only be initialized once");
        BP = BPContract(_bp);
    }

    function setBpEnabled(bool _enabled) external onlyRole(MANAGER_ROLE) {
        bpEnabled = _enabled;
    }

    function setBotProtectionDisableForever() external onlyRole(MANAGER_ROLE) {
        require(BPDisabledForever == false);
        BPDisabledForever = true;
    }

    function pause() external onlyRole(PAUSER_ROLE) returns (bool) {
        _pause();
        return true;
    }

    function unpause() external onlyRole(PAUSER_ROLE) returns (bool) {
        _unpause();
        return true;
    }

    function decimals() public pure override returns (uint8) {
        return DECIMAL_PLACES;
    }

    /**
     * @dev See {IERC20-totalSupply}.
     */
    function totalSupply() public view override returns (uint256) {
        return super.totalSupply();
    }

    /**
     * @dev See {IERC20-balanceOf}.
     */
    function balanceOf(address account) public view override returns (uint256) {
        return super.balanceOf(account);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override(ERC20) whenNotPaused {
        if(bpEnabled && !BPDisabledForever) {
            BP.protect(from,to,amount);
        }
        super._beforeTokenTransfer(from, to, amount);
    }

    function _afterTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override(ERC20) {
        super._afterTokenTransfer(from, to, amount);
    }

    function _mint(address to, uint256 amount) internal override(ERC20) {
        require(
            totalSupply() + amount <= maxSupply,
            "Error: Max supply reached, 1 Billion tokens minted."
        );
        super._mint(to, amount);
    }

    function _burn(address account, uint256 amount) internal override(ERC20) {
        super._burn(account, amount);
    }

    function stringToBytes32(string memory source)
        internal
        pure
        returns (bytes32 result)
    {
        bytes memory _S = bytes(source);

        return keccak256(_S);
    }

    function setRole(string memory role, address add)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        bytes32 _role = stringToBytes32(role);
        roles[role] = _role;
        _setupRole(_role, add);
    }

    function revokeRole(string memory role, address revoke)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        bytes32 _role = stringToBytes32(role);
        roles[role] = _role;
        _revokeRole(_role, revoke);
    }
}

