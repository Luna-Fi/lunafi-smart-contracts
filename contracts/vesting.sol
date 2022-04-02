// SPDX-License-Identifier: MIT

pragma solidity 0.8.10;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title vesting
 */
contract vesting is Ownable, ReentrancyGuard, AccessControl {
    using SafeERC20 for IERC20;

    struct VestingSchedule {
        // unique id for each beneficiary
        uint256 vestingId;
        // wallet address of beneficiary
        address recipient;
        // duration of the vesting period in seconds
        uint256 vestingPeriod;
        // duration of cliff period in seconds
        uint256 cliffPeriod;
        // total amount of tokens to be vested to the beneficiary
        uint256 allocatedAmount;
        // amount of tokens released to be claimed
        uint256 vestedAmount;
        // vesting is ended
        bool vestingEnded;
    }

    // address of the ERC20 token
    IERC20 private immutable _token;

    // mapping from address to VestingSchedule
    mapping(address => uint256) private vestingScheduleIdsByAddress;

    // mapping from id to VestingSchedule
    mapping(uint256 => VestingSchedule) private vestingSchedulesById;

    // mapping from index to accounts to be took part in vesting
    mapping(uint256 => address) public vestingAccounts;

    // total amount vested in schedules
    uint256 private totalVestingAmount;

    uint256 public remainingVestingAmount;

    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");

    uint256 public vestingScheduleCounter = 0;

    uint256 public startTime;

    // value for minutes in a day
    uint32 private MINUTES_IN_DAY;

    event TokenVested(address indexed accout, uint256 amount);

    event DepositTokenToContract(uint256 amount);

    event WithdrawTokenToContract(uint256 amount);

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
    }

    /**
     * @notice Creates a new vesting schedule for a beneficiary.
     * @param _recipient address of beneficiary
     * @param _vestingPeriod total linear vesting duration in days
     * @param _cliffPeriod duration in days of the period in which vesting is locked
     * @param _amount total amount of tokens to be released till the end of the vesting
     */
    function createVestingSchedule(
        address _recipient,
        uint256 _vestingPeriod,
        uint256 _cliffPeriod,
        uint256 _amount
    ) public onlyOwner {
        require(_vestingPeriod > 0, "Vesting period must be > 0");
        require(_amount > 0, "Vesting amount must be > 0");
        require(
            vestingScheduleIdsByAddress[_recipient] == 0,
            "Vesting is already exists for this recipient"
        );
        require(
            totalVestingAmount + _amount <= _token.balanceOf(address(this)),
            "Not enough funds to cover new vesting schedule."
        );

        vestingScheduleCounter++;
        vestingAccounts[vestingScheduleCounter] = _recipient;

        VestingSchedule memory vestingSchedule = VestingSchedule(
            vestingScheduleCounter,
            _recipient,
            _vestingPeriod * MINUTES_IN_DAY * 60,
            _cliffPeriod * MINUTES_IN_DAY * 60,
            _amount,
            0,
            false
        );

        vestingScheduleIdsByAddress[_recipient] = vestingScheduleCounter;
        vestingSchedulesById[vestingScheduleCounter] = vestingSchedule;
        totalVestingAmount = totalVestingAmount + _amount;
    }

    /**
     * @notice Transfer claimable amount of tokens to all beneficiaries.
     */
    function transferVestedTokens() public nonReentrant {
        require(block.timestamp > startTime, "Vesting has not started.");
        bool vestingHasEnded = true;
        for (uint256 i = 1; i <= vestingScheduleCounter; i++) {
            if (!vestingSchedulesById[i].vestingEnded) {
                vestingHasEnded = false;
                break;
            }
        }

        require(!vestingHasEnded, "Vesting has ended.");

        require(remainingVestingAmount > 0, "No remaining tokens to transfer");

        for (uint256 i = 1; i <= vestingScheduleCounter; i++) {
            transferVestedTokensById(i);
        }
    }

    /**
     * @notice Release vested amount of tokens.
     * @param id unique id of vesting
     */
    function transferVestedTokensById(uint256 id) internal {
        require(remainingVestingAmount > 0, "No remaining tokens to transfer");

        uint256 _amount = computeReleasableAmount(id);

        _token.transfer(vestingSchedulesById[id].recipient, _amount);

        vestingSchedulesById[id].vestedAmount += _amount;

        if (
            block.timestamp >=
            startTime + vestingSchedulesById[id].vestingPeriod
        ) {
            vestingSchedulesById[id].vestingEnded = true;
        }

        // update remainingVestingAmount
        remainingVestingAmount = remainingVestingAmount - _amount;

        emit TokenVested(vestingSchedulesById[id].recipient, _amount);
    }

    /**
     * @notice Claim vested tokens that have vested as of now
     * @param to redirected address of recipient
     */
    function _claimTo(address to) internal {
        require(
            vestingScheduleIdsByAddress[msg.sender] != 0,
            "Vesting schedule does not exist."
        );

        uint256 id = vestingScheduleIdsByAddress[msg.sender];

        require(
            block.timestamp > startTime + vestingSchedulesById[id].cliffPeriod,
            "Cannot claim before cliff periods ends."
        );

        uint256 _amount = computeReleasableAmount(id);

        require(remainingVestingAmount > _amount, "No remaining tokens to transfer");

        if (
            block.timestamp >=
            startTime + vestingSchedulesById[id].vestingPeriod
        ) {
            vestingSchedulesById[id].vestingEnded = true;
        }

        _token.transfer(to, _amount);

        vestingSchedulesById[id].vestedAmount += _amount;

        // update remainingVestingAmount
        remainingVestingAmount = remainingVestingAmount - _amount;

        emit TokenVested(to, _amount);
    }

    /**
     * @notice Claim vested amount of tokens.
     */
    function claim() external {
        _claimTo(msg.sender);
    }

    /**
     * @notice Claim vested amount of tokens.
     * @param to address of recipient
     */
    function claimTo(address to) external {
        _claimTo(to);
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
        if (vestingSchedulesById[id].vestingEnded) {
            _amount = 0;
        } else {
            if (block.timestamp < startTime) {
                _amount = 0;
            } else if (
                block.timestamp >=
                startTime + vestingSchedulesById[id].vestingPeriod
            ) {
                _amount =
                    vestingSchedulesById[id].allocatedAmount -
                    vestingSchedulesById[id].vestedAmount;
            } else {
                if (
                    block.timestamp >=
                    startTime + vestingSchedulesById[id].cliffPeriod
                ) {
                    _amount =
                        (vestingSchedulesById[id].allocatedAmount *
                            (block.timestamp - startTime)) /
                        vestingSchedulesById[id].vestingPeriod -
                        vestingSchedulesById[id].vestedAmount;
                } else {
                    _amount = 0;
                }
            }
        }
    }

    /**
     * @notice Owner deposit depositVestingAmount to contract.
     * @param _amount amount of tokens which Owner deposit to contract
     */
    function depositVestingAmount(uint256 _amount)
        public
        onlyRole(MANAGER_ROLE)
        nonReentrant
    {
        _token.transferFrom(msg.sender, address(this), _amount);

        //update remainingVestingAmount
        remainingVestingAmount = remainingVestingAmount + _amount;

        emit DepositTokenToContract(_amount);
    }

    function getStartTime() public view returns (uint256) {
        return startTime;
    }

    /**
     * @dev Returns the vesting account address at the given id.
     * @return the vesting account address
     */
    function getVestingAccountById(uint256 id) public view returns (address) {
        require(id <= vestingScheduleCounter, "Index out of bounds");
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
        return vestingSchedulesById[vestingScheduleIdsByAddress[account]];
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
    function getTotalVestingAmount() external view returns (uint256) {
        return totalVestingAmount;
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

    /**
     * @dev Returns the number of vesting accounts managed by this contract.
     * @param account address of vesting
     * @return the claimable token amount
     */
    function getClaimable(address account) public view returns (uint256) {
        return computeReleasableAmount(vestingScheduleIdsByAddress[account]);
    }
}
