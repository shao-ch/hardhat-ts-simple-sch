// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "./NumberUtils.sol";


    error FundMe_Not_Owner();

contract FundMe {

    using NumberUtils for uint256;

    MockV3Aggregator private aggregatorV3;

    uint256 private MINIMUM_VALUE = 0;

    address[] private funders;
    address public immutable i_owner;
    mapping(address => uint256) public funderToValue;

    constructor(address _address){
        i_owner = msg.sender;
        aggregatorV3 = MockV3Aggregator(_address);
    }

    function getFunders() public view returns (address[] memory) {
        return funders;
    }


    function getFunderValue(address _address) public view returns (uint256) {
        return funderToValue[_address];
    }

    /*给合约转账*/
    function fund() public payable {
        uint256 value = msg.value.convertAmount(aggregatorV3);
        require(value > MINIMUM_VALUE, "Don't enough to send");

        funders.push(msg.sender);
        funderToValue[msg.sender] = value;
    }

    function withdrawV2() public {
        for (uint256 i = 0; i < funders.length; i++) {
            funderToValue[funders[i]] = 0;
        }
        delete funders;
        if (address(this).balance > 0) {
            (bool isSuccess,) = payable(msg.sender).call{value: address(this).balance}("");
            require(isSuccess, "withdraw fail");
        }
    }

    function cheapWithdraw() public {
        address[] memory i_memory = funders;

        for (uint256 i = 0; i < i_memory.length; i++) {
            funderToValue[i_memory[i]] = 0;
        }
        funders = new address[](0);

        if (address(this).balance > 0) {
            (bool success,) = payable(msg.sender).call{value: address(this).balance}("");
            require(success, "withdraw fail");
        }

    }


    function getAggregatorV3() public view returns (MockV3Aggregator) {
        return aggregatorV3;
    }

    /*
     * @Desc: receive 函数表示转账函数，如果入参会执行该函数，就当执行如：msg.sender.transfer,send，如果有入参就执行fallback，没有执行receive
    */
    fallback() external payable {
        fund();
    }

    /*
     * @Desc: receive 函数表示转账函数，如果入参会执行该函数，就当执行如：msg.sender.transfer,send，如果有入参就执行fallback，没有执行receive
    */
    receive() external payable {
        fund();
    }

    modifier checkFunder(){
        if ((msg.sender != i_owner)) {
            revert FundMe_Not_Owner();
        }
        _;
    }
}