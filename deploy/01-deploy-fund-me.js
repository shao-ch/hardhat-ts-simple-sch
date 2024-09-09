const {network} = require("hardhat");
const {networkConfig,NETWORK_NAME} = require("../helper-hardhat-config");
const {verify} = require("../utils/Vertify");

module.exports = async ({deployments, getNamedAccounts}) => {
    const {deploy, log, get} = deployments;
    const {user} = await getNamedAccounts();


    const chainId = network.config.chainId;
    let _address;
    if (networkConfig[chainId] && NETWORK_NAME.includes(networkConfig[chainId].name)) {
        const aggregatorV3 = await deployments.get("MockV3Aggregator");
        _address = aggregatorV3.address;
    } else {
        _address = networkConfig[chainId].ethUsdPriceFeed;
    }

    let _args=[_address];
    await deploy("FundMe", {
        contract: "FundMe",
        from: user,
        log: true,
        args: _args,
    });
    log("fundMe deployed....");
    const FundMe = await get("FundMe");
    //vertify
    if (networkConfig[chainId] && !NETWORK_NAME.includes(networkConfig[chainId].name
    && process.env.EHTERSCAN_API_HARDHAT_KEY)){
        log("fundMe verify starting....");
        /*注意这里需要有 etherscan: {
        apiKey: process.env.EHTERSCAN_API_HARDHAT_KEY,
    }的相关配置*/
        await verify(FundMe.address,_args);
    }

    // log(fundMe);
    // const fundMe=await fundMeFactory.deployed();
    // const tx=await fundMe.fund();
    // log(tx);
}

module.exports.tags = ["all", "fundMe"];