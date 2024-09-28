// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import {AutomationCompatibleInterface} from "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";

import {VRFConsumerBaseV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import {VRFV2PlusClient} from "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";

    error Raffle_Winner_Call_Fail();

contract Raffle is VRFConsumerBaseV2Plus, AutomationCompatibleInterface {
    //the min of fund
    uint256 private immutable i_entranceFee;

    //status machine
    enum Status {
        OPEN,
        PENDING,
        CLOSED
    }

    //current status
    Status public s_status;

    //VRF's gas lane hash
    bytes32 private immutable i_keyHash;

    //The subscription ID that this contract uses for funding requests.
    uint256 private immutable i_subscriptionId;

    //VRF confirm num
    uint16 private constant REQUEST_CONFIRMATIONS = 3;

    //VRF callback gas limit
    uint32 private immutable i_callbackGasLimit;

    //VRF random num
    uint16 private constant NUM_WORDS = 1;

    address private s_recentWinner;

    address payable[] private s_users;

    //VRF perform the new time;
    uint256 private s_lastTimeStamp;

    uint256 private immutable i_interval;

    mapping(address => uint256) private s_user_amount;

    event VRFRequest(uint256 requestId);

    event WinnerAddress(address winnerAddress);

    /**
     * _vrfCoordinator:通过VRF去Create Subscription，然后成功之后返回的VRF Coordinator address:
     */
    constructor(
        uint256 _entranceFee,
        bytes32 keyHash,
        uint256 subscriptionId,
        uint32 callbackGasLimit,
        address _vrfCoordinator,
        uint256 interval
    ) VRFConsumerBaseV2Plus(_vrfCoordinator) {
        i_entranceFee = _entranceFee;
        i_keyHash = keyHash;
        i_subscriptionId = subscriptionId;
        i_callbackGasLimit = callbackGasLimit;
        s_lastTimeStamp = block.timestamp;
        i_interval = interval;
        //初始化状态
        s_status = Status.OPEN;
    }

    function enterRaffle() public payable {
        require(Status.OPEN == s_status, "this status dont allow to enter...");
        uint256 value = msg.value;
        require(value < i_entranceFee, "not enougth to entrance...");
        s_users.push(payable(msg.sender));
        s_user_amount[msg.sender] = value;
    }

    function requestRandomWords(bool enableNativePayment) internal onlyOwner {
        require(s_users.length > 0, "no user to raffle");
        // Will revert if subscription is not set and funded.
        uint256 requestId = s_vrfCoordinator.requestRandomWords(
            VRFV2PlusClient.RandomWordsRequest({
                keyHash: i_keyHash,
                subId: i_subscriptionId,
                requestConfirmations: REQUEST_CONFIRMATIONS,
                callbackGasLimit: i_callbackGasLimit,
                numWords: NUM_WORDS,
                extraArgs: VRFV2PlusClient._argsToBytes(
                    VRFV2PlusClient.ExtraArgsV1({
                        nativePayment: enableNativePayment
                    })
                )
            })
        );
        emit VRFRequest(requestId);
    }

    function fulfillRandomWords(uint256, uint256[] calldata _randomWords)
    internal
    override
    {
        uint256 randomNum = _randomWords[0];
        uint256 index = randomNum % s_users.length;
        address payable recentWinner = s_users[index];
        s_recentWinner = recentWinner;
        (bool success, ) = recentWinner.call{value: address(this).balance}("");

        if (!success) {
            revert Raffle_Winner_Call_Fail();
        }
        s_status=Status.OPEN;
        emit WinnerAddress(recentWinner);
    }
    /**
     * this is upkeep's checkUpkeep method that check if it can perform performUpkeep;
     */
    function checkUpkeep(
        bytes calldata /*checkData*/
    )
    external
    override
    returns (
        bool upkeepNeeded,
        bytes memory /*performData*/
    )
    {
        //判定时间到了没有
        bool timeOver = (block.timestamp - s_lastTimeStamp > i_interval);
        //判断状态机
        bool statusChanged = (Status.OPEN == s_status);
        //判断有没有人
        bool hasUsers = (s_users.length > 0);

        bool hasBalance=(address(this).balance>0);

        upkeepNeeded = timeOver && statusChanged && hasUsers&&hasBalance;

        s_status = Status.PENDING;

        return (upkeepNeeded, "");
    }

    /**
     * if checkUpkeep return "true",it is performed. ether or it is not performed.
     */
    function performUpkeep(
        bytes calldata /* performData */
    ) external override {
        requestRandomWords(true);
    }

    function getCurrentStatus() public view returns (Status) {
        return s_status;
    }

    function getInterval() public view returns (uint256) {
        return i_interval;
    }


    function getEntranceFee() public view returns (uint256) {
        return i_entranceFee;
    }

    function getRecentWinner() public view returns(address) {
        return s_recentWinner;
    }
}
