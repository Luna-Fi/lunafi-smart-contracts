pragma solidity 0.8.10;
import "contracts/interfaces/IHousePool.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

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

    function getPoolInformation() public view returns (HousePoolLiquidity[] memory housePoolLiquidity)
    {
        HousePoolLiquidity[] memory liquidityObj;
        uint i = 0;
        for (i = 0; i < _housePools.length; i++) {  
            liquidityObj[i] = HousePoolLiquidity({housePool: _housePools[i], liquidity: IHousePool(_housePools[i]).getLiquidityStatus()});
        }

        return liquidityObj;
    }
}


