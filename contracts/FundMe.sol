// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "./NumberUtils.sol";
contract FundMe{

    using NumberUtils for uint256;

    uint256 private MINIMUM_VALUE=5;

    address[] public funders;

    address public immutable i_owner;

    mapping(address=>uint256) public funderToValue;

    constructor(){
        i_owner = msg.sender;
    }

    /*给合约转账*/
    function fund() public payable  {
        uint256 value= msg.value.convertAmount();
        require(value>MINIMUM_VALUE,"Don't enough to send");

        funders.push(msg.sender);
        funderToValue[msg.sender] = value;
    }

    function withdraw() public {
        for(uint256 i=0;i<funders.length;i++){
            funderToValue[funders[i]]=0;
        }
        funders=new address[](0);
        (bool isSuccess,)= payable(msg.sender).call{value:address(this).balance}("");

        require(isSuccess,"withdraw fail");
    }

    modifier checkFunder(){
        require(msg.sender == i_owner, "You are not the owner");
        _;
    }
}