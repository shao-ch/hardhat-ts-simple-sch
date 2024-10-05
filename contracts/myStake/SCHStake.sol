// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "./SCToken.sol";

import "@openzeppelin/contracts/utils/math/Math.sol";

contract SCHStake is Initializable, UUPSUpgradeable, AccessControl {

    using Math for uint256;
    event SCHToken(address schToken);

    event RequestStake(address user, uint256 pid, uint256 amount);

    SCToken public SCH;

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
    }

    struct User {
        //质押池id
        uint256 _pid;

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

    struct Request {
        uint256 amount;
        uint256 rewardSCH;
    }

    //每个block奖励的代币
    uint256 rewardPerBlock;

    //总的权重
    uint256 totalWight;

    Pool[] pools;

    mapping(uint256 => Pool) poolsMapping;

    mapping(uint256 => mapping(address => User)) usersMapping;

    mapping(uint256 => mapping(address => bool)) existUser;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    function init(SCToken _SCH) public initializer {
        grantRole(ADMIN_ROLE, msg.sender);
        setSCH(_SCH);
    }

//设置代币
    function setSCH(SCToken _SCH) internal onlyRole(ADMIN_ROLE) {
        SCH = _SCH;
        emit SCHToken(address(_SCH));
    }

    function addPool(uint256 wight, address _tokenAddress,uint256 _totalStakeAmount, uint256 _minStakeAmount, bool isUpdatePool)
    public
    onlyRole(ADMIN_ROLE)
    {
        if (isUpdatePool) {
            _updatePools();
        }
        totalWight += wight;

        pools.push(Pool({
            tokenAddress: _tokenAddress,
            wight: wight,
            totalStakeAmount: _totalStakeAmount,
            lastBlockNumber: block.number,
            totalReward: 0,
            accRCCPerST: 0,
            rccPerST:0,
            minStakeAmount: _minStakeAmount
        }));

        poolsMapping[pools.length - 1] = pools[pools.length - 1];

    }

    function _updatePools() internal {

        require(pools.length > 0, "current pool not init");

        for (uint256 i = 0; i < pools.length; i++) {
            _updatePool(i);
        }
    }


    function _updatePool(uint256 _pid) internal checkPid(_pid){
        Pool storage pool=pools[_pid];
        uint256 currentBlock = block.number;
        uint256 poolBlock = pool.lastBlockNumber;
        uint256 weight = pool.wight;
        require(currentBlock > poolBlock, "current pool dont need update");
        (,uint256 reward) = (currentBlock - poolBlock).tryMul(weight);
        (, uint256 totalReward) = reward.tryDiv(totalWight);

        pool.totalReward += totalReward;
        pool.lastBlockNumber = currentBlock;
        //这里计算阶段性每个质押币获取的奖励数
        (, uint256 rewardSCHST) = reward.tryDiv(pool.totalStakeAmount);
        pool.accRCCPerST += rewardSCHST;
        (, uint256 perSCHST) = pool.totalReward.tryDiv(pool.totalStakeAmount);
        pool.rccPerST = perSCHST;
    }

    function _authorizeUpgrade(address newImplementation)
    internal
    override
    onlyRole(ADMIN_ROLE)
    {}

    //解除质押
    function pauseStake(uint256 _pid, address _user, uint256 _amount) public checkPid(_pid) checkUser(_user){

        require(_user == msg.sender, "only user can pause stake");

        require(_pid <= pools.length, "pid error");
        Pool storage pool = pools[_pid];
        require(pool.minStakeAmount <= _amount, "stake amount lass than minStakeAmount");

        require(pool.totalStakeAmount >= _amount, "amount error");

        User storage user = usersMapping[_pid][_user];

        require(user.stakeAmount >= _amount, "balance not enough");

        _updatePool(_pid);

        ( ,uint256 _pendingRCC) = _amount.tryMul(pool.rccPerST);
        user.pendingRCC += _pendingRCC;

        user.requests.push(Request({amount: _amount, rewardSCH: _pendingRCC}));

        emit RequestStake(_user, _pid, _amount);

    }

    function getReward(uint256 _pid, address _user) public checkPid(_pid) onlyRole(ADMIN_ROLE) {

        require(_pid <= pools.length, "pid error");

        require(existUser[_pid][_user], "user not exist");

        User storage user = usersMapping[_pid][_user];

        Request[] memory _requests=user.requests;

        require(_requests.length>0,"no request");

        uint256 sumAmount=0;
        uint256 sumReward=0;

        uint256 index=0;

        while(_requests.length>0){
            Request memory request=_requests[index];

            //这里要判断当前block是否已经领取过奖励
            user.stakeAmount -= request.amount;

            sumAmount+=request.amount;
            sumReward+=request.rewardSCH;
        }
        /*更新用户信息*/
        user.finishedRCC += sumReward;

        pools[_pid].totalStakeAmount -= sumAmount;
        pools[_pid].totalReward -= sumReward;
        _updatePool(_pid);

        SCH.transfer(_user, sumReward);
    }

    modifier checkPid(uint256 _pid){
        require(_pid<pools.length, "must send from SCH");
        _;
    }

    modifier checkUser(address userAddress){
        require(userAddress == msg.sender, "only user can getReward");
        _;
    }
}
