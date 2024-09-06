// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

library NumberUtils {

    /*这里的单位是usd/eth*/
    function getPrice(AggregatorV3Interface aggregatorV3) internal view returns (uint256)  {
        /*获取最近的价格*/
        (, int256 price,,,) = aggregatorV3.latestRoundData();
        /*获取单价*/
        uint256 unit = uint256(aggregatorV3.decimals());

        return uint256(price) * unit ** 10;
    }

    /*_ethCount,这里是wei，所以要除1e18*/
    function convertAmount(uint256 _ethCount,AggregatorV3Interface aggregatorV3) internal view returns (uint256)  {
        uint256 price = getPrice(aggregatorV3);
        return _ethCount * price / 1e18;
    }

//    function getVersion() internal returns (uint256){
//        AggregatorV3Interface aggregatorV3 = AggregatorV3Interface(0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43);
//        return aggregatorV3.version();
//    }

}