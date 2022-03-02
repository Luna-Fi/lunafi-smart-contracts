// SPDX-License-Identifier: MIT

pragma solidity 0.8.10;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title simpleVesting
 */
contract simpleVesting is Ownable, ReentrancyGuard, AccessControl {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    struct VestingSchedule {
        // unique id for each beneficiary
        uint256 vestingId;
        // wallet address of beneficiary
        address recipient;
        // duration of the vesting period in seconds
        uint256 vestingPeriod;
        // total amount of tokens to be vested to the beneficiary
        uint256 allocatedAmount;
        // amount of tokens released
        uint256 vestedAmount;
        // vesting is ended
        bool isEnded;
    }

    // address of the ERC20 token
    IERC20 private immutable _token;

    // mapping from address to VestingSchedule
    mapping(address => VestingSchedule) private vestingSchedulesByAddress;

    // mapping from id to VestingSchedule
    mapping(uint256 => VestingSchedule) private vestingSchedulesById;

    // mapping from index to accounts to be took part in vesting
    mapping(uint256 => address) public vestingAccounts;

    // total amount vested in schedules
    uint256 private vestingTotalAmount;

    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");

    uint256 public vestingScheduleCounter = 0;

    uint256 public startTime;

    // value for minutes in a day
    uint32 private MINUTES_IN_DAY;

    event TokenVested(address indexed accout, uint256 amount);

    /**
     * @dev Creates a vesting contract.
     * @param token_ address of the ERC20 token contract
     */
    constructor(address token_, uint256 _startTime) {
        require(token_ != address(0x0));
        _token = IERC20(token_);

        startTime = _startTime;

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MANAGER_ROLE, msg.sender);

        MINUTES_IN_DAY = 1; // 24 * 60 for mainnet, 1 for testnet

        uint8 decimals = 18;
        createVestingSchedule(
            address(0x70997970C51812dc3A010C7d01b50e0d17dc79C8),
            180,
            10000 * 10**decimals
        );
        createVestingSchedule(
            address(0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC),
            360,
            20000 * 10**decimals
        );
        createVestingSchedule(
            address(0x90F79bf6EB2c4f870365E785982E1f101E93b906),
            90,
            30000 * 10**decimals
        );
        createVestingSchedule(
            address(0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65),
            360,
            40000 * 10**decimals
        );
    }

    /**
     * @notice Creates a new vesting schedule for an account.
     * @param _recipient address of recipient
     * @param _vestingPeriod duration in seconds of the period in which the tokens will vest
     * @param _amount total amount of tokens to be released at the end of the vesting
     */
    function createVestingSchedule(
        address _recipient,
        uint256 _vestingPeriod,
        uint256 _amount
    ) internal onlyOwner {
        require(_vestingPeriod > 0, "Vesting period must be > 0");
        require(_amount > 0, "Vesting amount must be > 0");

        vestingAccounts[vestingScheduleCounter] = _recipient;

        VestingSchedule memory vesting = VestingSchedule(
            vestingScheduleCounter,
            _recipient,
            (_vestingPeriod).mul(MINUTES_IN_DAY).mul(60),
            _amount,
            0,
            false
        );

        vestingSchedulesByAddress[_recipient] = vesting;
        vestingSchedulesById[vestingScheduleCounter] = vesting;

        vestingScheduleCounter++;
        vestingTotalAmount = vestingTotalAmount.add(_amount);
    }

    /**
     * @notice Release vested amount of tokens.
     */
    function transferVestedTokens() public onlyRole(MANAGER_ROLE) nonReentrant {
        require(block.timestamp > startTime, 'Vesting is not started.');

        bool isFinalEnded = true;
        for (uint256 i = 0; i < vestingScheduleCounter; i++) {
            if (!vestingSchedulesById[i].isEnded) {
                isFinalEnded = false;
                break;
            }
        }

        require(!isFinalEnded, 'Vesting is ended.');

        for (uint256 i = 0; i < vestingScheduleCounter; i++) {
            transferVestedTokenById(i);
        }
    }

    /**
     * @notice Release vested amount of tokens.
     * @param id unique id of vesting
     */
    function transferVestedTokenById(uint256 id)
        internal
        onlyRole(MANAGER_ROLE)
    {
        uint256 _amount = computeReleasableAmount(id);
        vestingSchedulesById[id].vestedAmount += _amount;

        if (block.timestamp > startTime.add(vestingSchedulesById[id].vestingPeriod)){
            vestingSchedulesById[id].isEnded = true;
        }

        // _token.approve(msg.sender, _amount);

        // _token.transfer(vestingSchedulesById[id].recipient, _amount);
        _token.transferFrom(msg.sender, vestingSchedulesById[id].recipient, _amount);

        emit TokenVested(vestingSchedulesById[id].recipient, _amount);
    }

    /**
     * @dev Computes the vested amount of tokens at this moment since last vesting
     * @param id vesting id
     * @return _amount of new tokens vested at this moment since last vesting
     */
    function computeReleasableAmount(uint256 id)
        public
        view
        returns (uint256 _amount)
    {
        if (vestingSchedulesById[id].isEnded) {
            _amount = 0;
        } else {
            if (block.timestamp < startTime) 
            {
                _amount = 0;
            }
            else if (block.timestamp > startTime.add(vestingSchedulesById[id].vestingPeriod))
            {
                _amount = vestingSchedulesById[id].allocatedAmount - vestingSchedulesById[id].vestedAmount;
            }
            else
            {
                _amount = (vestingSchedulesById[id].allocatedAmount).mul(block.timestamp - startTime).div(vestingSchedulesById[id].vestingPeriod).sub(vestingSchedulesById[id].vestedAmount);
            }
        }
    }

    function getStartTime() public view returns (uint256) {
        return startTime;
    }

    /**
     * @dev Returns the vesting account address at the given id.
     * @return the vesting account address
     */
    function getVestingAccountById(uint256 id)
        public
        view
        returns (address)
    {
        require(
            id < vestingScheduleCounter,
            "simpleVesting: index out of bounds"
        );
        return vestingSchedulesById[id].recipient;
    }

    /**
     * @notice Returns the vesting schedule struct for a given address.
     * @return the vesting schedule structure information
     */
    function getVestingScheduleByAddress(address account)
        public
        view
        returns (VestingSchedule memory)
    {
        return vestingSchedulesByAddress[account];
    }

    /**
     * @notice Returns the vesting schedule struct for a given id.
     * @return the vesting schedule structure information
     */
    function getVestingScheduleById(uint256 id)
        public
        view
        returns (VestingSchedule memory)
    {
        return vestingSchedulesById[id];
    }

    /**
     * @notice Returns the total amount of vesting schedules.
     * @return the total amount of vesting schedules
     */
    function getVestingTotalAmount() external view returns (uint256) {
        return vestingTotalAmount;
    }

    /**
     * @dev Returns the address of the ERC20 token managed by the vesting contract.
     */
    function getToken() external view returns (address) {
        return address(_token);
    }

    /**
     * @dev Returns the number of vesting accounts managed by this contract.
     * @return the number of vesting accounts
     */
    function getVestingAccountsCount() public view returns (uint256) {
        return vestingScheduleCounter;
    }
}
