// SPDX-License-Identifier:  MIT
pragma solidity 0.8.10;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";
import "contracts/interfaces/IFundDistributor.sol";

interface IRewardToken is IERC20Upgradeable,IFundDistributor {
    function transfer(address _recipient, uint256 _amount)
        external
        returns (bool);
}

contract FundDistributor is OwnableUpgradeable {
    using SafeMathUpgradeable for uint256;
    using SafeERC20Upgradeable for IRewardToken;

    IRewardToken public rewardToken;
    uint256 public missingDecimals;

    // CONTRACTS
    mapping(address => bool) public requesters;

    modifier onlyRequester() {
        require(requesters[msg.sender], "Only pool can request transfer");
        _;
    }

    function initialize(
        address reward
    ) external initializer{
        rewardToken = IRewardToken(reward);
        missingDecimals = 18 - ERC20Upgradeable(reward).decimals();
    }
    
    function distributeReward(address _receiver, uint256 _amount)
        public
        onlyRequester
    {
        require(_receiver != address(0), "Invalid address");
        if (_amount > 0) {
            //rewardToken.mint(_receiver, _amount.div(10**missingDecimals));
            rewardToken.safeTransfer(_receiver, _amount);
        }
    }

    function addRequester(address _requester) external onlyOwner {
        require(!requesters[_requester], "requester existed");
        requesters[_requester] = true;
        emit RequesterAdded(_requester);
    }

    function removeRequester(address _requester) external onlyOwner {
        require(requesters[_requester], "requester not found");
        delete requesters[_requester];
        emit RequesterRemoved(_requester);
    }

    event RequesterAdded(address indexed requester);
    event RequesterRemoved(address indexed requester);
    event FundRequested(uint256 indexed amount);
}
