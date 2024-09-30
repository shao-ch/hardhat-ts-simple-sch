// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract BoxV1 {
    uint256 private value;

    function initialize(uint256 initialValue) public {
        value = initialValue;
    }

    function store(uint256 newValue) public {
        value = newValue;
    }

    function retrieve() public view returns (uint256) {
        return value;
    }
}
