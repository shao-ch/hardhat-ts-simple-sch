// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";


contract SchERC20 is ERC20 {

    constructor(uint256 initialSupply) ERC20("SchERC20", "SchERC") {
        _mint(msg.sender, initialSupply);
    }

}