// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";
import "./SCToken.sol";

import "@openzeppelin/contracts/utils/math/Math.sol";

contract SCHStake is Initializable, UUPSUpgradeable, AccessControl {
    using Math for uint256;
    using SafeERC20 for IERC20;
    event SCHToken(address schToken);

    event RequestStake(address indexed user, uint256 indexed pid, uint256 amount);

    event GetReward(address indexed user, uint256 indexed pid, uint256 rewardSCH);

    event Stake(address indexed user, uint256 indexed pid, uint256 amount);

    event StakeLock(bool stakeLock);

    event RewardLock(bool rewardLock);

    event UpdatePool(Pool pool);

    event AddPool(Pool pool);
    SCToken public SCH;

    // keccak256(abi.encode(uint256(keccak256("SCH.storage.Pausable")) - 1)) & ~bytes32(uint256(0xff))
    bytes32 private constant PauseStorageLocation =
    0x1439faa3c8ff087e5c9854e0b0a2595080151d36c2f23adb4e6b283fff578b00;

    struct Pool {
        //质押币地址
        address tokenAddress;
        //权重
        uint256 wight;
        //这个池子的质押币
        uint256 totalStakeAmount;
        //这个池子最后一次奖励的block number
        uint256 lastBlockNumber;
        //每个质押代币累积的SCH(这只是累加值)
        uint256 accRCCPerST;
        //每个质押币的奖励数量
        uint256 rccPerST;
        //这个池子的总奖励
        uint256 totalReward;
        //最小质押数量
        uint256 minStakeAmount;
        //解除质押锁定的区块
        uint256 unStakeLockBlockNumber;
    }

    struct User {
        //用户地址
        address userAddress;
        //已领取的奖励数量
        uint256 finishedRCC;
        //待领取的奖励数量
        uint256 pendingRCC;
        //用户质押数量
        uint256 stakeAmount;
        //用户已领取的奖励数量
        Request[] requests;
    }
    /*是否需要紧急关闭*/
    struct PauseStorage {
        bool isPause;
    }

    struct Request {
        uint256 amount;
        uint256 rewardSCH;
        /*判断是否到达可以领取奖励的区块*/
        uint256 isRewardBlockNumber;
    }
    /*质押控制*/
    bool stakeLock;

    /*奖励控制*/
    bool rewardLock;

    //每个block奖励的代币
    uint256 rewardPerBlock;

    //总的权重
    uint256 totalWight;

    Pool[] pools;

    mapping(uint256 => Pool) poolsMapping;

    mapping(uint256 => mapping(address => User)) usersMapping;

    mapping(uint256 => mapping(address => bool)) existUser;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    function initialize(SCToken _SCH, uint256 _rewardPerBlock) public initializer {
        _grantRole(ADMIN_ROLE, msg.sender);
        setSCH(_SCH);
        rewardPerBlock = _rewardPerBlock;
        _pause_stake_lock_init();
        _pause_reward_lock_init();
        _pause_init();
    }

    /*通过汇编语言进行值的设定，相当于占一个槽*/
    function _getPauseStorage() private pure returns (PauseStorage storage $) {
        assembly {
            $.slot := PauseStorageLocation
        }
    }

    function getSCTokenAddress() public view returns (address) {
        return address(SCH);
    }

    /*初始化的时候进行设定是否需要暂听*/
    function _pause_init() internal {
        PauseStorage storage $ = _getPauseStorage();
        $.isPause = false;
    }

    /*初始化质押锁*/
    function _pause_stake_lock_init() internal onlyRole(ADMIN_ROLE){
        stakeLock = false;
    }

    function _stake_lock() internal onlyRole(ADMIN_ROLE){
        require(stakeLock, "stake lock is already open");
        stakeLock = false;
        emit StakeLock(stakeLock);
    }

    function _stake_unlock() internal onlyRole(ADMIN_ROLE){
        require(!stakeLock, "stake lock is already close");
        stakeLock = true;
        emit StakeLock(stakeLock);
    }

    /*初始化奖励锁*/
    function _pause_reward_lock_init() internal onlyRole(ADMIN_ROLE){
        rewardLock = false;
    }

    function _reward_lock() internal onlyRole(ADMIN_ROLE){
        require(rewardLock, "reward lock is already open");
        rewardLock = false;
        emit RewardLock(stakeLock);
    }

    function _reward_unlock() internal onlyRole(ADMIN_ROLE){
        require(!rewardLock, "reward lock is already close");
        rewardLock = true;
        emit RewardLock(stakeLock);
    }

    /*查看质押锁状态*/
    function getStakeLock() public view returns (bool) {
        return stakeLock;
    }

    /*查看奖励锁状态*/
    function getRewardLock() public view returns (bool) {
        return rewardLock;
    }

    /*紧急暂停*/
    function pause() public onlyRole(ADMIN_ROLE) {
        PauseStorage storage $ = _getPauseStorage();
        $.isPause = true;
    }

    /*恢复使用*/
    function unPause() public onlyRole(ADMIN_ROLE) {
        PauseStorage storage $ = _getPauseStorage();
        $.isPause = false;
    }

    //设置代币
    function setSCH(SCToken _SCH) internal onlyRole(ADMIN_ROLE) {
        SCH = _SCH;
        emit SCHToken(address(_SCH));
    }

    function addPool(
        uint256 wight,
        address _tokenAddress,
        uint256 _minStakeAmount,
        bool isUpdatePool,
        uint256 _unStakeLockBlockNumber
    ) public onlyRole(ADMIN_ROLE) {
        if (isUpdatePool) {
            _updatePools();
        }
        totalWight += wight;

        pools.push(
            Pool({
                tokenAddress: _tokenAddress,
                wight: wight,
                totalStakeAmount: 0,
                lastBlockNumber: block.number,
                totalReward: 0,
                accRCCPerST: 0,
                rccPerST: 0,
                minStakeAmount: _minStakeAmount,
                unStakeLockBlockNumber: _unStakeLockBlockNumber
            })
        );
        poolsMapping[pools.length - 1] = pools[pools.length - 1];

        emit AddPool(pools[pools.length - 1]);
    }

    function _updatePools() internal {
        require(pools.length > 0, "current pool not init");

        for (uint256 i = 0; i < pools.length; i++) {
            _updatePool(i);
        }
    }

    function _updatePool(uint256 _pid) internal checkPid(_pid) {
        Pool storage pool = pools[_pid];
        uint256 currentBlock = block.number;
        uint256 poolBlock = pool.lastBlockNumber;
        uint256 weight = pool.wight;
        require(currentBlock > poolBlock, "current pool dont need update");
        (, uint256 reward) = (currentBlock - poolBlock).tryMul(weight);
        (, uint256 totalReward) = reward.tryDiv(totalWight);

        pool.totalReward += totalReward;
        pool.lastBlockNumber = currentBlock;
        //这里计算阶段性每个质押币获取的奖励数
        (, uint256 rewardSCHST) = reward.tryDiv(pool.totalStakeAmount);
        pool.accRCCPerST += rewardSCHST;
        (, uint256 perSCHST) = pool.totalReward.tryDiv(pool.totalStakeAmount);
        pool.rccPerST = perSCHST;

        emit UpdatePool(pool);
    }

    function _authorizeUpgrade(address newImplementation)
    internal
    override
    onlyRole(ADMIN_ROLE)
    {}

    //解除质押
    function pauseStake(
        uint256 _pid,
        address _user,
        uint256 _amount
    ) public checkPid(_pid) checkUser(_user) {
        require(_user == msg.sender, "only user can pause stake");

        require(_pid <= pools.length, "pid error");
        Pool storage pool = pools[_pid];
        require(
            pool.minStakeAmount <= _amount,
            "stake amount lass than minStakeAmount"
        );

        require(pool.totalStakeAmount >= _amount, "amount error");

        User storage user = usersMapping[_pid][_user];

        require(user.stakeAmount >= _amount, "balance not enough");

        _updatePool(_pid);

        (, uint256 _pendingRCC) = _amount.tryMul(pool.rccPerST);
        user.pendingRCC += _pendingRCC;
        /*要放在这前面，不然会有可能会超额进行扣减*/
        user.stakeAmount -= _amount;

        user.requests.push(
            Request({
                amount: _amount,
                rewardSCH: _pendingRCC,
                isRewardBlockNumber: pool.lastBlockNumber +
            pool.unStakeLockBlockNumber
            })
        );

        emit RequestStake(_user, _pid, _amount);
    }

    /*这里只能是管理员调用，因为代币都是管理员控制统一进行分配的*/
    function getReward(uint256 _pid, address _user)
    public
    checkPid(_pid)
    onlyRole(ADMIN_ROLE)
    _whenRewardUnlock
    {
        require(_pid <= pools.length, "pid error");

        require(existUser[_pid][_user], "user not exist");

        User storage user = usersMapping[_pid][_user];

        Request[] storage _requests = user.requests;

        require(_requests.length > 0, "no request");

        uint256 sumAmount = 0;
        uint256 sumReward = 0;

        uint256 index = 0;

        while (_requests.length > 0 && index < _requests.length) {
            Request memory request = _requests[index];
            uint256 currentBlock = block.number;
            //这里要判断是否已经到了可以领取的区块
            if (currentBlock < request.isRewardBlockNumber) {
                index++;
                continue;
            }
            sumAmount += request.amount;
            sumReward += request.rewardSCH;
            /*这里要进行将已完成的数据删除*/
            _requests[index] = _requests[_requests.length - 1];
            _requests.pop();
        }
        /*更新用户信息*/
        user.finishedRCC += sumReward;
        /*由于已经领取了奖励，所以这里的奖励要进行扣减*/
        user.pendingRCC -= sumReward;

        pools[_pid].totalStakeAmount -= sumAmount;
        pools[_pid].totalReward -= sumReward;
        /*这里暂时不需要更新质押池*/
        //        _updatePool(_pid);

        SCH.transfer(_user, sumReward);

        emit GetReward(_user, _pid, sumReward);
    }

    /*用户质押数据*/
    function stake(
        uint256 _pid,
        address _user,
        uint256 _amount
    ) public checkPid(_pid) checkUser(_user) {
        Pool storage pool = pools[_pid];
        /*判断每次质押的币数量是否大于最小质押数量*/
        require(_amount >= pool.minStakeAmount, "per stake can not lass than minStakeAmount");

        /*进行质押币转账*/
        if(_amount>0){
            IERC20(pool.tokenAddress).safeTransferFrom(_user, address(this), _amount);
        }

        User storage user = usersMapping[_pid][_user];

        if (existUser[_pid][_user]) {
            user.stakeAmount += _amount;
        } else {
            user.userAddress = _user;
            user.stakeAmount = _amount;
            user.finishedRCC = 0;
            user.pendingRCC = 0;
            existUser[_pid][_user] = true;
        }

        pool.totalStakeAmount += _amount;

        /*更新池子信息*/
        _updatePool(_pid);

        emit Stake(_user, _pid, _amount);
    }

    /*获取用户信息*/
    function getUserInfo(uint256 _pid, address _user)
    public
    view
    checkPid(_pid)
    checkUser(_user)
    returns (User memory)
    {
        return usersMapping[_pid][_user];
    }

    function getPoolLength() public view returns (uint256)  {
        return pools.length;
    }

    function getPool(uint256 _pid) public view checkPid(_pid) returns (Pool memory)  {
        return pools[_pid];
    }

    /*获取余额*/
    function getBalance(address _user)
    public
    view
    checkUser(_user)
    returns (uint256)
    {
        return SCH.balanceOf(_user);
    }

    modifier checkPid(uint256 _pid) {
        require(_pid < pools.length, "must send from SCH");
        _;
    }

    modifier checkUser(address userAddress) {
        require(userAddress == msg.sender, "only user can getReward");
        _;
    }

    modifier _whenStakeUnlock() {
        require(!stakeLock, "not allow to stake");
        _;
    }

    modifier _whenRewardUnlock() {
        require(!rewardLock, "not allow to stake");
        _;
    }
}
