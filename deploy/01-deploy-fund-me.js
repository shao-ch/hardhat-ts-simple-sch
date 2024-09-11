const {network} = require("hardhat");
const {networkConfig, NETWORK_NAME} = require("../helper-hardhat-config");
const {verify} = require("../utils/Vertify");
require("dotenv").config();
module.exports = async ({deployments, getNamedAccounts}) => {
    const {deploy, log} = deployments;
    const {deployer} = await getNamedAccounts();


    const chainId = network.config.chainId;
    console.log(chainId);
    let _address;
    if (networkConfig[chainId] && NETWORK_NAME.includes(networkConfig[chainId].name)) {
        const aggregatorV3 = await deployments.get("MockV3Aggregator");
        _address = aggregatorV3.address;
        log(`this is local net ,${_address}`);
    } else {
        _address = networkConfig[chainId].ethUsdPriceFeed;
        log(`this is sepolia network ,${_address}`);

    }

    let _args = [_address];
    console.log(deployer);
    console.log(_args);
    const fundMe = await deploy("FundMe", {
        contract: "FundMe",
        from: deployer,
        log: true,
        args: _args,
        /*how many block are needed to confirm */
        waitConfirmations: network.config.blockConfirmations || 1,
    });
    log("fundMe deployed....");

    log(`fundMe address is :${fundMe.address}`);

    //vertify
    if (!NETWORK_NAME.includes(networkConfig[chainId].name)
        && process.env.EHTERSCAN_API_HARDHAT_KEY) {
        log("fundMe verify starting....");
        /*注意这里需要有 etherscan: {
        apiKey: process.env.EHTERSCAN_API_HARDHAT_KEY,
    }的相关配置*/
        await verify(fundMe.address, _args);
        log("fundMe had been verified and  deployed....");
    }
}

module.exports.tags = ["all", "fundMe"];