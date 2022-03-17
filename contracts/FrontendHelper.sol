pragma solidity 0.8.10;

import "@openzeppelin/contracts/access/AccessControl.sol";

interface IHousePool {
    function getTokenPrice() external view returns (uint256);
    function getTokenWithdrawlPrice() external view returns (uint256);
    function getLiquidityStatus() external view returns (uint256);
    function getMyLiquidity(address _user) external view returns (uint256);
}

contract FrontendHelper is AccessControl {

    struct HousePoolLiquidity {
    address housePool;
    uint256 liquidity; 
    }

    address[] _housePools;

    constructor(
        address _admin,
        address[] memory housePools
    ) {
        _setupRole(DEFAULT_ADMIN_ROLE, _admin);
        _housePools = housePools;
    }

    function setPools(address[] memory housePools)
        public
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        _housePools = housePools;
    }


function getPoolInformation() public view returns (HousePoolLiquidity[] memory){
    uint numberOfPools = _housePools.length;
      HousePoolLiquidity[]    memory liquidityObj = new HousePoolLiquidity[](numberOfPools);
      for (uint i = 0; i < numberOfPools; i++) {
          HousePoolLiquidity memory liquidity = HousePoolLiquidity({housePool: _housePools[i], liquidity: IHousePool(_housePools[i]).getLiquidityStatus()});
          liquidityObj[i] = liquidity;
      }
      return liquidityObj;
  }
}

