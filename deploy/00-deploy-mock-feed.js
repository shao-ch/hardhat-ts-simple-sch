const {network} = require("hardhat");

const {networkConfig}=require("../helper-hardhat-config");

module.exports = async ({deployments, getNamedAccounts,ethers}) => {
    const {deploy, log} = deployments;

    const {deployer} = await getNamedAccounts();


    const chainId=network.config.chainId;
    log(chainId);
    const ethUsdPriceFeedAddress =networkConfig[chainId].ethUsdPriceFeed;
    const mock =await deploy("MockV3Aggregator", {
        contract: "MockV3Aggregator",
        from: ethUsdPriceFeedAddress,
        /*这里的8,代表单位，代表扩大了多少倍，后面表示price*/
        args: [8, 200000000000],
        log: true
    });
    log(mock.address);
    const mockV3= await deployments.get("MockV3Aggregator");
    log(mockV3.address);
    log("Mock deployed...");


}

module.exports.tags = ["all","mocks"];