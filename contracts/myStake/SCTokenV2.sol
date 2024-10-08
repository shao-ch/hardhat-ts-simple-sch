// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import  "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

//设置一个可升级合约
contract SCTokenV2 is Initializable, ERC20Upgradeable, OwnableUpgradeable {


    function initialize(string memory _name,uint256 _mintCount, string memory _symbol) public initializer  {
        __ERC20_init(_name, _symbol);
        __Ownable_init(msg.sender);
        /*这里的10是一个basic，代表10的位数*/
        _mint(msg.sender,_mintCount*10**decimals());
    }

    // 铸造代币
    function mint(uint256 amount) public onlyOwner {
        _mint(msg.sender, amount);
    }
    // 销毁代币
    function burn(uint256 value) public onlyOwner {
        _burn(_msgSender(), value);
    }
}