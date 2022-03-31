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

        uint8 decimals = 18;

        // Team
        createVestingSchedule(
            address(0x27106C0f5c450ED30B4547681992709808964600),
            1095,
            182,
            115000000 * 10**decimals
        );
        createVestingSchedule(
            address(0xFdA31099FcB1Fc146B7bd93dd99dD7F6c081c560),
            1095,
            182,
            10000000 * 10**decimals
        );
        createVestingSchedule(
            address(0x00e294652292776e4d59F416ef35a73Cae0e01dc),
            1095,
            182,
            5000000 * 10**decimals
        );
        createVestingSchedule(
            address(0x8959f1D534C83a3031ef4b8E5aAF0C2aB954ddE4),
            1095,
            182,
            10000000 * 10**decimals
        );
        createVestingSchedule(
            address(0xBCB5BA11f7Aa02dF7d7e607Ec83F3F24880807A1),
            1095,
            182,
            2000000 * 10**decimals
        );
        createVestingSchedule(
            address(0xBc9F27d42D2D9dFb3Ea58DAE8dfb22Dc9934E0fd),
            1095,
            182,
            2000000 * 10**decimals
        );
        createVestingSchedule(
            address(0xe96703DbE09AA2f3F172c01D0fbD6F4408Ff83C2),
            1095,
            182,
            2000000 * 10**decimals
        );
        createVestingSchedule(
            address(0xaD6f284437367357f9d4C825D95a7122E4AD60aB),
            1095,
            182,
            2000000 * 10**decimals
        );
        createVestingSchedule(
            address(0x9c999F738693AB7d5fAEbDdd7B0f1564DADEAB00),
            1095,
            182,
            2000000 * 10**decimals
        );

        // Seed
        createVestingSchedule(
            address(0xce46f9aFb2cD26030021c24DC1AB52116B19B68A),
            365,
            91,
            3333333333 * 10**(decimals - 3)
        );
        createVestingSchedule(
            address(0x555187752Ef6d73758862B5d364AAB362c996d0e),
            365,
            91,
            3333333333 * 10**(decimals - 3)
        );
        createVestingSchedule(
            address(0x5E46884a77E0aC5F3126e30720Bd5218814dc5E2),
            365,
            91,
            3333333333 * 10**(decimals - 3)
        );
        createVestingSchedule(
            address(0xF49779d278F9b25e0Ac50c44CaD48ca74e50D043),
            365,
            91,
            10000000 * 10**decimals
        );
        createVestingSchedule(
            address(0xfE27c67D7a05E7D6c9C83672454a7dB7F1fD3eF1),
            365,
            91,
            2500000 * 10**decimals
        );
        createVestingSchedule(
            address(0x6F557741B2E0f1ED9563e1088f257C0086B5C8b0),
            365,
            91,
            1000000 * 10**decimals
        );
        createVestingSchedule(
            address(0xEC4636Af52275d303B71F2544389e363A0619234),
            365,
            91,
            2500000 * 10**decimals
        );
        createVestingSchedule(
            address(0xcF808867dFd2bFfb9444cf9981C3a2c2B984b330),
            365,
            91,
            2500000 * 10**decimals
        );
        createVestingSchedule(
            address(0xE0C6023B6c292D23f41dCEE3424cD24547DDca90),
            365,
            91,
            5000000 * 10**decimals
        );
        createVestingSchedule(
            address(0xc8c8559ab47C68B2A5f24D8F559Ae95290Cd68DF),
            365,
            91,
            300000 * 10**decimals
        );
        createVestingSchedule(
            address(0xdd930D3453FbEfd41938e2048a6fb49c7d3cC71F),
            365,
            91,
            500000 * 10**decimals
        );
        createVestingSchedule(
            address(0x5e351A2387512b4C19C78b530Fc872925362d37F),
            365,
            91,
            500000 * 10**decimals
        );

        // Strategic
        createVestingSchedule(
            address(0x824F0e73561D2E154F8e54dCA2987f960114C601),
            365,
            0,
            6666666667 * 10**(decimals - 4)
        );
        createVestingSchedule(
            address(0x28aD1D1559f0ff9a9EcF4e261305B5811b8786f5),
            365,
            0,
            6666666667 * 10**(decimals - 4)
        );
        createVestingSchedule(
            address(0x2bC474A6285527c708827f924333e904860fFa86),
            365,
            0,
            6666666667 * 10**(decimals - 4)
        );
        createVestingSchedule(
            address(0x85b0157c74D77c5952fA31f9e2a55025a09f697e),
            365,
            0,
            6666666667 * 10**(decimals - 4)
        );
        createVestingSchedule(
            address(0x3Cd734d663AaF9d51Da45f14019dfC4EcAfEad73),
            365,
            0,
            3333333333 * 10**(decimals - 4)
        );
        createVestingSchedule(
            address(0x8b47e534964ec0389138b43ca39f598f18806fEC),
            365,
            0,
            220000 * 10**decimals
        );
        createVestingSchedule(
            address(0xCb2052f7cB59BcBD77f0ec8Ae27Ef61B39fF57C3),
            365,
            0,
            50000000 * 10**decimals
        );
        createVestingSchedule(
            address(0x49A323CC2fa5F9A138f30794B9348e43065D8dA2),
            365,
            0,
            10000000 * 10**decimals
        );
        createVestingSchedule(
            address(0x265C50DDc99C986912D4f7Cc8357303baeEB01d9),
            365,
            0,
            3333333333 * 10**(decimals - 3)
        );
        createVestingSchedule(
            address(0xA9F28648CaB79322fB50912Ae00D68E5dc5E704f),
            365,
            0,
            3333333333 * 10**(decimals - 3)
        );
        createVestingSchedule(
            address(0xA37e4eF510150E942Def77B79d262D5Fb31299EE),
            365,
            0,
            6666666667 * 10**(decimals - 4)
        );
        createVestingSchedule(
            address(0x1fcd4F6046FE53F914d7E7379CeE359790b0e9ff),
            365,
            0,
            1666666667 * 10**(decimals - 4)
        );

        // Advisory
        createVestingSchedule(
            address(0x09A855d54C987D8e437A975f92A4E4F10bAB235c),
            1095,
            182,
            10000000 * 10**decimals
        );
        createVestingSchedule(
            address(0x16F700f8713Ca47c6693DbDD814126f7a1704f87),
            1095,
            182,
            10000000 * 10**decimals
        );

        // Testing for claiming tokens
        createVestingSchedule(
            address(0x70997970C51812dc3A010C7d01b50e0d17dc79C8),
            1095,
            182,
            10000000 * 10**decimals
        );
        createVestingSchedule(
            address(0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC),
            1095,
            31,
            10000000 * 10**decimals
        );
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
    ) internal onlyOwner {
        require(_vestingPeriod > 0, "Vesting period must be > 0");
        require(_amount > 0, "Vesting amount must be > 0");
        require(
            vestingScheduleIdsByAddress[_recipient] == 0,
            "Vesting schedule already present for this recipient"
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
        require(block.timestamp > startTime, "Vesting is not started.");
        bool vestingHasEnded = true;
        for (uint256 i = 1; i <= vestingScheduleCounter; i++) {
            if (!vestingSchedulesById[i].vestingEnded) {
                vestingHasEnded = false;
                break;
            }
        }

        require(!vestingHasEnded, "Vesting has ended.");

        require(remainingVestingAmount > 0, "No tokens available to transfer");

        for (uint256 i = 1; i <= vestingScheduleCounter; i++) {
            transferVestedTokensById(i);
        }
    }

    /**
     * @notice Release vested amount of tokens.
     * @param id unique id of vesting
     */
    function transferVestedTokensById(uint256 id) internal {
        uint256 _amount = computeReleasableAmount(id);

        require(
            remainingVestingAmount > _amount,
            "No tokens available to transfer"
        );

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
            "No existing vesting."
        );

        uint256 id = vestingScheduleIdsByAddress[msg.sender];

        require(remainingVestingAmount > 0, "No tokes available to transfer");

        require(
            block.timestamp > startTime + vestingSchedulesById[id].cliffPeriod,
            "Cannot claim before cliff"
        );

        uint256 _amount = computeReleasableAmount(id);

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
        require(id <= vestingScheduleCounter, "vesting: index out of bounds");
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
