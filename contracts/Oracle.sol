// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

import "@openzeppelin/contracts/access/AccessControl.sol";

/// @title Oracle for LunaFi Protocol
/// @author nuCode
/// @notice Provide HousePool values & accept betting stakes
/// @dev Interface with HousePool contracts
contract LunaFiOracle is AccessControl {
    bytes32 public constant HOUSE_POOL_DATA_PROVIDER = keccak256("HOUSEPOOL_DATA_PROVIDER");

    struct HPData {
        uint256 expectedPendingValue;
        uint256 maxExposure;
        uint256 bettingStakes;
    }

    // Mapping of housepool addresses to their Data
    mapping(address => HPData) private data;

    event HPDataUpdated(address housePool, HPData updatedData);

    /// @param oracleAdmin address to be made the oracle admin
    constructor(address oracleAdmin) {
        _setupRole(DEFAULT_ADMIN_ROLE, oracleAdmin);
    }

    /// @notice Update House Pool Data
    /// @dev only by House Pool Data Providers
    /// @param housePool contract address of House Pool for which Data is to be updated
    /// @param newHPData House Pool Data to be updated
    function updateHPData(address housePool, HPData calldata newHPData)
    external onlyRole(HOUSE_POOL_DATA_PROVIDER)
    {
        data[housePool] = newHPData;
        emit HPDataUpdated(housePool, newHPData);
    }

    /// @notice Retrieve current House Pool data
    /// @param housePool contract address of House Pool for which Data is to be updated
    /// @return housePoolInfo House Pool information
    function getHPData(address housePool)
    external view
    returns (HPData memory housePoolInfo)
    {
        housePoolInfo = data[housePool];
    }

    /// @notice Update the value of total betting stakes
    /// @dev only by Betting contract & House Pool Data Providers // TODO sync issue
    /// @param housePool contract address of the House Pool
    /// @param newBSValue new value for betting stakes
    function updateBS(address housePool, uint256 newBSValue)
    external
    {
        data[housePool].bettingStakes = newBSValue;
    }
}
