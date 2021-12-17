// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../libraries/LibDiamond.sol";
import "../interfaces/IERC173.sol";
import "hardhat/console.sol";

contract OwnershipFacet is IERC173 {
    function transferOwnership(address _newOwner) external {
        LibDiamond.enforceIsContractOwner();
        LibDiamond.setContractOwner(_newOwner);
    }

    function owner() external view returns (address owner_) {
        owner_ = LibDiamond.contractOwner();
    }
}